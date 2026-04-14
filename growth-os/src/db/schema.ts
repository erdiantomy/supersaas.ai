import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  doublePrecision,
  integer,
  date,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const planEnum = pgEnum('plan', ['free', 'growth', 'enterprise']);
export const platformEnum = pgEnum('platform', [
  'meta_ads', 'google_ads', 'tiktok_ads',
  'whatsapp', 'email_resend', 'ayo_booking', 'xendit', 'custom_webhook',
]);
export const integrationStatusEnum = pgEnum('integration_status', ['active', 'inactive', 'error']);
export const budgetModeEnum = pgEnum('budget_mode', ['auto_growth', 'fixed']);
export const actionStatusEnum = pgEnum('action_status', ['planned', 'executed', 'failed', 'skipped', 'shadow']);
export const executionModeEnum = pgEnum('execution_mode', ['shadow', 'live']);
export const connectionAuthTypeEnum = pgEnum('connection_auth_type', ['oauth2', 'api_key', 'whatsapp_embedded']);
export const connectionHealthEnum = pgEnum('connection_health', [
  'healthy', 'degraded', 'expired', 'revoked', 'never_validated',
]);
export const messageStatusEnum = pgEnum('message_status', [
  'queued', 'sent', 'delivered', 'read', 'failed', 'bounced',
]);
export const messageChannelEnum = pgEnum('message_channel', ['whatsapp', 'email', 'sms']);
export const onboardingStepEnum = pgEnum('onboarding_step', [
  'welcome', 'connect_revenue', 'connect_ads', 'connect_messaging',
  'configure_policy', 'review_shadow', 'go_live', 'completed',
]);

// ─── Tenants ──────────────────────────────────────────────────────────────────

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  plan: planEnum('plan').default('free').notNull(),
  executionMode: executionModeEnum('execution_mode').default('shadow').notNull(),
  shadowStartedAt: timestamp('shadow_started_at'),
  shadowEndsAt: timestamp('shadow_ends_at'),
  onboardingStep: onboardingStepEnum('onboarding_step').default('welcome').notNull(),
  onboardingCompletedAt: timestamp('onboarding_completed_at'),
  alertWebhookUrl: text('alert_webhook_url'),
  timezone: text('timezone').default('Asia/Jakarta').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('tenants_slug_idx').on(table.slug),
}));

// ─── Tenant Connections ───────────────────────────────────────────────────────

export const tenantConnections = pgTable('tenant_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  platform: platformEnum('platform').notNull(),
  authType: connectionAuthTypeEnum('auth_type').notNull(),
  health: connectionHealthEnum('health').default('never_validated').notNull(),
  encryptedCredentials: text('encrypted_credentials').notNull(),
  externalAccountId: text('external_account_id'),
  lastValidatedAt: timestamp('last_validated_at'),
  lastErrorMessage: text('last_error_message'),
  validationFailureCount: integer('validation_failure_count').default(0).notNull(),
  scopes: jsonb('scopes').$type<string[]>().default([]).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  tenantPlatformIdx: uniqueIndex('tenant_connections_tenant_platform_idx').on(table.tenantId, table.platform),
  healthIdx: index('tenant_connections_health_idx').on(table.health),
}));

// ─── Customer Profiles (CDP) ──────────────────────────────────────────────────

export const customerProfiles = pgTable('customer_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  externalId: text('external_id').notNull(),
  name: text('name'),
  phone: text('phone'),
  email: text('email'),
  lastBookingAt: timestamp('last_booking_at'),
  lifetimeValue: doublePrecision('lifetime_value').default(0).notNull(),
  totalBookings: integer('total_bookings').default(0).notNull(),
  segment: text('segment').default('new').notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  tenantExternalIdx: uniqueIndex('customer_profiles_tenant_external_idx').on(table.tenantId, table.externalId),
  tenantSegmentIdx: index('customer_profiles_tenant_segment_idx').on(table.tenantId, table.segment),
}));

// ─── Connection Events ────────────────────────────────────────────────────────

export const connectionEvents = pgTable('connection_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  connectionId: uuid('connection_id').references(() => tenantConnections.id, { onDelete: 'cascade' }).notNull(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  eventType: text('event_type').notNull(),
  success: boolean('success').notNull(),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  connectionIdx: index('connection_events_connection_idx').on(table.connectionId),
  tenantCreatedIdx: index('connection_events_tenant_created_idx').on(table.tenantId, table.createdAt),
}));

