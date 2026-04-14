import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  ENCRYPTION_KEY: z.string().min(32),
  APP_URL: z.string().url(),
  DASHBOARD_URL: z.string().url(),
  META_APP_ID: z.string().min(1),
  META_APP_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_ADS_DEVELOPER_TOKEN: z.string().min(1),
  TIKTOK_APP_ID: z.string().min(1),
  TIKTOK_APP_SECRET: z.string().min(1),
  AYO_API_BASE: z.string().url(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_DOMAIN: z.string().optional(),
  DEFAULT_ALERT_WEBHOOK_URL: z.string().url().optional(),
  WEBHOOK_SECRET: z.string().min(32),
  SHADOW_MODE_DURATION_DAYS: z.coerce.number().default(7),
  DEFAULT_ROAS_FLOOR: z.coerce.number().default(2.0),
  DEFAULT_REVENUE_PERCENT: z.coerce.number().default(0.10),
  MAX_BUDGET_CHANGES_PER_DAY: z.coerce.number().default(2),
  ENABLE_LIVE_AD_EXECUTION: z.coerce.boolean().default(false),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('✗ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
