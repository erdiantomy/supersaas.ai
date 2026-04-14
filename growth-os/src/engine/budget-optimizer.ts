import { getTrailingRoas } from './roas-tracker.js';
import { xenditIntegration } from '../integrations/xendit.js';
import { updateAdBudget, type AdPlatform } from '../integrations/ad-platforms.js';
import { env } from '../config.js';
import { db } from '../db/index.js';
import { budgetPolicies, tenants, actionLog } from '../db/schema.js';
import { eq, and, gte, sql } from 'drizzle-orm';

export interface OptimizationResult {
  tenantId: string;
  mode: 'shadow' | 'live';
  action: 'increase' | 'decrease' | 'hold';
  previousBudget?: number;
  recommendedBudget: number;
  roas: number;
  cashBalance: number;
  reason: string;
  platforms: string[];
  executedAt: Date;
}

/**
 * Count how many budget changes have been executed today (live or shadow).
 */
async function countChangesToday(tenantId: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(actionLog)
    .where(
      and(
        eq(actionLog.tenantId, tenantId),
        eq(actionLog.actionType, 'budget_update'),
        gte(actionLog.createdAt, todayStart),
      ),
    );

  return result[0]?.count ?? 0;
}

/**
 * Core budget optimization loop — GOD MODE.
 *
 * Logic:
 *  1. Load policy + execution mode for tenant
 *  2. Fetch trailing ROAS + live cash balance
 *  3. Compute safe daily spend = min(revenue * targetPct, cashBalance * 0.8)
 *  4. If ROAS >= floor AND cash > reserve → scale up (capped at maxDailyBudget)
 *     Else → scale down (floor at 15% of minCashReserve)
 *  5. Shadow mode: log only. Live mode: push to ad platform APIs.
 */
export async function runDailyOptimization(tenantId: string): Promise<OptimizationResult> {
  const policy = await db.query.budgetPolicies.findFirst({
    where: and(eq(budgetPolicies.tenantId, tenantId), eq(budgetPolicies.active, true)),
  });

  if (!policy) {
    throw new Error(`No active budget policy for tenant ${tenantId}`);
  }

  const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) });
  if (!tenant) throw new Error(`Tenant ${tenantId} not found`);

  const isShadow = tenant.executionMode === 'shadow';
  const executionMode = isShadow ? 'shadow' : 'live';

  // Rate limit
  const changestoday = await countChangesToday(tenantId);
  if (changestoday >= policy.maxChangesPerDay) {
    const result: OptimizationResult = {
      tenantId,
      mode: executionMode,
      action: 'hold',
      recommendedBudget: policy.fixedDailyBudget ?? 5_000_000,
      roas: 0,
      cashBalance: 0,
      reason: `rate_limited: ${changestoday}/${policy.maxChangesPerDay} changes today`,
      platforms: policy.platforms as string[],
      executedAt: new Date(),
    };
    await logAction(tenantId, result, executionMode);
    return result;
  }

  // Fetch ROAS + cash
  const [roasResult, cashBalance] = await Promise.allSettled([
    getTrailingRoas(tenantId, policy.roasLookbackDays),
    xenditIntegration.getAvailableBalance(tenantId),
  ]);

  const roas = roasResult.status === 'fulfilled' ? roasResult.value.blended.roas : 0;
  const totalRevenue = roasResult.status === 'fulfilled' ? roasResult.value.blended.revenue : 0;
  const cash = cashBalance.status === 'fulfilled' ? cashBalance.value : 0;

  // Compute safe spend envelope
  const safeSpend = Math.min(
    totalRevenue * policy.targetRevenuePercent,
    cash * 0.8,
    policy.maxDailyBudget,
  );

  const minBudget = policy.minCashReserve * 0.15;
  let recommended: number;
  let action: OptimizationResult['action'];
  let reason: string;

  if (roas >= policy.minRoas && cash > policy.minCashReserve) {
    // Scale up
    recommended = Math.max(safeSpend, minBudget);
    action = recommended > (policy.fixedDailyBudget ?? 0) ? 'increase' : 'hold';
    reason = `roas=${roas.toFixed(2)} >= floor=${policy.minRoas}, cash=${cash.toLocaleString('id-ID')} > reserve=${policy.minCashReserve.toLocaleString('id-ID')}`;
  } else {
    // Scale down — protect cash reserve
    recommended = Math.max(
      (policy.fixedDailyBudget ?? 5_000_000) * 0.6,
      minBudget,
    );
    action = 'decrease';
    reason = roas < policy.minRoas
      ? `roas=${roas.toFixed(2)} < floor=${policy.minRoas}`
      : `cash=${cash.toLocaleString('id-ID')} <= reserve=${policy.minCashReserve.toLocaleString('id-ID')}`;
  }

  // Round to nearest 10,000 IDR
  recommended = Math.round(recommended / 10_000) * 10_000;

  const result: OptimizationResult = {
    tenantId,
    mode: executionMode,
    action,
    recommendedBudget: recommended,
    roas,
    cashBalance: cash,
    reason,
    platforms: policy.platforms as string[],
    executedAt: new Date(),
  };

  if (isShadow) {
    console.log(
      `[SHADOW] ${tenantId} → ${action.toUpperCase()} to IDR ${recommended.toLocaleString('id-ID')} | ROAS ${roas.toFixed(2)} | Cash ${cash.toLocaleString('id-ID')} | ${reason}`,
    );
    await logAction(tenantId, result, 'shadow');
    return result;
  }

  // Live execution — push to each ad platform
  const execResults = await Promise.allSettled(
    (policy.platforms as AdPlatform[]).map((p) =>
      updateAdBudget(tenantId, p, recommended),
    ),
  );

  const allSucceeded = execResults.every(
    (r) => r.status === 'fulfilled' && r.value.success,
  );

  console.log(
    `[LIVE] ${tenantId} → ${action.toUpperCase()} to IDR ${recommended.toLocaleString('id-ID')} | Success: ${allSucceeded}`,
  );

  await logAction(tenantId, result, 'live', allSucceeded);
  return result;
}

async function logAction(
  tenantId: string,
  result: OptimizationResult,
  mode: 'shadow' | 'live',
  success = true,
): Promise<void> {
  await db.insert(actionLog).values({
    tenantId,
    actionType: 'budget_update',
    status: mode === 'shadow' ? 'shadow' : success ? 'executed' : 'failed',
    executionMode: mode,
    inputData: {
      platforms: result.platforms,
      reason: result.reason,
      roas: result.roas,
      cashBalance: result.cashBalance,
    },
    outputData: {
      action: result.action,
      recommendedBudget: result.recommendedBudget,
    },
    executedAt: new Date(),
  });
}
