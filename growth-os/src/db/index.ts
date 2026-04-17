import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../config.js';
import * as schema from './schema.js';

const queryClient = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
  onnotice: () => {},
});

export const db = drizzle(queryClient, { schema, logger: env.NODE_ENV === 'development' });

export type DB = typeof db;
export { schema };
