import type { tenants } from './db/schema.js';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

export type TenantRow = typeof tenants.$inferSelect;

export interface HonoVariables {
  user: AuthUser;
  userId: string;
  tenant: TenantRow;
  tenantId: string;
}
