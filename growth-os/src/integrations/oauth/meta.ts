import { env } from '../../config.js';
import { db } from '../../db/index.js';
import { tenantConnections } from '../../db/schema.js';
import { encrypt } from '../crypto.js';
import { eq, and } from 'drizzle-orm';

const META_OAUTH_BASE = 'https://www.facebook.com/v21.0/dialog/oauth';
const META_TOKEN_URL = 'https://graph.facebook.com/v21.0/oauth/access_token';
const META_API_BASE = 'https://graph.facebook.com/v21.0';

export const metaOAuth = {
  getAuthUrl(tenantId: string, state: string): string {
    const params = new URLSearchParams({
      client_id: env.META_APP_ID,
      redirect_uri: `${env.APP_URL}/oauth/meta/callback`,
      scope: 'ads_read,ads_management,business_management,read_insights',
      response_type: 'code',
      state: `${tenantId}:${state}`,
    });
    return `${META_OAUTH_BASE}?${params}`;
  },

  async exchangeCode(code: string, tenantId: string): Promise<void> {
    // Exchange code for token
    const tokenRes = await fetch(
      `${META_TOKEN_URL}?${new URLSearchParams({
        client_id: env.META_APP_ID,
        client_secret: env.META_APP_SECRET,
        redirect_uri: `${env.APP_URL}/oauth/meta/callback`,
        code,
      })}`,
    );
    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Meta token exchange failed: ${err}`);
    }
    const { access_token } = await tokenRes.json() as { access_token: string };

    // Exchange for long-lived token
    const longLivedRes = await fetch(
      `${META_TOKEN_URL}?${new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: env.META_APP_ID,
        client_secret: env.META_APP_SECRET,
        fb_exchange_token: access_token,
      })}`,
    );
    const { access_token: longToken } = await longLivedRes.json() as { access_token: string };

    // Fetch ad accounts
    const accountsRes = await fetch(
      `${META_API_BASE}/me/adaccounts?fields=id,name&access_token=${longToken}`,
    );
    const accounts = await accountsRes.json() as { data?: Array<{ id: string; name: string }> };
    const adAccountId = accounts.data?.[0]?.id?.replace('act_', '') ?? '';

    const credentials = encrypt(JSON.stringify({ access_token: longToken, ad_account_id: adAccountId }));

    await db
      .insert(tenantConnections)
      .values({
        tenantId,
        platform: 'meta_ads',
        authType: 'oauth2',
        health: 'healthy',
        encryptedCredentials: credentials,
        externalAccountId: adAccountId,
        scopes: ['ads_read', 'ads_management', 'business_management', 'read_insights'],
        lastValidatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [tenantConnections.tenantId, tenantConnections.platform],
        set: {
          encryptedCredentials: credentials,
          health: 'healthy',
          externalAccountId: adAccountId,
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
          eq(tenantConnections.platform, 'meta_ads'),
        ),
      });
      if (!conn) return false;

      // Meta long-lived tokens last 60 days; re-validate by making an API call
      const creds = JSON.parse(conn.encryptedCredentials) as { access_token: string };
      const res = await fetch(`${META_API_BASE}/me?access_token=${creds.access_token}`);

      if (res.ok) {
        await db
          .update(tenantConnections)
          .set({ health: 'healthy', lastValidatedAt: new Date(), updatedAt: new Date() })
          .where(eq(tenantConnections.id, conn.id));
        return true;
      }

      await db
        .update(tenantConnections)
        .set({ health: 'expired', updatedAt: new Date() })
        .where(eq(tenantConnections.id, conn.id));
      return false;
    } catch {
      return false;
    }
  },
};
