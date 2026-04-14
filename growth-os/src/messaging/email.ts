import { env } from '../config.js';
import { db } from '../db/index.js';
import { messageLog } from '../db/schema.js';

const RESEND_API_URL = 'https://api.resend.com/emails';

interface EmailSendOptions {
  tenantId: string;
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  templateId?: string;
}

interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a transactional email via Resend.
 */
export async function sendEmail(opts: EmailSendOptions): Promise<EmailSendResult> {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_DOMAIN) {
    console.warn('[email] Resend not configured — skipping email send');
    return { success: false, error: 'resend_not_configured' };
  }

  const from = opts.from ?? `Growth OS <noreply@${env.RESEND_FROM_DOMAIN}>`;

  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      reply_to: opts.replyTo,
    }),
  });

  const data = await res.json() as { id?: string; message?: string; name?: string };
  const success = res.ok && !!data.id;
  const error = !success ? (data.message ?? 'unknown_error') : undefined;

  // Log to DB
  await db.insert(messageLog).values({
    tenantId: opts.tenantId,
    channel: 'email',
    recipient: opts.to,
    templateId: opts.templateId,
    content: opts.subject,
    status: success ? 'sent' : 'failed',
    externalMessageId: data.id,
    errorMessage: error,
    sentAt: success ? new Date() : undefined,
  });

  return { success, messageId: data.id, error };
}

/**
 * Send a batch of emails (up to 100 via Resend batch API).
 */
export async function sendEmailBatch(
  emails: EmailSendOptions[],
): Promise<EmailSendResult[]> {
  return Promise.all(emails.map((e) => sendEmail(e)));
}
