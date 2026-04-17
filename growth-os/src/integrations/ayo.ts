import { env } from '../config.js';
import { db } from '../db/index.js';
import { dataSnapshots, tenantConnections } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { decrypt } from './crypto.js';

export interface AyoMetrics {
  grossRevenue: number;
  bookingCount: number;
  averageBookingValue: number;
  date: string;
}

export interface AyoBookingEvent {
  bookingId: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  date: string;
  status: 'confirmed' | 'cancelled' | 'completed';
}

async function getAyoToken(tenantId: string): Promise<string> {
  const conn = await db.query.tenantConnections.findFirst({
    where: and(
      eq(tenantConnections.tenantId, tenantId),
      eq(tenantConnections.platform, 'ayo_booking'),
    ),
  });
  if (!conn) throw new Error(`No AYO connection for tenant ${tenantId}`);
  const creds = JSON.parse(decrypt(conn.encryptedCredentials)) as { api_key: string };
  return creds.api_key;
}

export const ayoIntegration = {
  getDailyMetrics: async (tenantId: string, date: string): Promise<AyoMetrics> => {
    const token = await getAyoToken(tenantId);

    const response = await fetch(`${env.AYO_API_BASE}/v1/reports/daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ tenant_id: tenantId, date }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`AYO API error ${response.status}: ${text}`);
    }

    const data = await response.json() as {
      gross_revenue?: number;
      booking_count?: number;
      avg_booking_value?: number;
    };

    return {
      grossRevenue: data.gross_revenue ?? 0,
      bookingCount: data.booking_count ?? 0,
      averageBookingValue: data.avg_booking_value ?? 0,
      date,
    };
  },

  /**
   * Ingest a booking webhook event from AYO into the data_snapshots table.
   */
  ingestBookingEvent: async (tenantId: string, payload: AyoBookingEvent): Promise<void> => {
    await db.insert(dataSnapshots).values({
      tenantId,
      snapshotType: 'ayo_booking',
      data: payload as unknown as Record<string, unknown>,
      periodStart: payload.date,
      periodEnd: payload.date,
    });
  },

  /**
   * Fetch recent bookings for CRM enrichment.
   */
  getRecentBookings: async (
    tenantId: string,
    from: string,
    to: string,
  ): Promise<AyoBookingEvent[]> => {
    const token = await getAyoToken(tenantId);

    const response = await fetch(`${env.AYO_API_BASE}/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ tenant_id: tenantId, date_from: from, date_to: to }),
    });

    if (!response.ok) {
      throw new Error(`AYO bookings API error ${response.status}`);
    }

    const data = await response.json() as { bookings?: AyoBookingEvent[] };
    return data.bookings ?? [];
  },
};
