import { db } from '../db/index.js';
import { tenants } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { env } from '../config.js';

export interface AlertPayload {
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

const LEVEL_EMOJI: Record<AlertPayload['level'], string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '🔴',
  critical: '🚨',
};

/**
 * Send an alert to the tenant's configured webhook (Slack / Discord / custom).
 * Falls back to DEFAULT_ALERT_WEBHOOK_URL if tenant has no webhook configured.
 */
export async function sendAlert(tenantId: string, payload: AlertPayload): Promise<void> {
  let webhookUrl: string | undefined;

  try {
    const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) });
    webhookUrl = tenant?.alertWebhookUrl ?? env.DEFAULT_ALERT_WEBHOOK_URL;
  } catch {
    webhookUrl = env.DEFAULT_ALERT_WEBHOOK_URL;
  }

  if (!webhookUrl) {
    console.warn(`[alerts] No webhook configured for tenant ${tenantId} — skipping alert`);
    return;
  }

  const emoji = LEVEL_EMOJI[payload.level];
  const body = {
    text: `${emoji} *${payload.title}*`,
    attachments: [
      {
        color: payload.level === 'error' || payload.level === 'critical' ? 'danger'
          : payload.level === 'warning' ? 'warning' : 'good',
        fields: [
          { title: 'Tenant', value: tenantId, short: true },
          { title: 'Level', value: payload.level.toUpperCase(), short: true },
          { title: 'Message', value: payload.message, short: false },
          ...(payload.data
            ? [{ title: 'Data', value: JSON.stringify(payload.data, null, 2), short: false }]
            : []),
        ],
        footer: `Growth OS • ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`,
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`[alerts] Webhook delivery failed: ${res.status}`);
    }
  } catch (err) {
    console.error('[alerts] Webhook delivery error:', err);
  }
}

/**
 * Alert on ROAS drop below floor.
 */
export async function alertRoasDrop(
  tenantId: string,
  currentRoas: number,
  floor: number,
): Promise<void> {
  await sendAlert(tenantId, {
    level: 'warning',
    title: 'ROAS Di Bawah Target',
    message: `ROAS saat ini ${currentRoas.toFixed(2)}x, di bawah floor ${floor}x. Budget dikurangi secara otomatis.`,
    data: { currentRoas, floor },
  });
}

/**
 * Alert on low cash balance.
 */
export async function alertLowCash(
  tenantId: string,
  balance: number,
  reserve: number,
): Promise<void> {
  await sendAlert(tenantId, {
    level: 'critical',
    title: 'Saldo Kas Kritis',
    message: `Saldo Xendit Rp ${balance.toLocaleString('id-ID')} mendekati/melewati batas reserve Rp ${reserve.toLocaleString('id-ID')}.`,
    data: { balance, reserve },
  });
}
