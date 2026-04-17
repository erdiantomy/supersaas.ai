import type { Context, Next } from 'hono';
import type { HonoVariables } from '../types.js';
import { env } from '../config.js';

const SUPABASE_AUTH_URL = `${env.SUPABASE_URL}/auth/v1/user`;

export async function authMiddleware(
  c: Context<{ Variables: HonoVariables }>,
  next: Next,
): Promise<Response | void> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'missing_authorization_header' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const res = await fetch(SUPABASE_AUTH_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': env.SUPABASE_ANON_KEY,
      },
    });

    if (!res.ok) return c.json({ error: 'invalid_token' }, 401);

    const user = await res.json() as HonoVariables['user'];
    c.set('user', user);
    c.set('userId', user.id);
  } catch {
    return c.json({ error: 'auth_service_unavailable' }, 503);
  }

  await next();
}

export async function serviceAuthMiddleware(
  c: Context<{ Variables: HonoVariables }>,
  next: Next,
): Promise<Response | void> {
  const apiKey = c.req.header('X-Service-Key');
  if (apiKey !== env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ error: 'invalid_service_key' }, 401);
  }
  await next();
}