// ─── Budget Policies ──────────────────────────────────────────────────────────

export const budgetPolicies = pgTable('budget_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  mode: budgetModeEnum('mode').default('auto_growth').notNull(),
  minRoas: doublePrecision('min_roas').default(2.0).notNull(),
  minCashReserve: doublePrecision('min_cash_reserve').default(5_000_000).notNull(),
  maxDailyBudget: doublePrecision('max_daily_budget').default(10_000_000).notNull(),
  fixedDailyBudget: doublePrecision('fixed_daily_budget'),
  targetRevenuePercent: doublePrecision('target_revenue_percent').default(0.10).notNull(),
  roasLookbackDays: integer('roas_lookback_days').default(7).notNull(),
  maxChangesPerDay: integer('max_changes_per_day').default(2).notNull(),
  platforms: jsonb('platforms').$type<string[]>().default(['meta_ads']).notNull(),
  active: boolean('active').default(true).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  tenantIdx: uniqueIndex('budget_policies_tenant_idx').on(table.tenantId),
}));

// ─── Performance Snapshots ────────────────────────────────────────────────────

export const performanceSnapshots = pgTable('performance_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  platform: platformEnum('platform').notNull(),
  periodDate: date('period_date').notNull(),
  spend: doublePrecision('spend').default(0).notNull(),
  impressions: integer('impressions').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  conversions: integer('conversions').default(0).notNull(),
  revenue: doublePrecision('revenue').default(0).notNull(),
  roas: doublePrecision('roas').default(0).notNull(),
  cpc: doublePrecision('cpc').default(0).notNull(),
  ctr: doublePrecision('ctr').default(0).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tenantPlatformDateIdx: uniqueIndex('perf_snapshots_tenant_platform_date_idx').on(
    table.tenantId, table.platform, table.periodDate
  ),
  tenantDateIdx: index('perf_snapshots_tenant_date_idx').on(table.tenantId, table.periodDate),
}));

// ─── Data Snapshots ───────────────────────────────────────────────────────────

export const dataSnapshots = pgTable('data_snapshots', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  snapshotType: text('snapshot_type').notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  data: jsonb('data').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tenantTypeIdx: index('data_snapshots_tenant_type_idx').on(table.tenantId, table.snapshotType),
}));

// ─── Action Log ───────────────────────────────────────────────────────────────

export const actionLog = pgTable('action_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  actionType: text('action_type').notNull(),
  platform: platformEnum('platform'),
  status: actionStatusEnum('status').default('planned').notNull(),
  executionMode: executionModeEnum('execution_mode').default('shadow').notNull(),
  inputData: jsonb('input_data').$type<Record<string, unknown>>().default({}).notNull(),
  outputData: jsonb('output_data').$type<Record<string, unknown>>().default({}).notNull(),
  errorMessage: text('error_message'),
  executedAt: timestamp('executed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tenantCreatedIdx: index('action_log_tenant_created_idx').on(table.tenantId, table.createdAt),
  tenantStatusIdx: index('action_log_tenant_status_idx').on(table.tenantId, table.status),
}));

// ─── Message Log ──────────────────────────────────────────────────────────────

export const messageLog = pgTable('message_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  channel: messageChannelEnum('channel').notNull(),
  recipient: text('recipient').notNull(),
  templateId: text('template_id'),
  status: messageStatusEnum('status').default('queued').notNull(),
  externalMessageId: text('external_message_id'),
  content: text('content').notNull(),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  readAt: timestamp('read_at'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tenantCreatedIdx: index('message_log_tenant_created_idx').on(table.tenantId, table.createdAt),
  tenantStatusIdx: index('message_log_tenant_status_idx').on(table.tenantId, table.status),
}));

// ─── Message Templates ────────────────────────────────────────────────────────

export const messageTemplates = pgTable('message_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  channel: messageChannelEnum('channel').notNull(),
  subject: text('subject'),
  body: text('body').notNull(),
  variables: jsonb('variables').$type<string[]>().default([]).notNull(),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  tenantNameIdx: uniqueIndex('message_templates_tenant_name_idx').on(table.tenantId, table.name),
}));
