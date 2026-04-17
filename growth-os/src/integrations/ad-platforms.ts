import { db } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { tenantConnections } from '../db/schema.js';
import { decrypt } from './crypto.js';
import { env } from '../config.js';

export interface AdPlatformMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
  cpc: number;
  ctr: number;
}

export type AdPlatform = 'meta_ads' | 'google_ads' | 'tiktok_ads';

interface ConnectionCredentials {
  access_token?: string;
  refresh_token?: string;
  ad_account_id?: string;
  customer_id?: string;
  advertiser_id?: string;
}

async function resolveConnection(
  tenantId: string,
  platform: AdPlatform,
): Promise<{ creds: ConnectionCredentials; externalAccountId: string | null } | null> {
  const conn = await db.query.tenantConnections.findFirst({
    where: and(
      eq(tenantConnections.tenantId, tenantId),
      eq(tenantConnections.platform, platform),
    ),
  });
  if (!conn || conn.health === 'revoked' || conn.health === 'expired') return null;

  const creds = JSON.parse(decrypt(conn.encryptedCredentials)) as ConnectionCredentials;
  return { creds, externalAccountId: conn.externalAccountId };
}

export async function getAdPlatformMetrics(
  tenantId: string,
  platform: AdPlatform,
  dateFrom: string,
  dateTo: string,
): Promise<AdPlatformMetrics | null> {
  const conn = await resolveConnection(tenantId, platform);
  if (!conn) return null;

  try {
    if (platform === 'meta_ads') {
      return await fetchMetaMetrics(conn.creds, conn.externalAccountId ?? '', dateFrom, dateTo);
    } else if (platform === 'google_ads') {
      return await fetchGoogleAdsMetrics(conn.creds, dateFrom, dateTo);
    } else if (platform === 'tiktok_ads') {
      return await fetchTikTokMetrics(conn.creds, conn.externalAccountId ?? '', dateFrom, dateTo);
    }
  } catch (err) {
    console.error(`[ad-platforms] Error fetching ${platform} metrics for ${tenantId}:`, err);
  }

  return null;
}

async function fetchMetaMetrics(
  creds: ConnectionCredentials,
  adAccountId: string,
  dateFrom: string,
  dateTo: string,
): Promise<AdPlatformMetrics> {
  const params = new URLSearchParams({
    fields: 'spend,impressions,clicks,actions,action_values',
    time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
    level: 'account',
    access_token: creds.access_token ?? '',
  });

  const res = await fetch(
    `https://graph.facebook.com/v21.0/act_${adAccountId}/insights?${params}`,
  );
  if (!res.ok) throw new Error(`Meta API error ${res.status}`);
  const json = await res.json() as {
    data?: Array<{
      spend?: string;
      impressions?: string;
      clicks?: string;
      actions?: Array<{ action_type: string; value: string }>;
      action_values?: Array<{ action_type: string; value: string }>;
    }>;
  };

  const row = json.data?.[0];
  if (!row) return zeroMetrics();

  const spend = parseFloat(row.spend ?? '0');
  const impressions = parseInt(row.impressions ?? '0');
  const clicks = parseInt(row.clicks ?? '0');
  const conversions = (row.actions ?? [])
    .filter((a) => a.action_type === 'purchase')
    .reduce((s, a) => s + parseFloat(a.value), 0);
  const revenue = (row.action_values ?? [])
    .filter((a) => a.action_type === 'purchase')
    .reduce((s, a) => s + parseFloat(a.value), 0);

  return buildMetrics(spend, impressions, clicks, conversions, revenue);
}

async function fetchGoogleAdsMetrics(
  creds: ConnectionCredentials,
  dateFrom: string,
  dateTo: string,
): Promise<AdPlatformMetrics> {
  // Google Ads Query Language (GAQL) via REST API
  const customerId = creds.customer_id?.replace(/-/g, '') ?? '';
  const query = `
    SELECT
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.conversions,
      metrics.conversions_value
    FROM customer
    WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
  `;

  const res = await fetch(
    `https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creds.access_token}`,
        'developer-token': env.GOOGLE_ADS_DEVELOPER_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    },
  );
  if (!res.ok) throw new Error(`Google Ads API error ${res.status}`);

  const rows = await res.json() as Array<{
    results?: Array<{
      metrics?: {
        costMicros?: number;
        impressions?: number;
        clicks?: number;
        conversions?: number;
        conversionsValue?: number;
      };
    }>;
  }>;

  let spend = 0, impressions = 0, clicks = 0, conversions = 0, revenue = 0;
  for (const batch of rows) {
    for (const r of batch.results ?? []) {
      const m = r.metrics ?? {};
      spend += (m.costMicros ?? 0) / 1_000_000;
      impressions += m.impressions ?? 0;
      clicks += m.clicks ?? 0;
      conversions += m.conversions ?? 0;
      revenue += m.conversionsValue ?? 0;
    }
  }

  return buildMetrics(spend, impressions, clicks, conversions, revenue);
}

