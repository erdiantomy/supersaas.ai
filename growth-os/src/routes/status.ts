import { Hono } from 'hono';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

const status = new Hono();

status.get('/health', async (c) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({
      status: 'ok',
      service: 'growth-os',
      version: '3.1.0',
      timestamp: new Date().toISOString(),
      db: 'connected',
    });
  } catch {
    return c.json({ status: 'error', db: 'disconnected' }, 503);
  }
});

status.get('/ready', (c) => c.json({ ready: true }));

export { status as statusRoutes };
