import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { HonoVariables } from '../types.js';
import { authMiddleware } from '../middleware/auth.js';
import { tenantContextMiddleware } from '../middleware/tenant-context.js';
import { runDailyOptimization } from '../engine/budget-optimizer.js';
import { getTrailingRoas } from '../engine/roas-tracker.js';
import { db } from '../db/index.js';
import { budgetPolicies } from '../db/schema.js';
import { eq } from 'drizzle-orm';

type Env = { Variables: HonoVariables };

const budget = new Hono<Env>();

budget.use('/:tenantId/*', authMiddleware, tenantContextMiddleware);

// GET /budget/:tenantId/policy
budget.get('/:tenantId/policy', async (c) => {
  const tenantId = c.get('tenantId');
  const policy = await db.query.budgetPolicies.findFirst({
    where: eq(budgetPolicies.tenantId, tenantId),
  });
  if (!policy) return c.json({ error: 'no_policy' }, 404);
  return c.json({ policy });
});

// PUT /budget/:tenantId/policy
const policySchema = z.object({
  mode: z.enum(['auto_growth', 'fixed']).optional(),
  minRoas: z.number().min(0.5).max(20).optional(),
  minCashReserve: z.number().min(0).optional(),
  maxDailyBudget: z.number().min(0).optional(),
  fixedDailyBudget: z.number().min(0).optional(),
  targetRevenuePercent: z.number().min(0.01).max(1).optional(),
  roasLookbackDays: z.number().int().min(1).max(90).optional(),
  maxChangesPerDay: z.number().int().min(1).max(10).optional(),
  platforms: z.array(z.enum(['meta_ads', 'google_ads', 'tiktok_ads'])).min(1).optional(),
  active: z.boolean().optional(),
});

budget.put('/:tenantId/policy', zValidator('json', policySchema), async (c) => {
  const tenantId = c.get('tenantId');
  const updates = c.req.valid('json');

  const existing = await db.query.budgetPolicies.findFirst({
    where: eq(budgetPolicies.tenantId, tenantId),
  });

  if (!existing) {
    const [created] = await db
      .insert(budgetPolicies)
      .values({ tenantId, ...updates })
      .returning();
    return c.json({ policy: created }, 201);
  }

  const [updated] = await db
    .update(budgetPolicies)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(budgetPolicies.tenantId, tenantId))
    .returning();

  return c.json({ policy: updated });
});

// POST /budget/:tenantId/optimize
budget.post('/:tenantId/optimize', async (c) => {
  const tenantId = c.get('tenantId');
  try {
    const result = await runDailyOptimization(tenantId);
    return c.json({ result });
  } catch (err) {
    return c.json({ error: String(err) }, 400);
  }
});

// GET /budget/:tenantId/roas?days=7
budget.get('/:tenantId/roas', zValidator('query', z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
})), async (c) => {
  const tenantId = c.get('tenantId');
  const { days } = c.req.valid('query');
  const result = await getTrailingRoas(tenantId, days);
  return c.json({ result });
});

export { budget as budgetRoutes };
