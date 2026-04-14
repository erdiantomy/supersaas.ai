import { db } from '../db/index.js';
import { tenants } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { env } from '../config.js';
import { sendAlert } from '../alerts/notify.js';

export interface ShadowStatus {
  tenantId: string;
  isActive: boolean;
  startedAt: Date | null;
  endsAt: Date | null;
  daysRemaining: number;
  canGoLive: boolean;
}

/**
 * Start shadow mode for a tenant.
 * The tenant observes recommendations without executing real budget changes.
 */
export async function startShadowMode(tenantId: string): Promise<ShadowStatus> {
  const now = new Date();
  const endsAt = new Date(now.getTime() + env.SHADOW_MODE_DURATION_DAYS * 86_400_000);

  await db
    .update(tenants)
    .set({
      executionMode: 'shadow',
      shadowStartedAt: now,
      shadowEndsAt: endsAt,
      updatedAt: now,
    })
    .where(eq(tenants.id, tenantId));

  console.log(`[shadow-mode] Tenant ${tenantId} entered shadow mode. Ends: ${endsAt.toISOString()}`);

  return getShadowStatus(tenantId);
}

/**
 * Graduate tenant to live mode.
 */
export async function goLive(tenantId: string): Promise<ShadowStatus> {
  await db
    .update(tenants)
    .set({
      executionMode: 'live',
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, tenantId));

  await sendAlert(tenantId, {
    level: 'info',
    title: 'Growth OS is now LIVE 🚀',
    message: 'Budget optimization is now executing real changes on your ad platforms.',
  });

  console.log(`[shadow-mode] Tenant ${tenantId} graduated to LIVE mode`);

  return getShadowStatus(tenantId);
}

/**
 * Check shadow mode status and auto-graduate if period has elapsed.
 */
export async function checkAndMaybGraduate(tenantId: string): Promise<ShadowStatus> {
  const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) });
  if (!tenant) throw new Error(`Tenant ${tenantId} not found`);

  if (
    tenant.executionMode === 'shadow' &&
    tenant.shadowEndsAt &&
    new Date() >= tenant.shadowEndsAt
  ) {
    console.log(`[shadow-mode] Auto-graduating ${tenantId} from shadow to live`);
    return goLive(tenantId);
  }

  return buildStatus(tenant);
}

export async function getShadowStatus(tenantId: string): Promise<ShadowStatus> {
  const tenant = await db.query.tenants.findFirst({ where: eq(tenants.id, tenantId) });
  if (!tenant) throw new Error(`Tenant ${tenantId} not found`);
  return buildStatus(tenant);
}

function buildStatus(tenant: {
  id: string;
  executionMode: string;
  shadowStartedAt: Date | null;
  shadowEndsAt: Date | null;
}): ShadowStatus {
  const now = Date.now();
  const endsAt = tenant.shadowEndsAt;
  const isActive = tenant.executionMode === 'shadow';
  const daysRemaining = endsAt
    ? Math.max(0, Math.ceil((endsAt.getTime() - now) / 86_400_000))
    : 0;

  return {
    tenantId: tenant.id,
    isActive,
    startedAt: tenant.shadowStartedAt,
    endsAt,
    daysRemaining,
    canGoLive: isActive && daysRemaining === 0,
  };
}
