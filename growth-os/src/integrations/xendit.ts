import { db } from '../db/index.js';
import { tenantConnections } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { decrypt } from './crypto.js';

const XENDIT_BASE = 'https://api.xendit.co';

interface XenditBalance {
  balance: number;
  currency: string;
}

interface XenditTransaction {
  id: string;
  amount: number;
  status: string;
  type: string;
  created: string;
  reference_id?: string;
}

async function getXenditKey(tenantId: string): Promise<string> {
  const conn = await db.query.tenantConnections.findFirst({
    where: and(
      eq(tenantConnections.tenantId, tenantId),
      eq(tenantConnections.platform, 'xendit'),
    ),
  });
  if (!conn) throw new Error(`No Xendit connection for tenant ${tenantId}`);
  const creds = JSON.parse(decrypt(conn.encryptedCredentials)) as { secret_key: string };
  return creds.secret_key;
}

export const xenditIntegration = {
  getAvailableBalance: async (tenantId: string): Promise<number> => {
    const secretKey = await getXenditKey(tenantId);
    const auth = Buffer.from(`${secretKey}:`).toString('base64');

    const response = await fetch(`${XENDIT_BASE}/balance`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Xendit balance error ${response.status}: ${text}`);
    }

    const data = await response.json() as XenditBalance;
    return data.balance;
  },

  getRecentTransactions: async (
    tenantId: string,
    afterId?: string,
    limit = 50,
  ): Promise<XenditTransaction[]> => {
    const secretKey = await getXenditKey(tenantId);
    const auth = Buffer.from(`${secretKey}:`).toString('base64');

    const params = new URLSearchParams({ limit: String(limit) });
    if (afterId) params.set('after_id', afterId);

    const response = await fetch(`${XENDIT_BASE}/transactions?${params}`, {
      headers: { 'Authorization': `Basic ${auth}` },
    });

    if (!response.ok) {
      throw new Error(`Xendit transactions error ${response.status}`);
    }

    const data = await response.json() as { data?: XenditTransaction[] };
    return data.data ?? [];
  },

  /**
   * Calculate net inflow from recent transactions for cash-flow loop.
   */
  getNetInflow: async (tenantId: string, days = 7): Promise<number> => {
    const txns = await xenditIntegration.getRecentTransactions(tenantId, undefined, 200);
    const cutoff = Date.now() - days * 86_400_000;

    return txns
      .filter((t) => new Date(t.created).getTime() >= cutoff && t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0);
  },
};
