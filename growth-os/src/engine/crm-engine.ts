import { db } from '../db/index.js';
import { customerProfiles, tenants } from '../db/schema.js';
import { eq, and, lte, sql } from 'drizzle-orm';
import { ayoIntegration, type AyoBookingEvent } from '../integrations/ayo.js';
import { dispatch } from '../messaging/dispatcher.js';

export type CustomerSegment = 'new' | 'active' | 'vip' | 'at_risk' | 'churned';

interface SegmentationRule {
  segment: CustomerSegment;
  minBookings?: number;
  minLtv?: number;
  maxDaysSinceBooking?: number;
  minDaysSinceBooking?: number;
}

const SEGMENTATION_RULES: SegmentationRule[] = [
  { segment: 'vip', minBookings: 5, minLtv: 5_000_000 },
  { segment: 'active', minBookings: 2, maxDaysSinceBooking: 30 },
  { segment: 'at_risk', minBookings: 1, minDaysSinceBooking: 30, maxDaysSinceBooking: 90 },
  { segment: 'churned', minBookings: 1, minDaysSinceBooking: 90 },
  { segment: 'new' },  // fallback
];

/**
 * Upsert a customer profile from a booking event.
 */
export async function upsertCustomerFromBooking(
  tenantId: string,
  booking: AyoBookingEvent,
): Promise<void> {
  const existing = await db.query.customerProfiles.findFirst({
    where: and(
      eq(customerProfiles.tenantId, tenantId),
      eq(customerProfiles.externalId, booking.customerId),
    ),
  });

  const bookingDate = new Date(booking.date);

  if (!existing) {
    await db.insert(customerProfiles).values({
      tenantId,
      externalId: booking.customerId,
      name: booking.customerName,
      phone: booking.customerPhone,
      email: booking.customerEmail,
      lifetimeValue: booking.amount,
      totalBookings: 1,
      lastBookingAt: bookingDate,
      segment: 'new',
      metadata: { source: 'ayo_booking' },
    });
  } else {
    await db
      .update(customerProfiles)
      .set({
        name: booking.customerName ?? existing.name,
        phone: booking.customerPhone ?? existing.phone,
        email: booking.customerEmail ?? existing.email,
        lifetimeValue: existing.lifetimeValue + booking.amount,
        totalBookings: existing.totalBookings + 1,
        lastBookingAt:
          bookingDate > (existing.lastBookingAt ?? new Date(0))
            ? bookingDate
            : existing.lastBookingAt,
        updatedAt: new Date(),
      })
      .where(eq(customerProfiles.id, existing.id));
  }
}

/**
 * Re-segment all customers for a tenant based on booking history.
 */
export async function resegmentCustomers(tenantId: string): Promise<{ updated: number }> {
  const profiles = await db.query.customerProfiles.findMany({
    where: eq(customerProfiles.tenantId, tenantId),
  });

  let updated = 0;
  const now = Date.now();

  for (const profile of profiles) {
    const daysSince = profile.lastBookingAt
      ? Math.floor((now - profile.lastBookingAt.getTime()) / 86_400_000)
      : 9999;

    let assignedSegment: CustomerSegment = 'new';

    for (const rule of SEGMENTATION_RULES) {
      const matchesBookings = rule.minBookings === undefined || profile.totalBookings >= rule.minBookings;
      const matchesLtv = rule.minLtv === undefined || profile.lifetimeValue >= rule.minLtv;
      const matchesMaxDays = rule.maxDaysSinceBooking === undefined || daysSince <= rule.maxDaysSinceBooking;
      const matchesMinDays = rule.minDaysSinceBooking === undefined || daysSince >= rule.minDaysSinceBooking;

      if (matchesBookings && matchesLtv && matchesMaxDays && matchesMinDays) {
        assignedSegment = rule.segment;
        break;
      }
    }

    if (assignedSegment !== profile.segment) {
      await db
        .update(customerProfiles)
        .set({ segment: assignedSegment, updatedAt: new Date() })
        .where(eq(customerProfiles.id, profile.id));
      updated++;
    }
  }

  return { updated };
}

/**
 * Send win-back campaign to at-risk and churned customers.
 */
export async function runWinBackCampaign(
  tenantId: string,
  channel: 'whatsapp' | 'email' = 'whatsapp',
  discount = 10,
): Promise<{ sent: number; failed: number }> {
  const atRiskOrChurned = await db.query.customerProfiles.findMany({
    where: and(
      eq(customerProfiles.tenantId, tenantId),
      sql`${customerProfiles.segment} IN ('at_risk', 'churned')`,
    ),
  });

  const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) });
  const businessName = tenant?.name ?? 'kami';

  let sent = 0;
  let failed = 0;
  const expiryDate = new Date(Date.now() + 7 * 86_400_000).toLocaleDateString('id-ID');

  for (const customer of atRiskOrChurned) {
    const recipient = channel === 'whatsapp' ? customer.phone : customer.email;
    if (!recipient) continue;

    const daysSince = customer.lastBookingAt
      ? Math.floor((Date.now() - customer.lastBookingAt.getTime()) / 86_400_000)
      : 0;

    const result = await dispatch({
      tenantId,
      channel,
      recipient,
      templateKey: channel === 'whatsapp' ? 'win_back_wa' : 'win_back_email',
      vars: {
        name: customer.name ?? 'Pelanggan',
        business_name: businessName,
        days_since: daysSince,
        discount,
        expiry_date: expiryDate,
        booking_url: `https://ayo.co.id/${tenantId}/book`,
      },
    });

    if (result.success) sent++;
    else failed++;
  }

  return { sent, failed };
}

/**
 * Sync recent bookings from AYO and upsert into customer profiles.
 */
export async function syncCustomersFromAyo(
  tenantId: string,
  fromDate: string,
  toDate: string,
): Promise<{ synced: number }> {
  const bookings = await ayoIntegration.getRecentBookings(tenantId, fromDate, toDate);
  for (const booking of bookings) {
    await upsertCustomerFromBooking(tenantId, booking);
  }
  return { synced: bookings.length };
}