async function fetchTikTokMetrics(
  creds: ConnectionCredentials,
  advertiserId: string,
  dateFrom: string,
  dateTo: string,
): Promise<AdPlatformMetrics> {
  const params = new URLSearchParams({
    advertiser_id: advertiserId,
    report_type: 'BASIC',
    dimensions: JSON.stringify(['stat_time_day']),
    metrics: JSON.stringify(['spend', 'impressions', 'clicks', 'conversions', 'total_purchase_value']),
    start_date: dateFrom,
    end_date: dateTo,
    page_size: '100',
  });

  const res = await fetch(`https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?${params}`, {
    headers: { 'Access-Token': creds.access_token ?? '' },
  });
  if (!res.ok) throw new Error(`TikTok Ads API error ${res.status}`);

  const json = await res.json() as {
    data?: {
      list?: Array<{
        metrics?: {
          spend?: string;
          impressions?: string;
          clicks?: string;
          conversions?: string;
          total_purchase_value?: string;
        };
      }>;
    };
  };

  let spend = 0, impressions = 0, clicks = 0, conversions = 0, revenue = 0;
  for (const row of json.data?.list ?? []) {
    const m = row.metrics ?? {};
    spend += parseFloat(m.spend ?? '0');
    impressions += parseInt(m.impressions ?? '0');
    clicks += parseInt(m.clicks ?? '0');
    conversions += parseInt(m.conversions ?? '0');
    revenue += parseFloat(m.total_purchase_value ?? '0');
  }

  return buildMetrics(spend, impressions, clicks, conversions, revenue);
}

export async function updateAdBudget(
  tenantId: string,
  platform: AdPlatform,
  dailyBudget: number,
): Promise<{ success: boolean; error?: string }> {
  if (!env.ENABLE_LIVE_AD_EXECUTION) {
    return { success: false, error: 'live_execution_disabled' };
  }

  const conn = await resolveConnection(tenantId, platform);
  if (!conn) return { success: false, error: 'no_ad_account_connected' };

  try {
    if (platform === 'meta_ads') {
      await updateMetaBudget(conn.creds, conn.externalAccountId ?? '', dailyBudget);
    } else if (platform === 'google_ads') {
      await updateGoogleBudget(conn.creds, dailyBudget);
    } else if (platform === 'tiktok_ads') {
      await updateTikTokBudget(conn.creds, conn.externalAccountId ?? '', dailyBudget);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

async function updateMetaBudget(
  creds: ConnectionCredentials,
  adAccountId: string,
  dailyBudget: number,
): Promise<void> {
  // Get active campaigns first
  const campaignsRes = await fetch(
    `https://graph.facebook.com/v21.0/act_${adAccountId}/campaigns?fields=id,daily_budget&access_token=${creds.access_token}&effective_status=["ACTIVE"]`,
  );
  const campaigns = await campaignsRes.json() as { data?: Array<{ id: string }> };

  // Distribute budget evenly across active campaigns
  const count = campaigns.data?.length ?? 0;
  if (count === 0) return;

  const perCampaign = Math.floor((dailyBudget * 100) / count); // Meta uses cents

  for (const campaign of campaigns.data ?? []) {
    await fetch(`https://graph.facebook.com/v21.0/${campaign.id}`, {
      method: 'POST',
      body: new URLSearchParams({
        daily_budget: String(perCampaign),
        access_token: creds.access_token ?? '',
      }),
    });
  }
}

async function updateGoogleBudget(
  creds: ConnectionCredentials,
  dailyBudgetIdr: number,
): Promise<void> {
  // Stub: full implementation requires google-ads-api SDK and campaign budget resource
  console.log(`[Google Ads] Budget update to IDR ${dailyBudgetIdr.toLocaleString('id-ID')} — SDK integration pending`);
}

async function updateTikTokBudget(
  creds: ConnectionCredentials,
  advertiserId: string,
  dailyBudget: number,
): Promise<void> {
  console.log(`[TikTok Ads] Budget update for advertiser ${advertiserId} to IDR ${dailyBudget.toLocaleString('id-ID')} — API integration pending`);
}

function buildMetrics(
  spend: number,
  impressions: number,
  clicks: number,
  conversions: number,
  revenue: number,
): AdPlatformMetrics {
  const roas = spend > 0 ? revenue / spend : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  return { spend, impressions, clicks, conversions, revenue, roas, cpc, ctr };
}

function zeroMetrics(): AdPlatformMetrics {
  return { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0, roas: 0, cpc: 0, ctr: 0 };
}
