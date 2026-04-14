import { db } from '../db/index.js';
import { tenantConnections, messageLog } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { decrypt } from '../integrations/crypto.js';

const WA_API_VERSION = 'v21.0';

interface WhatsAppCreds {
  phone_number_id: string;
  access_token: string;
  business_account_id: string;
}

interface WASendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function getWhatsAppCreds(tenantId: string): Promise<WhatsAppCreds> {
  const conn = await db.query.tenantConnections.findFirst({
    where: and(
      eq(tenantConnections.tenantId, tenantId),
      eq(tenantConnections.platform, 'whatsapp'),
    ),
  });
  if (!conn || conn.health === 'revoked') {
    throw new Error(`No active WhatsApp connection for tenant ${tenantId}`);
  }
  return JSON.parse(decrypt(conn.encryptedCredentials)) as WhatsAppCreds;
}

/**
 * Normalize an Indonesian phone number to E.164 format.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('62')) return digits;
  return `62${digits}`;
}

/**
 * Send a plain text WhatsApp message.
 */
export async function sendWhatsApp(
  tenantId: string,
  to: string,
  body: string,
  templateId?: string,
): Promise<WASendResult> {
  const creds = await getWhatsAppCreds(tenantId);
  const phone = normalizePhone(to);

  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: { body },
  };

  const res = await fetch(
    `https://graph.facebook.com/${WA_API_VERSION}/${creds.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creds.access_token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await res.json() as {
    messages?: Array<{ id: string }>;
    error?: { message: string };
  };

  const success = res.ok && !!data.messages?.[0]?.id;
  const messageId = data.messages?.[0]?.id;
  const error = data.error?.message;

  // Log
  await db.insert(messageLog).values({
    tenantId,
    channel: 'whatsapp',
    recipient: phone,
    templateId,
    content: body,
    status: success ? 'sent' : 'failed',
    externalMessageId: messageId,
    errorMessage: error,
    sentAt: success ? new Date() : undefined,
  });

  return { success, messageId, error };
}

/**
 * Send a WhatsApp template message (pre-approved by Meta).
 */
export async function sendWhatsAppTemplate(
  tenantId: string,
  to: string,
  templateName: string,
  languageCode = 'id',
  components: unknown[] = [],
): Promise<WASendResult> {
  const creds = await getWhatsAppCreds(tenantId);
  const phone = normalizePhone(to);

  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  };

  const res = await fetch(
    `https://graph.facebook.com/${WA_API_VERSION}/${creds.phone_number_id}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creds.access_token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  const data = await res.json() as {
    messages?: Array<{ id: string }>;
    error?: { message: string };
  };

  const success = res.ok && !!data.messages?.[0]?.id;

  await db.insert(messageLog).values({
    tenantId,
    channel: 'whatsapp',
    recipient: phone,
    templateId: templateName,
    content: `[template:${templateName}]`,
    status: success ? 'sent' : 'failed',
    externalMessageId: data.messages?.[0]?.id,
    errorMessage: data.error?.message,
    sentAt: success ? new Date() : undefined,
  });

  return { success, messageId: data.messages?.[0]?.id, error: data.error?.message };
}
