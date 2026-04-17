import cron from 'node-cron';
import { db } from '../db/index.js';
import { tenants, budgetPolicies } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { runDailyOptimization } from './budget-optimizer.js';
import { snapshotTodayMetrics } from './roas-tracker.js';
import { resegmentCustomers } from './crm-engine.js';
import { checkAndMaybGraduate } from './shadow-mode.js';
import { validateAllTenantConnections } from '../integrations/connection-validator.js';
import { metaOAuth } from '../integrations/oauth/meta.js';
import { googleOAuth } from '../integrations/oauth/google.js';
import { tiktokOAuth } from '../integrations/oauth/tiktok.js';
import { sendAlert } from '../alerts/notify.js';

async function getActiveTenantIds(): Promise<string[]> {
  const rows = await db
    .select({ id: tenants.id })
    .from(tenants)
    .innerJoin(budgetPolicies, and(
      eq(budgetPolicies.tenantId, tenants.id),
      eq(budgetPolicies.active, true),
    ));
  return rows.map((r) => r.id);
}

async function runForAllTenants<T>(
  name: string,
  fn: (tenantId: string) => Promise<T>,
): Promise<void> {
  const tenantIds = await getActiveTenantIds();
  console.log(`[scheduler] ${name} — running for ${tenantIds.length} tenants`);

  await Promise.allSettled(
    tenantIds.map(async (id) => {
      try {
        await fn(id);
      } catch (err) {
        console.error(`[scheduler] ${name} failed for tenant ${id}:`, err);
        await sendAlert(id, {
          level: 'error',
          title: `Scheduled job failed: ${name}`,
          message: String(err),
        }).catch(() => {});
      }
    }),
  );
}

/**
 * Register all cron jobs.
 * Call once at server startup.
 */
export function startScheduler(): void {
  // 06:00 WIB (Asia/Jakarta = UTC+7) → 23:00 UTC previous day
  // Snapshot yesterday's ad metrics before optimization
  cron.schedule('0 23 * * *', async () => {
    await runForAllTenants('snapshot_metrics', (id) =>
      snapshotTodayMetrics(id, ['meta_ads', 'google_ads', 'tiktok_ads']),
    );
  }, { timezone: 'UTC' });

  // 07:00 WIB = 00:00 UTC
  // Daily budget optimization
  cron.schedule('0 0 * * *', async () => {
    await runForAllTenants('budget_optimization', runDailyOptimization);
  }, { timezone: 'UTC' });

  // 08:00 WIB = 01:00 UTC
  // CRM re-segmentation
  cron.schedule('0 1 * * *', async () => {
    await runForAllTenants('crm_resegmentation', resegmentCustomers);
  }, { timezone: 'UTC' });

  // Every 6 hours: validate connections + refresh OAuth tokens
  cron.schedule('0 */6 * * *', async () => {
    const tenantIds = await getActiveTenantIds();
    await Promise.allSettled(
      tenantIds.map(async (id) => {
        await validateAllTenantConnections(id);
        await metaOAuth.refreshToken(id).catch(() => {});
        await googleOAuth.refreshToken(id).catch(() => {});
        await tiktokOAuth.refreshToken(id).catch(() => {});
      }),
    );
    console.log('[scheduler] connection_validation complete');
  }, { timezone: 'UTC' });

  // Daily: check shadow mode graduation
  cron.schedule('30 0 * * *', async () => {
    await runForAllTenants('shadow_graduation_check', checkAndMaybGraduate);
  }, { timezone: 'UTC' });

  console.log('[scheduler] All cron jobs registered (WIB timezone)');
}
