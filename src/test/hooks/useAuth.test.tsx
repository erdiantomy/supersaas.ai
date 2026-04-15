import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";

// Pull in supabase mock before the hook under test
import "@/test/mocks/supabase";
import { mockSupabase } from "@/test/mocks/supabase";

import { AuthProvider, useAuth } from "@/hooks/useAuth";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no active session
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockImplementation((_event, _cb) => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));
  });

  describe("initial state", () => {
    it("starts with loading=true and all values null", () => {
      mockSupabase.auth.onAuthStateChange.mockImplementation((_cb) => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.role).toBeNull();
      expect(result.current.profile).toBeNull();
    });

    it("sets loading=false once getSession resolves with no session", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.session).toBeNull();
      expect(result.current.role).toBeNull();
    });
  });

  describe("authenticated state", () => {
    it("populates session, role, and profile on auth state change", async () => {
      const fakeSession = { user: { id: "user-123" } };

      // Set up the role and profile DB responses
      mockSupabase.from.mockImplementation((table: string) => {
        const builder = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue(
            table === "user_roles"
              ? { data: { role: "admin" }, error: null }
              : { data: { full_name: "Alice", avatar_url: null }, error: null }
          ),
        };
        return builder;
      });

      let capturedCallback: (event: string, session: unknown) => void;
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Simulate a SIGNED_IN event
      act(() => {
        capturedCallback!("SIGNED_IN", fakeSession);
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.session).toEqual(fakeSession);
      expect(result.current.user).toEqual(fakeSession.user);
      expect(result.current.role).toBe("admin");
      expect(result.current.profile).toEqual({ full_name: "Alice", avatar_url: null });
    });
  });

  describe("sign-out", () => {
    it("calls supabase.auth.signOut() when signOut is invoked", async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSupabase.auth.signOut).toHaveBeenCalledOnce();
    });

    it("resets session, role, and profile on SIGNED_OUT event", async () => {
      let capturedCallback: (event: string, session: unknown) => void;
      mockSupabase.auth.onAuthStateChange.mockImplementation((cb) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Simulate sign-out
      act(() => {
        capturedCallback!("SIGNED_OUT", null);
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.session).toBeNull();
      expect(result.current.role).toBeNull();
      expect(result.current.profile).toBeNull();
    });
  });

  describe("cleanup", () => {
    it("unsubscribes from auth state changes on unmount", () => {
      const unsubscribe = vi.fn();
      mockSupabase.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe } },
      });

      const { unmount } = renderHook(() => useAuth(), { wrapper });
      unmount();

      expect(unsubscribe).toHaveBeenCalledOnce();
    });
  });
});
