import { db } from '../db/index.js';
import { customerProfiles, dataSnapshots } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { upsertCustomerFromBooking } from '../engine/crm-engine.js';
import type { AyoBookingEvent } from '../integrations/ayo.js';

export type CdpEventType =
  | 'booking.created'
  | 'booking.completed'
  | 'booking.cancelled'
  | 'payment.received'
  | 'customer.identified'
  | 'custom';

export interface CdpEvent {
  type: CdpEventType;
  tenantId: string;
  customerId?: string;
  properties: Record<string, unknown>;
  timestamp?: string;
}

/**
 * Ingest a raw CDP event.
 * Routes to the correct handler based on event type.
 */
export async function ingestEvent(event: CdpEvent): Promise<void> {
  const ts = event.timestamp ?? new Date().toISOString();
  const date = ts.slice(0, 10);

  // Persist raw event
  await db.insert(dataSnapshots).values({
    tenantId: event.tenantId,
    snapshotType: `cdp_event:${event.type}`,
    data: { ...event.properties, _type: event.type, _customerId: event.customerId } as Record<string, unknown>,
    periodStart: date,
    periodEnd: date,
  });

  // Route to handler
  switch (event.type) {
    case 'booking.created':
    case 'booking.completed': {
      const booking = buildBookingEvent(event, ts);
      if (booking) await upsertCustomerFromBooking(event.tenantId, booking);
      break;
    }
    case 'payment.received': {
      await handlePaymentReceived(event);
      break;
    }
    case 'customer.identified': {
      await handleCustomerIdentified(event);
      break;
    }
    default:
      break;
  }
}

function buildBookingEvent(event: CdpEvent, timestamp: string): AyoBookingEvent | null {
  const p = event.properties;
  if (!event.customerId || typeof p['booking_id'] !== 'string') return null;

  return {
    bookingId: p['booking_id'] as string,
    customerId: event.customerId,
    customerName: p['customer_name'] as string | undefined,
    customerPhone: p['customer_phone'] as string | undefined,
    customerEmail: p['customer_email'] as string | undefined,
    serviceId: p['service_id'] as string ?? '',
    serviceName: p['service_name'] as string ?? '',
    amount: typeof p['amount'] === 'number' ? p['amount'] : 0,
    date: timestamp.slice(0, 10),
    status: event.type === 'booking.created' ? 'confirmed' : 'completed',
  };
}

async function handlePaymentReceived(event: CdpEvent): Promise<void> {
  if (!event.customerId) return;

  const profile = await db.query.customerProfiles.findFirst({
    where: and(
      eq(customerProfiles.tenantId, event.tenantId),
      eq(customerProfiles.externalId, event.customerId),
    ),
  });

  if (!profile) return;

  const amount = typeof event.properties['amount'] === 'number' ? event.properties['amount'] : 0;
  await db
    .update(customerProfiles)
    .set({
      lifetimeValue: profile.lifetimeValue + amount,
      updatedAt: new Date(),
    })
    .where(eq(customerProfiles.id, profile.id));
}

async function handleCustomerIdentified(event: CdpEvent): Promise<void> {
  if (!event.customerId) return;
  const p = event.properties;

  await db
    .insert(customerProfiles)
    .values({
      tenantId: event.tenantId,
      externalId: event.customerId,
      name: p['name'] as string | undefined,
      phone: p['phone'] as string | undefined,
      email: p['email'] as string | undefined,
      segment: 'new',
      metadata: { source: p['source'] ?? 'cdp' } as Record<string, unknown>,
    })
    .onConflictDoUpdate({
      target: [customerProfiles.tenantId, customerProfiles.externalId],
      set: {
        name: p['name'] as string | undefined,
        phone: p['phone'] as string | undefined,
        email: p['email'] as string | undefined,
        updatedAt: new Date(),
      },
    });
}
