import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { tenants, budgetPolicies } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { startShadowMode, getShadowStatus, goLive } from '../engine/shadow-mode.js';
import { validateAllTenantConnections } from '../integrations/connection-validator.js';

const onboarding = new Hono();

onboarding.use('*', authMiddleware);

// POST /onboarding/tenant — create tenant + initial policy
const createTenantSchema = z.object({
  slug: z.string().min(3).max(63).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(200),
  plan: z.enum(['free', 'growth', 'enterprise']).default('growth'),
  timezone: z.string().default('Asia/Jakarta'),
  alertWebhookUrl: z.string().url().optional(),
});

onboarding.post('/tenant', zValidator('json', createTenantSchema), async (c) => {
  const data = c.req.valid('json');

  // Check slug uniqueness
  const existing = await db.query.tenants.findFirst({
    where: eq(tenants.slug, data.slug),
  });
  if (existing) return c.json({ error: 'slug_already_taken' }, 409);

  const [tenant] = await db.insert(tenants).values({
    ...data,
    executionMode: 'shadow',
    onboardingStep: 'welcome',
  }).returning();

  // Create default budget policy
  await db.insert(budgetPolicies).values({
    tenantId: tenant!.id,
    mode: 'auto_growth',
    active: false, // inactive until onboarding complete
  });

  return c.json({ tenant }, 201);
});

// GET /onboarding/:tenantId/status
onboarding.get('/:tenantId/status', async (c) => {
  const tenantId = c.req.param('tenantId');
  const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) });
  if (!tenant) return c.json({ error: 'tenant_not_found' }, 404);

  const shadowStatus = await getShadowStatus(tenantId);
  const connectionHealth = await validateAllTenantConnections(tenantId);

  return c.json({
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      plan: tenant.plan,
      onboardingStep: tenant.onboardingStep,
      onboardingCompletedAt: tenant.onboardingCompletedAt,
    },
    shadow: shadowStatus,
    connections: connectionHealth,
  });
});

// POST /onboarding/:tenantId/step — advance onboarding step
const ONBOARDING_STEPS = [
  'welcome', 'connect_revenue', 'connect_ads', 'connect_messaging',
  'configure_policy', 'review_shadow', 'go_live', 'completed',
] as const;

onboarding.post('/:tenantId/step', zValidator('json', z.object({
  step: z.enum(ONBOARDING_STEPS),
})), async (c) => {
  const tenantId = c.req.param('tenantId');
  const { step } = c.req.valid('json');

  const now = new Date();
  const isCompleted = step === 'completed';

  await db
    .update(tenants)
    .set({
      onboardingStep: step,
      onboardingCompletedAt: isCompleted ? now : undefined,
      updatedAt: now,
    })
    .where(eq(tenants.id, tenantId));

  // Auto-start shadow mode when reaching review_shadow
  if (step === 'review_shadow') {
    await startShadowMode(tenantId);
  }

  // Activate budget policy on go_live
  if (step === 'go_live') {
    await db
      .update(budgetPolicies)
      .set({ active: true, updatedAt: now })
      .where(eq(budgetPolicies.tenantId, tenantId));
    await goLive(tenantId);
  }

  return c.json({ step, updatedAt: now.toISOString() });
});

export { onboarding as onboardingRoutes };
