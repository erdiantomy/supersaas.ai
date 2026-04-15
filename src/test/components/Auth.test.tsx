import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mock supabase before importing the component
import "@/test/mocks/supabase";
import { mockSupabase } from "@/test/mocks/supabase";

// Mock useAuth
vi.mock("@/hooks/useAuth");

// Mock react-router-dom — keep Navigate inspectable
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
  };
});

// Capture the toast spy so we can assert on it across tests
const mockToast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

import { useAuth } from "@/hooks/useAuth";
import Auth from "@/pages/Auth";

type MockAuth = {
  loading: boolean;
  session: object | null;
  role: "admin" | "client" | null;
  profile: null;
  user: null;
  signOut: () => Promise<void>;
};

function mockAuth(overrides: Partial<MockAuth> = {}) {
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

describe("Auth page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    mockSupabase.auth.signUp.mockResolvedValue({ error: null });
  });

  describe("redirect when already authenticated", () => {
    it("redirects admin to /dashboard if already logged in", () => {
      mockAuth({ session: {}, role: "admin" });
      render(<Auth />);
      expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/dashboard");
    });

    it("redirects client to /portal if already logged in", () => {
      mockAuth({ session: {}, role: "client" });
      render(<Auth />);
      expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/portal");
    });
  });

  describe("loading state", () => {
    it("shows a spinner while auth is resolving", () => {
      mockAuth({ loading: true });
      render(<Auth />);
      expect(document.querySelector(".animate-spin")).toBeTruthy();
    });
  });

  describe("sign-in form (default)", () => {
    beforeEach(() => mockAuth());

    it("renders email and password inputs by default", () => {
      render(<Auth />);
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    });

    it("does NOT show the full-name field in sign-in mode", () => {
      render(<Auth />);
      expect(screen.queryByPlaceholderText("Full name")).not.toBeInTheDocument();
    });

    it("calls signInWithPassword with correct credentials on submit", async () => {
      render(<Auth />);

      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "user@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "secret123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: "user@example.com",
          password: "secret123",
        });
      });
    });

    it("shows an error toast when sign-in fails", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { message: "Invalid credentials" },
      });

      render(<Auth />);

      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "bad@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "wrong" },
      });
      fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ variant: "destructive" })
        );
      });
    });
  });

  describe("sign-up form toggle", () => {
    beforeEach(() => mockAuth());

    it("shows the full-name field after clicking the toggle", () => {
      render(<Auth />);

      // Click "Don't have an account? Sign up"
      fireEvent.click(screen.getByText(/don't have an account/i));

      expect(screen.getByPlaceholderText("Full name")).toBeInTheDocument();
    });

    it("calls signUp with email, password, and full_name data", async () => {
      render(<Auth />);
      fireEvent.click(screen.getByText(/don't have an account/i));

      fireEvent.change(screen.getByPlaceholderText("Full name"), {
        target: { value: "Alice" },
      });
      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "alice@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /create account/i }));

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "alice@example.com",
            password: "password123",
            options: expect.objectContaining({
              data: { full_name: "Alice" },
            }),
          })
        );
      });
    });

    it("toggles back to sign-in when 'Already have an account?' is clicked", () => {
      render(<Auth />);
      fireEvent.click(screen.getByText(/don't have an account/i));
      fireEvent.click(screen.getByText(/already have an account/i));
      expect(screen.queryByPlaceholderText("Full name")).not.toBeInTheDocument();
    });
  });
});
