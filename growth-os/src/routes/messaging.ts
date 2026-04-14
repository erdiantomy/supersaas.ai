import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { HonoVariables } from '../types.js';
import { authMiddleware } from '../middleware/auth.js';
import { tenantContextMiddleware } from '../middleware/tenant-context.js';
import { dispatch, dispatchBulk } from '../messaging/dispatcher.js';
import { runWinBackCampaign } from '../engine/crm-engine.js';
import { db } from '../db/index.js';
import { messageLog, messageTemplates } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { BUILTIN_TEMPLATES, type BuiltinTemplateKey } from '../messaging/templates.js';

type Env = { Variables: HonoVariables };

const messaging = new Hono<Env>();

messaging.use('/:tenantId/*', authMiddleware, tenantContextMiddleware);

// POST /messaging/:tenantId/send
const sendSchema = z.object({
  channel: z.enum(['whatsapp', 'email']),
  recipient: z.string().min(5),
  templateKey: z.string().optional(),
  customTemplateName: z.string().optional(),
  vars: z.record(z.union([z.string(), z.number()])).optional(),
  directBody: z.string().optional(),
  directSubject: z.string().optional(),
});

messaging.post('/:tenantId/send', zValidator('json', sendSchema), async (c) => {
  const tenantId = c.get('tenantId');
  const body = c.req.valid('json');

  const result = await dispatch({
    tenantId,
    channel: body.channel,
    recipient: body.recipient,
    templateKey: body.templateKey as BuiltinTemplateKey | undefined,
    customTemplateName: body.customTemplateName,
    vars: body.vars,
    directBody: body.directBody,
    directSubject: body.directSubject,
  });

  return c.json({ result }, result.success ? 200 : 400);
});

// POST /messaging/:tenantId/bulk
const bulkSchema = z.object({
  messages: z.array(sendSchema).min(1).max(500),
  concurrency: z.number().int().min(1).max(20).default(5),
});

messaging.post('/:tenantId/bulk', zValidator('json', bulkSchema), async (c) => {
  const tenantId = c.get('tenantId');
  const { messages, concurrency } = c.req.valid('json');

  const results = await dispatchBulk(
    messages.map((m) => ({
      tenantId,
      channel: m.channel,
      recipient: m.recipient,
      templateKey: m.templateKey as BuiltinTemplateKey | undefined,
      customTemplateName: m.customTemplateName,
      vars: m.vars,
      directBody: m.directBody,
      directSubject: m.directSubject,
    })),
    concurrency,
  );

  const sent = results.filter((r) => r.success).length;
  return c.json({ sent, failed: results.length - sent, results });
});

// POST /messaging/:tenantId/winback
messaging.post('/:tenantId/winback', zValidator('json', z.object({
  channel: z.enum(['whatsapp', 'email']).default('whatsapp'),
  discount: z.number().int().min(1).max(90).default(10),
})), async (c) => {
  const tenantId = c.get('tenantId');
  const { channel, discount } = c.req.valid('json');
  const result = await runWinBackCampaign(tenantId, channel, discount);
  return c.json({ result });
});

// GET /messaging/:tenantId/logs
messaging.get('/:tenantId/logs', zValidator('query', z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})), async (c) => {
  const tenantId = c.get('tenantId');
  const { limit, offset } = c.req.valid('query');

  const logs = await db.query.messageLog.findMany({
    where: eq(messageLog.tenantId, tenantId),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
    limit,
    offset,
  });

  return c.json({ logs });
});

// GET /messaging/:tenantId/templates
messaging.get('/:tenantId/templates', async (c) => {
  const tenantId = c.get('tenantId');

  const custom = await db.query.messageTemplates.findMany({
    where: eq(messageTemplates.tenantId, tenantId),
  });

  const builtin = Object.entries(BUILTIN_TEMPLATES).map(([key, tpl]) => ({
    key,
    type: 'builtin',
    channel: tpl.channel,
    body: tpl.body,
    subject: 'subject' in tpl ? tpl.subject : undefined,
  }));

  return c.json({ builtin, custom });
});

// POST /messaging/:tenantId/templates
const templateSchema = z.object({
  name: z.string().min(2).max(100),
  channel: z.enum(['whatsapp', 'email', 'sms']),
  subject: z.string().optional(),
  body: z.string().min(10),
  variables: z.array(z.string()).default([]),
});

messaging.post('/:tenantId/templates', zValidator('json', templateSchema), async (c) => {
  const tenantId = c.get('tenantId');
  const data = c.req.valid('json');

  const [tpl] = await db
    .insert(messageTemplates)
    .values({ tenantId, ...data })
    .onConflictDoUpdate({
      target: [messageTemplates.tenantId, messageTemplates.name],
      set: { ...data, updatedAt: new Date() },
    })
    .returning();

  return c.json({ template: tpl }, 201);
});

export { messaging as messagingRoutes };
