import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { HonoVariables } from '../types.js';
import { authMiddleware } from '../middleware/auth.js';
import { tenantContextMiddleware } from '../middleware/tenant-context.js';
import { db } from '../db/index.js';
import { tenantConnections } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { encrypt } from '../integrations/crypto.js';
import { validateConnection, validateAllTenantConnections } from '../integrations/connection-validator.js';
import { metaOAuth } from '../integrations/oauth/meta.js';
import { googleOAuth } from '../integrations/oauth/google.js';
import { tiktokOAuth } from '../integrations/oauth/tiktok.js';
import { env } from '../config.js';

type Env = { Variables: HonoVariables };

const connections = new Hono<Env>();

connections.use('/:tenantId/*', authMiddleware, tenantContextMiddleware);

// GET /connections/:tenantId
connections.get('/:tenantId', async (c) => {
  const tenantId = c.get('tenantId');
  const conns = await db.query.tenantConnections.findMany({
    where: eq(tenantConnections.tenantId, tenantId),
    columns: {
      id: true,
      platform: true,
      authType: true,
      health: true,
      externalAccountId: true,
      lastValidatedAt: true,
      lastErrorMessage: true,
      validationFailureCount: true,
      scopes: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return c.json({ connections: conns });
});

// POST /connections/:tenantId/validate
connections.post('/:tenantId/validate', async (c) => {
  const tenantId = c.get('tenantId');
  const results = await validateAllTenantConnections(tenantId);
  return c.json({ results });
});

// POST /connections/:tenantId/validate/:connectionId
connections.post('/:tenantId/validate/:connectionId', async (c) => {
  const connectionId = c.req.param('connectionId');
  const result = await validateConnection(connectionId);
  return c.json({ result });
});

// DELETE /connections/:tenantId/:connectionId
connections.delete('/:tenantId/:connectionId', async (c) => {
  const tenantId = c.get('tenantId');
  const connectionId = c.req.param('connectionId');
  await db
    .delete(tenantConnections)
    .where(and(eq(tenantConnections.id, connectionId), eq(tenantConnections.tenantId, tenantId)));
  return c.json({ deleted: true });
});

// POST /connections/:tenantId/api-key
const apiKeySchema = z.object({
  platform: z.enum(['ayo_booking', 'xendit', 'custom_webhook']),
  apiKey: z.string().min(8),
  externalAccountId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

connections.post('/:tenantId/api-key', zValidator('json', apiKeySchema), async (c) => {
  const tenantId = c.get('tenantId');
  const { platform, apiKey, externalAccountId, metadata } = c.req.valid('json');

  const credentials = encrypt(JSON.stringify({ api_key: apiKey, secret_key: apiKey }));

  const [conn] = await db
    .insert(tenantConnections)
    .values({
      tenantId,
      platform,
      authType: 'api_key',
      health: 'never_validated',
      encryptedCredentials: credentials,
      externalAccountId,
      metadata: metadata ?? {},
    })
    .onConflictDoUpdate({
      target: [tenantConnections.tenantId, tenantConnections.platform],
      set: {
        encryptedCredentials: credentials,
        health: 'never_validated',
        externalAccountId,
        metadata: metadata ?? {},
        validationFailureCount: 0,
        updatedAt: new Date(),
      },
    })
    .returning({ id: tenantConnections.id, platform: tenantConnections.platform });

  return c.json({ connection: conn, message: 'Validate after connecting.' }, 201);
});

// ─── OAuth flows ──────────────────────────────────────────────────────────────

connections.get('/oauth/meta/start', zValidator('query', z.object({
  tenantId: z.string().uuid(),
  state: z.string().min(8),
})), (c) => {
  const { tenantId, state } = c.req.valid('query');
  return c.redirect(metaOAuth.getAuthUrl(tenantId, state));
});

connections.get('/oauth/meta/callback', zValidator('query', z.object({
  code: z.string(),
  state: z.string(),
})), async (c) => {
  const { code, state } = c.req.valid('query');
  const [tenantId] = state.split(':');
  if (!tenantId) return c.json({ error: 'invalid_state' }, 400);
  try {
    await metaOAuth.exchangeCode(code, tenantId);
    return c.redirect(`${env.DASHBOARD_URL}/connections?platform=meta_ads&status=connected`);
  } catch (err) {
    return c.redirect(`${env.DASHBOARD_URL}/connections?platform=meta_ads&status=error&msg=${encodeURIComponent(String(err))}`);
  }
});

connections.get('/oauth/google/start', zValidator('query', z.object({
  tenantId: z.string().uuid(),
  state: z.string().min(8),
})), (c) => {
  const { tenantId, state } = c.req.valid('query');
  return c.redirect(googleOAuth.getAuthUrl(tenantId, state));
});

connections.get('/oauth/google/callback', zValidator('query', z.object({
  code: z.string(),
  state: z.string(),
})), async (c) => {
  const { code, state } = c.req.valid('query');
  const [tenantId] = state.split(':');
  if (!tenantId) return c.json({ error: 'invalid_state' }, 400);
  try {
    await googleOAuth.exchangeCode(code, tenantId);
    return c.redirect(`${env.DASHBOARD_URL}/connections?platform=google_ads&status=connected`);
  } catch (err) {
    return c.redirect(`${env.DASHBOARD_URL}/connections?platform=google_ads&status=error&msg=${encodeURIComponent(String(err))}`);
  }
});

connections.get('/oauth/tiktok/start', zValidator('query', z.object({
  tenantId: z.string().uuid(),
  state: z.string().min(8),
})), (c) => {
  const { tenantId, state } = c.req.valid('query');
  return c.redirect(tiktokOAuth.getAuthUrl(tenantId, state));
});

connections.get('/oauth/tiktok/callback', zValidator('query', z.object({
  code: z.string(),
  state: z.string(),
})), async (c) => {
  const { code, state } = c.req.valid('query');
  const [tenantId] = state.split(':');
  if (!tenantId) return c.json({ error: 'invalid_state' }, 400);
  try {
    await tiktokOAuth.exchangeCode(code, tenantId);
    return c.redirect(`${env.DASHBOARD_URL}/connections?platform=tiktok_ads&status=connected`);
  } catch (err) {
    return c.redirect(`${env.DASHBOARD_URL}/connections?platform=tiktok_ads&status=error&msg=${encodeURIComponent(String(err))}`);
  }
});

export { connections as connectionRoutes };
