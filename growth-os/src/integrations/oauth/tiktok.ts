import { env } from '../../config.js';
import { db } from '../../db/index.js';
import { tenantConnections } from '../../db/schema.js';
import { encrypt, decrypt } from '../crypto.js';
import { eq, and } from 'drizzle-orm';

const TIKTOK_AUTH_BASE = 'https://business-api.tiktok.com/portal/auth';
const TIKTOK_TOKEN_URL = 'https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/';
const TIKTOK_REFRESH_URL = 'https://business-api.tiktok.com/open_api/v1.3/oauth2/refresh_token/';
const TIKTOK_ADVERTISERS_URL = 'https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/';

export const tiktokOAuth = {
  getAuthUrl(tenantId: string, state: string): string {
    const params = new URLSearchParams({
      app_id: env.TIKTOK_APP_ID,
      redirect_uri: `${env.APP_URL}/oauth/tiktok/callback`,
      state: `${tenantId}:${state}`,
    });
    return `${TIKTOK_AUTH_BASE}?${params}`;
  },

  async exchangeCode(code: string, tenantId: string): Promise<void> {
    const res = await fetch(TIKTOK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: env.TIKTOK_APP_ID,
        secret: env.TIKTOK_APP_SECRET,
        auth_code: code,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`TikTok token exchange failed: ${err}`);
    }

    const data = await res.json() as {
      data?: {
        access_token?: string;
        refresh_token?: string;
        advertiser_ids?: string[];
        expires_in?: number;
        refresh_token_expires_in?: number;
      };
    };

    const tokens = data.data ?? {};
    const accessToken = tokens.access_token ?? '';
    const advertiserId = tokens.advertiser_ids?.[0] ?? '';

    const credentials = encrypt(JSON.stringify({
      access_token: accessToken,
      refresh_token: tokens.refresh_token,
      advertiser_id: advertiserId,
      expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
      refresh_expires_at: Date.now() + (tokens.refresh_token_expires_in ?? 86400) * 1000,
    }));

    await db
      .insert(tenantConnections)
      .values({
        tenantId,
        platform: 'tiktok_ads',
        authType: 'oauth2',
        health: 'healthy',
        encryptedCredentials: credentials,
        externalAccountId: advertiserId,
        scopes: ['REPORTING', 'CAMPAIGN_MANAGEMENT'],
        lastValidatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [tenantConnections.tenantId, tenantConnections.platform],
        set: {
          encryptedCredentials: credentials,
          health: 'healthy',
          externalAccountId: advertiserId,
          lastValidatedAt: new Date(),
          validationFailureCount: 0,
          updatedAt: new Date(),
        },
      });
  },

  async refreshToken(tenantId: string): Promise<boolean> {
    try {
      const conn = await db.query.tenantConnections.findFirst({
        where: and(
          eq(tenantConnections.tenantId, tenantId),
          eq(tenantConnections.platform, 'tiktok_ads'),
        ),
      });
      if (!conn) return false;

      const creds = JSON.parse(decrypt(conn.encryptedCredentials)) as {
        refresh_token?: string;
        expires_at?: number;
        refresh_expires_at?: number;
      };

      if (!creds.refresh_token) return false;
      if (creds.expires_at && creds.expires_at > Date.now() + 60_000) return true;

      const res = await fetch(TIKTOK_REFRESH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: env.TIKTOK_APP_ID,
          secret: env.TIKTOK_APP_SECRET,
          refresh_token: creds.refresh_token,
        }),
      });

      if (!res.ok) {
        await db
          .update(tenantConnections)
          .set({ health: 'expired', updatedAt: new Date() })
          .where(eq(tenantConnections.id, conn.id));
        return false;
      }

      const data = await res.json() as {
        data?: { access_token?: string; refresh_token?: string; expires_in?: number };
      };
      const newTokens = data.data ?? {};

      const updatedCreds = encrypt(JSON.stringify({
        ...creds,
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token ?? creds.refresh_token,
        expires_at: Date.now() + (newTokens.expires_in ?? 3600) * 1000,
      }));

      await db
        .update(tenantConnections)
        .set({
          encryptedCredentials: updatedCreds,
          health: 'healthy',
          lastValidatedAt: new Date(),
          validationFailureCount: 0,
          updatedAt: new Date(),
        })
        .where(eq(tenantConnections.id, conn.id));

      return true;
    } catch {
      return false;
    }
  },
};
