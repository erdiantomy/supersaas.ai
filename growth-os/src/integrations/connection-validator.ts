import { db } from '../db/index.js';
import { tenantConnections, connectionEvents } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { decrypt } from './crypto.js';
import { env } from '../config.js';

export type ValidationResult = {
  healthy: boolean;
  error?: string;
  latencyMs?: number;
};

async function validateMeta(creds: { access_token: string }): Promise<ValidationResult> {
  const start = Date.now();
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${creds.access_token}`,
    );
    return { healthy: res.ok, latencyMs: Date.now() - start };
  } catch (err) {
    return { healthy: false, error: String(err) };
  }
}

async function validateGoogle(creds: { access_token: string; customer_id?: string }): Promise<ValidationResult> {
  const start = Date.now();
  try {
    const res = await fetch(
      `https://googleads.googleapis.com/v17/customers/${creds.customer_id ?? ''}:listAccessibleCustomers`,
      {
        headers: {
          'Authorization': `Bearer ${creds.access_token}`,
          'developer-token': env.GOOGLE_ADS_DEVELOPER_TOKEN,
        },
      },
    );
    return { healthy: res.ok, latencyMs: Date.now() - start };
  } catch (err) {
    return { healthy: false, error: String(err) };
  }
}

async function validateTikTok(creds: { access_token: string; advertiser_id?: string }): Promise<ValidationResult> {
  const start = Date.now();
  try {
    const res = await fetch(
      `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=["${creds.advertiser_id}"]`,
      { headers: { 'Access-Token': creds.access_token } },
    );
    return { healthy: res.ok, latencyMs: Date.now() - start };
  } catch (err) {
    return { healthy: false, error: String(err) };
  }
}

async function validateAyo(creds: { api_key: string }): Promise<ValidationResult> {
  const start = Date.now();
  try {
    const res = await fetch(`${env.AYO_API_BASE}/v1/health`, {
      headers: { 'Authorization': `Bearer ${creds.api_key}` },
    });
    return { healthy: res.ok, latencyMs: Date.now() - start };
  } catch (err) {
    return { healthy: false, error: String(err) };
  }
}

async function validateXendit(creds: { secret_key: string }): Promise<ValidationResult> {
  const start = Date.now();
  try {
    const auth = Buffer.from(`${creds.secret_key}:`).toString('base64');
    const res = await fetch('https://api.xendit.co/balance', {
      headers: { 'Authorization': `Basic ${auth}` },
    });
    return { healthy: res.ok, latencyMs: Date.now() - start };
  } catch (err) {
    return { healthy: false, error: String(err) };
  }
}

/**
 * Validate a single connection and update its health in the DB.
 */
export async function validateConnection(connectionId: string): Promise<ValidationResult> {
  const conn = await db.query.tenantConnections.findFirst({
    where: eq(tenantConnections.id, connectionId),
  });
  if (!conn) return { healthy: false, error: 'connection_not_found' };

  let creds: Record<string, string>;
  try {
    creds = JSON.parse(decrypt(conn.encryptedCredentials)) as Record<string, string>;
  } catch {
    return { healthy: false, error: 'credential_decryption_failed' };
  }

  let result: ValidationResult;

  switch (conn.platform) {
    case 'meta_ads':
      result = await validateMeta(creds as { access_token: string });
      break;
    case 'google_ads':
      result = await validateGoogle(creds as { access_token: string; customer_id?: string });
      break;
    case 'tiktok_ads':
      result = await validateTikTok(creds as { access_token: string; advertiser_id?: string });
      break;
    case 'ayo_booking':
      result = await validateAyo(creds as { api_key: string });
      break;
    case 'xendit':
      result = await validateXendit(creds as { secret_key: string });
      break;
    default:
      result = { healthy: true }; // Unknown platforms pass through
  }

  const newHealth = result.healthy
    ? 'healthy'
    : conn.validationFailureCount >= 3
      ? 'revoked'
      : 'degraded';

  await db
    .update(tenantConnections)
    .set({
      health: newHealth,
      lastValidatedAt: new Date(),
      lastErrorMessage: result.error ?? null,
      validationFailureCount: result.healthy
        ? 0
        : conn.validationFailureCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(tenantConnections.id, connectionId));

  // Log event
  await db.insert(connectionEvents).values({
    connectionId,
    tenantId: conn.tenantId,
    eventType: 'validation',
    success: result.healthy,
    errorMessage: result.error,
    metadata: { latencyMs: result.latencyMs ?? 0, platform: conn.platform },
  });

  return result;
}

/**
 * Validate all connections for a tenant.
 */
export async function validateAllTenantConnections(
  tenantId: string,
): Promise<Record<string, ValidationResult>> {
  const connections = await db.query.tenantConnections.findMany({
    where: eq(tenantConnections.tenantId, tenantId),
  });

  const results: Record<string, ValidationResult> = {};
  await Promise.allSettled(
    connections.map(async (conn) => {
      results[conn.platform] = await validateConnection(conn.id);
    }),
  );

  return results;
}
