import { Hono } from 'hono';
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '../config.js';
import { ingestEvent } from '../cdp/events.js';
import { db } from '../db/index.js';
import { dataSnapshots, messageLog } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const webhooks = new Hono();

function verifySignature(body: string, signature: string, secret: string): boolean {
  const expected = `sha256=${createHmac('sha256', secret).update(body, 'utf8').digest('hex')}`;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// POST /webhooks/ayo
webhooks.post('/ayo', async (c) => {
  const rawBody = await c.req.text();
  const sig = c.req.header('X-Signature') ?? '';

  if (!verifySignature(rawBody, sig, env.WEBHOOK_SECRET)) {
    return c.json({ error: 'invalid_signature' }, 401);
  }

  const payload = JSON.parse(rawBody) as {
    tenant_id?: string;
    event?: string;
    booking?: {
      id?: string;
      customer_id?: string;
      customer_name?: string;
      customer_phone?: string;
      customer_email?: string;
      service_id?: string;
      service_name?: string;
      amount?: number;
      date?: string;
    };
  };

  const tenantId = payload.tenant_id;
  if (!tenantId) return c.json({ error: 'missing_tenant_id' }, 400);

  const booking = payload.booking;
  if (booking?.id && booking.customer_id) {
    await ingestEvent({
      type: payload.event === 'booking.completed' ? 'booking.completed' : 'booking.created',
      tenantId,
      customerId: booking.customer_id,
      properties: {
        booking_id: booking.id,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        customer_email: booking.customer_email,
        service_id: booking.service_id ?? '',
        service_name: booking.service_name ?? '',
        amount: booking.amount ?? 0,
      },
    });
  }

  return c.json({ received: true });
});

// POST /webhooks/xendit
webhooks.post('/xendit', async (c) => {
  const rawBody = await c.req.text();
  const callbackToken = c.req.header('x-callback-token') ?? '';
  if (callbackToken !== env.WEBHOOK_SECRET) {
    return c.json({ error: 'invalid_token' }, 401);
  }

  const payload = JSON.parse(rawBody) as {
    tenant_id?: string;
    external_id?: string;
    status?: string;
    amount?: number;
    currency?: string;
    payment_method?: string;
    paid_at?: string;
    id?: string;
  };

  const tenantId = payload.tenant_id ?? payload.external_id?.split('-')[0];
  if (!tenantId) return c.json({ received: true });

  const date = (payload.paid_at ?? new Date().toISOString()).slice(0, 10);

  await db.insert(dataSnapshots).values({
    tenantId,
    snapshotType: 'xendit_payment',
    data: payload as Record<string, unknown>,
    periodStart: date,
    periodEnd: date,
  });

  if (payload.status === 'PAID') {
    await ingestEvent({
      type: 'payment.received',
      tenantId,
      properties: {
        amount: payload.amount ?? 0,
        currency: payload.currency ?? 'IDR',
        payment_method: payload.payment_method,
        xendit_id: payload.id,
      },
      timestamp: payload.paid_at,
    });
  }

  return c.json({ received: true });
});

// POST /webhooks/cdp/:tenantId
webhooks.post('/cdp/:tenantId', async (c) => {
  const tenantId = c.req.param('tenantId');
  const rawBody = await c.req.text();
  const sig = c.req.header('X-Signature') ?? '';

  if (env.NODE_ENV === 'production' && !verifySignature(rawBody, sig, env.WEBHOOK_SECRET)) {
    return c.json({ error: 'invalid_signature' }, 401);
  }

  const events = JSON.parse(rawBody) as unknown[];
  const arr = Array.isArray(events) ? events : [events];

  for (const raw of arr) {
    const event = raw as {
      type?: string;
      customerId?: string;
      properties?: Record<string, unknown>;
      timestamp?: string;
    };

    await ingestEvent({
      type: (event.type as 'booking.created') ?? 'custom',
      tenantId,
      customerId: event.customerId,
      properties: event.properties ?? {},
      timestamp: event.timestamp,
    });
  }

  return c.json({ ingested: arr.length });
});

// GET /webhooks/whatsapp — Meta verification challenge
webhooks.get('/whatsapp', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');

  if (mode === 'subscribe' && token === env.WEBHOOK_SECRET) {
    return c.text(challenge ?? '', 200);
  }
  return c.json({ error: 'forbidden' }, 403);
});

// POST /webhooks/whatsapp — delivery status updates
webhooks.post('/whatsapp', async (c) => {
  const body = await c.req.json() as {
    entry?: Array<{
      changes?: Array<{
        value?: {
          statuses?: Array<{ id: string; status: string }>;
        };
      }>;
    }>;
  };

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const status of change.value?.statuses ?? []) {
        const newStatus =
          status.status === 'delivered' ? 'delivered' as const
          : status.status === 'read' ? 'read' as const
          : null;

        if (newStatus) {
          await db
            .update(messageLog)
            .set({
              status: newStatus,
              deliveredAt: status.status === 'delivered' ? new Date() : undefined,
              readAt: status.status === 'read' ? new Date() : undefined,
            })
            .where(eq(messageLog.externalMessageId, status.id));
        }
      }
    }
  }

  return c.json({ received: true });
});

export { webhooks as webhookRoutes };
