import { sendWhatsApp } from './whatsapp.js';
import { sendEmail } from './email.js';
import { renderTemplate, BUILTIN_TEMPLATES, type BuiltinTemplateKey, type TemplateVars } from './templates.js';
import { db } from '../db/index.js';
import { messageTemplates } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export interface DispatchPayload {
  tenantId: string;
  channel: 'whatsapp' | 'email';
  recipient: string;       // phone for WA, email address for email
  templateKey?: BuiltinTemplateKey;
  customTemplateName?: string;
  vars?: TemplateVars;
  // Override the rendered body directly (skips template lookup)
  directBody?: string;
  directSubject?: string;
}

export interface DispatchResult {
  success: boolean;
  channel: string;
  messageId?: string;
  error?: string;
}

/**
 * Unified message dispatcher — resolves template, renders vars, sends via channel.
 */
export async function dispatch(payload: DispatchPayload): Promise<DispatchResult> {
  const vars = payload.vars ?? {};
  let body = payload.directBody ?? '';
  let subject = payload.directSubject ?? '';
  let templateId: string | undefined;

  if (!body) {
    if (payload.templateKey) {
      // Built-in template
      const tpl = BUILTIN_TEMPLATES[payload.templateKey];
      body = renderTemplate(tpl.body, vars);
      subject = tpl.channel === 'email' && 'subject' in tpl
        ? renderTemplate(tpl.subject ?? '', vars)
        : '';
      templateId = payload.templateKey;
    } else if (payload.customTemplateName) {
      // DB-stored template
      const tpl = await db.query.messageTemplates.findFirst({
        where: and(
          eq(messageTemplates.tenantId, payload.tenantId),
          eq(messageTemplates.name, payload.customTemplateName),
          eq(messageTemplates.channel, payload.channel),
          eq(messageTemplates.active, true),
        ),
      });
      if (!tpl) {
        return { success: false, channel: payload.channel, error: 'template_not_found' };
      }
      body = renderTemplate(tpl.body, vars);
      subject = tpl.subject ? renderTemplate(tpl.subject, vars) : '';
      templateId = tpl.id;
    }
  }

  if (!body) {
    return { success: false, channel: payload.channel, error: 'empty_body' };
  }

  try {
    if (payload.channel === 'whatsapp') {
      const result = await sendWhatsApp(payload.tenantId, payload.recipient, body, templateId);
      return { ...result, channel: 'whatsapp' };
    } else if (payload.channel === 'email') {
      if (!subject) {
        return { success: false, channel: 'email', error: 'missing_subject' };
      }
      const result = await sendEmail({
        tenantId: payload.tenantId,
        to: payload.recipient,
        subject,
        html: body,
        templateId,
      });
      return { ...result, channel: 'email' };
    }

    return { success: false, channel: payload.channel, error: 'unsupported_channel' };
  } catch (err) {
    return { success: false, channel: payload.channel, error: String(err) };
  }
}

/**
 * Bulk dispatch to multiple recipients with the same template.
 */
export async function dispatchBulk(
  payloads: DispatchPayload[],
  concurrency = 5,
): Promise<DispatchResult[]> {
  const results: DispatchResult[] = [];

  for (let i = 0; i < payloads.length; i += concurrency) {
    const batch = payloads.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map((p) => dispatch(p)));
    for (const r of batchResults) {
      results.push(
        r.status === 'fulfilled'
          ? r.value
          : { success: false, channel: 'unknown', error: String(r.reason) },
      );
    }
  }

  return results;
}
