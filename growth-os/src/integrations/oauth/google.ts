import { env } from '../../config.js';
import { db } from '../../db/index.js';
import { tenantConnections } from '../../db/schema.js';
import { encrypt, decrypt } from '../crypto.js';
import { eq, and } from 'drizzle-orm';

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_ADS_ACCOUNTS_URL = 'https://googleads.googleapis.com/v17/customers:listAccessibleCustomers';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export const googleOAuth = {
  getAuthUrl(tenantId: string, state: string): string {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: `${env.APP_URL}/oauth/google/callback`,
      response_type: 'code',
      scope: [
        'https://www.googleapis.com/auth/adwords',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: `${tenantId}:${state}`,
    });
    return `${GOOGLE_AUTH_BASE}?${params}`;
  },

  async exchangeCode(code: string, tenantId: string): Promise<void> {
    const res = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${env.APP_URL}/oauth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Google token exchange failed: ${err}`);
    }

    const tokens = await res.json() as GoogleTokenResponse;

    // Fetch accessible Google Ads customer IDs
    const accountsRes = await fetch(GOOGLE_ADS_ACCOUNTS_URL, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'developer-token': env.GOOGLE_ADS_DEVELOPER_TOKEN,
      },
    });
    const accounts = await accountsRes.json() as { resourceNames?: string[] };
    const customerId = accounts.resourceNames?.[0]?.replace('customers/', '') ?? '';

    const credentials = encrypt(JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      customer_id: customerId,
      expires_at: Date.now() + tokens.expires_in * 1000,
    }));

    await db
      .insert(tenantConnections)
      .values({
        tenantId,
        platform: 'google_ads',
        authType: 'oauth2',
        health: 'healthy',
        encryptedCredentials: credentials,
        externalAccountId: customerId,
        scopes: ['adwords', 'userinfo.email'],
        lastValidatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [tenantConnections.tenantId, tenantConnections.platform],
        set: {
          encryptedCredentials: credentials,
          health: 'healthy',
          externalAccountId: customerId,
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
          eq(tenantConnections.platform, 'google_ads'),
        ),
      });
      if (!conn) return false;

      const creds = JSON.parse(decrypt(conn.encryptedCredentials)) as {
        refresh_token?: string;
        expires_at?: number;
      };

      if (!creds.refresh_token) return false;

      // Only refresh if expired
      if (creds.expires_at && creds.expires_at > Date.now() + 60_000) return true;

      const res = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: creds.refresh_token,
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
        }),
      });

      if (!res.ok) {
        await db
          .update(tenantConnections)
          .set({ health: 'expired', updatedAt: new Date() })
          .where(eq(tenantConnections.id, conn.id));
        return false;
      }

      const newTokens = await res.json() as GoogleTokenResponse;
      const updatedCreds = encrypt(JSON.stringify({
        ...creds,
        access_token: newTokens.access_token,
        expires_at: Date.now() + newTokens.expires_in * 1000,
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
