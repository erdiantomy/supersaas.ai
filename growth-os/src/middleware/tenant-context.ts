import type { Context, Next } from 'hono';
import type { HonoVariables } from '../types.js';
import { db } from '../db/index.js';
import { tenants } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function tenantContextMiddleware(
  c: Context<{ Variables: HonoVariables }>,
  next: Next,
): Promise<Response | void> {
  const tenantId = c.req.param('tenantId');
  if (!tenantId) return c.json({ error: 'missing_tenant_id' }, 400);

  const tenant = await db.query.tenants.findFirst({
    where: eq(tenants.id, tenantId),
  });

  if (!tenant) return c.json({ error: 'tenant_not_found' }, 404);

  c.set('tenant', tenant);
  c.set('tenantId', tenant.id);

  await next();
}
