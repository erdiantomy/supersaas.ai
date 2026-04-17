import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { env } from './config.js';
import { statusRoutes } from './routes/status.js';
import { budgetRoutes } from './routes/budget.js';
import { connectionRoutes } from './routes/connections.js';
import { messagingRoutes } from './routes/messaging.js';
import { onboardingRoutes } from './routes/onboarding.js';
import { webhookRoutes } from './routes/webhooks.js';
import { startScheduler } from './engine/scheduler.js';

const app = new Hono();

// ─── Global middleware ────────────────────────────────────────────────────────

app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: [env.APP_URL, env.DASHBOARD_URL],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Service-Key'],
  credentials: true,
}));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.route('/health', statusRoutes);
app.route('/budget', budgetRoutes);
app.route('/connections', connectionRoutes);
app.route('/messaging', messagingRoutes);
app.route('/onboarding', onboardingRoutes);
app.route('/webhooks', webhookRoutes);

// ─── Root ─────────────────────────────────────────────────────────────────────

app.get('/', (c) => c.json({
  service: 'Growth OS',
  version: '3.1.0',
  description: 'Autonomous ROAS + cash-flow loop for Indonesian SMBs',
  docs: `${env.APP_URL}/growth-os/docs`,
  endpoints: ['/health', '/budget', '/connections', '/messaging', '/onboarding', '/webhooks'],
}));

// ─── 404 ─────────────────────────────────────────────────────────────────────

app.notFound((c) => c.json({ error: 'not_found', path: c.req.path }, 404));

// ─── Error handler ────────────────────────────────────────────────────────────

app.onError((err, c) => {
  console.error('[growth-os] Unhandled error:', err);
  return c.json({
    error: 'internal_server_error',
    message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  }, 500);
});

// ─── Start ────────────────────────────────────────────────────────────────────

const port = env.PORT;

if (env.NODE_ENV !== 'test') {
  startScheduler();
}

console.log(`\n🚀 Growth OS v3.1.0 starting on port ${port}`);
console.log(`   Environment: ${env.NODE_ENV}`);
console.log(`   Live ad execution: ${env.ENABLE_LIVE_AD_EXECUTION ? '✅ ENABLED' : '🚫 DISABLED (shadow mode)'}`);
console.log(`   Shadow period: ${env.SHADOW_MODE_DURATION_DAYS} days`);
console.log(`   Default ROAS floor: ${env.DEFAULT_ROAS_FLOOR}x\n`);

export default {
  port,
  fetch: app.fetch,
};
