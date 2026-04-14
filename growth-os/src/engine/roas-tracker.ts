import { db } from '../db/index.js';
import { performanceSnapshots, dataSnapshots, budgetPolicies } from '../db/schema.js';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { getAdPlatformMetrics, type AdPlatform } from '../integrations/ad-platforms.js';
import { ayoIntegration } from '../integrations/ayo.js';

export interface RoasSnapshot {
  platform: AdPlatform | 'blended';
  date?: string;
  spend: number;
  revenue: number;
  roas: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface TrailingRoasResult {
  byPlatform: Partial<Record<AdPlatform, RoasSnapshot>>;
  blended: RoasSnapshot;
  grossRevenue: number;
  periodDays: number;
}

/**
 * Fetch and persist today's metrics for all connected ad platforms.
 */
export async function snapshotTodayMetrics(
  tenantId: string,
  platforms: AdPlatform[] = ['meta_ads', 'google_ads', 'tiktok_ads'],
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  await Promise.allSettled(
    platforms.map(async (platform) => {
      const metrics = await getAdPlatformMetrics(tenantId, platform, today, today);
      if (!metrics) return;

      await db
        .insert(performanceSnapshots)
        .values({
          tenantId,
          platform,
          periodDate: today,
          spend: metrics.spend,
          impressions: metrics.impressions,
          clicks: metrics.clicks,
          conversions: metrics.conversions,
          revenue: metrics.revenue,
          roas: metrics.roas,
          cpc: metrics.cpc,
          ctr: metrics.ctr,
        })
        .onConflictDoUpdate({
          target: [
            performanceSnapshots.tenantId,
            performanceSnapshots.platform,
            performanceSnapshots.periodDate,
          ],
          set: {
            spend: metrics.spend,
            impressions: metrics.impressions,
            clicks: metrics.clicks,
            conversions: metrics.conversions,
            revenue: metrics.revenue,
            roas: metrics.roas,
            cpc: metrics.cpc,
            ctr: metrics.ctr,
          },
        });
    }),
  );
}

/**
 * Compute trailing ROAS over N days from persisted snapshots.
 */
export async function getTrailingRoas(
  tenantId: string,
  days = 7,
): Promise<TrailingRoasResult> {
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - days * 86_400_000);
  const from = fromDate.toISOString().slice(0, 10);
  const to = toDate.toISOString().slice(0, 10);

  const rows = await db.query.performanceSnapshots.findMany({
    where: and(
      eq(performanceSnapshots.tenantId, tenantId),
      gte(performanceSnapshots.periodDate, from),
      lte(performanceSnapshots.periodDate, to),
    ),
  });

  const byPlatform: Partial<Record<AdPlatform, RoasSnapshot>> = {};
  const totals = { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 };

  for (const row of rows) {
    const p = row.platform as AdPlatform;
    if (!byPlatform[p]) {
      byPlatform[p] = { platform: p, spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0, roas: 0 };
    }
    const agg = byPlatform[p]!;
    agg.spend += row.spend;
    agg.revenue += row.revenue;
    agg.impressions += row.impressions;
    agg.clicks += row.clicks;
    agg.conversions += row.conversions;

    totals.spend += row.spend;
    totals.revenue += row.revenue;
    totals.impressions += row.impressions;
    totals.clicks += row.clicks;
    totals.conversions += row.conversions;
  }

  // Compute per-platform ROAS
  for (const snap of Object.values(byPlatform)) {
    if (snap) snap.roas = snap.spend > 0 ? snap.revenue / snap.spend : 0;
  }

  // Try to get gross revenue from AYO for more accurate blended ROAS
  let grossRevenue = totals.revenue;
  try {
    const ayoMetrics = await ayoIntegration.getDailyMetrics(tenantId, to);
    grossRevenue = Math.max(grossRevenue, ayoMetrics.grossRevenue);
  } catch {
    // AYO not connected or unavailable — use ad platform revenue
  }

  const blended: RoasSnapshot = {
    platform: 'blended',
    spend: totals.spend,
    revenue: grossRevenue,
    roas: totals.spend > 0 ? grossRevenue / totals.spend : 0,
    impressions: totals.impressions,
    clicks: totals.clicks,
    conversions: totals.conversions,
  };

  return { byPlatform, blended, grossRevenue, periodDays: days };
}
