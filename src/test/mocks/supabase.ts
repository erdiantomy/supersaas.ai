import { vi } from "vitest";

// A chainable mock builder — every method returns `this` unless overridden.
function makeQueryBuilder(overrides: Record<string, unknown> = {}) {
  const builder: Record<string, unknown> = {};
  const chainMethods = [
    "select", "insert", "update", "delete", "upsert",
    "eq", "neq", "gt", "gte", "lt", "lte",
    "in", "is", "like", "ilike",
    "order", "limit", "range",
    "not", "or", "filter",
  ];
  chainMethods.forEach((m) => {
    builder[m] = vi.fn().mockReturnValue(builder);
  });
  // Terminal resolvers default to success
  builder["single"] = vi.fn().mockResolvedValue({ data: null, error: null });
  builder["maybeSingle"] = vi.fn().mockResolvedValue({ data: null, error: null });
  // insert / update resolve immediately (non-terminal chain)
  builder["then"] = undefined; // not a Promise itself

  // Allow test-level overrides
  Object.assign(builder, overrides);
  return builder;
}

export const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
  },
  from: vi.fn(() => makeQueryBuilder()),
  channel: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  })),
  removeChannel: vi.fn().mockResolvedValue(undefined),
  functions: {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
  },
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: mockSupabase,
}));
