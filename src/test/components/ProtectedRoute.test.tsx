import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";

// Mock useAuth before importing the component
vi.mock("@/hooks/useAuth");

// Mock Navigate so we can inspect redirect targets without a real router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="navigate" data-to={to} />
    ),
  };
});

import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Child = () => <div data-testid="child">Protected Content</div>;

type MockAuth = {
  loading: boolean;
  session: object | null;
  role: "admin" | "client" | null;
  profile: null;
  user: null;
  signOut: () => Promise<void>;
};

function mockAuth(overrides: Partial<MockAuth>) {
  vi.mocked(useAuth).mockReturnValue({
    loading: false,
    session: null,
    role: null,
    profile: null,
    user: null,
    signOut: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAuth>);
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("shows a loading spinner (not children, not redirect) while auth is resolving", () => {
      mockAuth({ loading: true, session: null });
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <Child />
          </ProtectedRoute>
        </MemoryRouter>
      );
      expect(screen.queryByTestId("child")).not.toBeInTheDocument();
      expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
      // The spinner container is rendered
      expect(document.querySelector(".animate-spin")).toBeTruthy();
    });
  });

  describe("unauthenticated (no session)", () => {
    it("redirects to /auth when there is no session", () => {
      mockAuth({ session: null });
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <Child />
          </ProtectedRoute>
        </MemoryRouter>
      );
      const nav = screen.getByTestId("navigate");
      expect(nav).toHaveAttribute("data-to", "/auth");
    });
  });

  describe("authenticated — no role restriction", () => {
    it("renders children when session exists and allowedRoles is not set", () => {
      mockAuth({ session: {}, role: "admin" });
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <Child />
          </ProtectedRoute>
        </MemoryRouter>
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });

  describe("role-based access control", () => {
    it("renders children when the user's role matches allowedRoles", () => {
      mockAuth({ session: {}, role: "admin" });
      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Child />
          </ProtectedRoute>
        </MemoryRouter>
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("renders children when client role matches allowedRoles", () => {
      mockAuth({ session: {}, role: "client" });
      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={["client"]}>
            <Child />
          </ProtectedRoute>
        </MemoryRouter>
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("redirects admin to /dashboard when accessing a client-only route", () => {
      mockAuth({ session: {}, role: "admin" });
      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={["client"]}>
            <Child />
          </ProtectedRoute>
        </MemoryRouter>
      );
      const nav = screen.getByTestId("navigate");
      expect(nav).toHaveAttribute("data-to", "/dashboard");
    });

    it("redirects client to /portal when accessing an admin-only route", () => {
      mockAuth({ session: {}, role: "client" });
      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Child />
          </ProtectedRoute>
        </MemoryRouter>
      );
      const nav = screen.getByTestId("navigate");
      expect(nav).toHaveAttribute("data-to", "/portal");
    });

    it("uses custom fallback path over the default role-based redirect", () => {
      mockAuth({ session: {}, role: "client" });
      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={["admin"]} fallback="/custom-fallback">
            <Child />
          </ProtectedRoute>
        </MemoryRouter>
      );
      const nav = screen.getByTestId("navigate");
      expect(nav).toHaveAttribute("data-to", "/custom-fallback");
    });
  });

  describe("no role yet (newly signed up)", () => {
    it("redirects to /portal when session exists but role has not been assigned", () => {
      mockAuth({ session: {}, role: null });
      render(
        <MemoryRouter>
          <ProtectedRoute allowedRoles={["admin"]}>
            <Child />
          </ProtectedRoute>
        </MemoryRouter>
      );
      const nav = screen.getByTestId("navigate");
      expect(nav).toHaveAttribute("data-to", "/portal");
    });

    it("renders children when allowedRoles is not set — role not yet known is allowed through", () => {
      mockAuth({ session: {}, role: null });
      render(
        <MemoryRouter>
          <ProtectedRoute>
            <Child />
          </ProtectedRoute>
        </MemoryRouter>
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });
  });
});
