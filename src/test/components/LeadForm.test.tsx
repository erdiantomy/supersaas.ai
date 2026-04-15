import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

import "@/test/mocks/supabase";
import { mockSupabase } from "@/test/mocks/supabase";

// Framer Motion animations cause issues in jsdom — stub them out
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop) =>
        // eslint-disable-next-line react/display-name
        ({ children, ...rest }: React.PropsWithChildren<Record<string, unknown>>) =>
          React.createElement(prop as string, rest, children),
    }
  ),
  AnimatePresence: ({ children }: React.PropsWithChildren) => children,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import { LeadForm } from "@/components/landing/LeadForm";

describe("LeadForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up chainable insert mock that resolves successfully
    const insertBuilder = {
      insert: vi.fn().mockResolvedValue({ error: null }),
    };
    mockSupabase.from.mockReturnValue(insertBuilder as any);
    mockSupabase.functions.invoke.mockResolvedValue({ data: null, error: null });
  });

  describe("initial render", () => {
    it("shows the form with all inputs", () => {
      render(<LeadForm />);
      expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Work email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Company name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Tell us about/i)).toBeInTheDocument();
    });

    it("does not show the success state initially", () => {
      render(<LeadForm />);
      expect(screen.queryByText(/agents deployed/i)).not.toBeInTheDocument();
    });
  });

  describe("form submission", () => {
    async function fillAndSubmit() {
      fireEvent.change(screen.getByPlaceholderText("Your name"), {
        target: { value: "Bob Smith" },
      });
      fireEvent.change(screen.getByPlaceholderText("Work email"), {
        target: { value: "bob@acme.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Company name"), {
        target: { value: "Acme Corp" },
      });
      fireEvent.change(screen.getByPlaceholderText(/Tell us about/i), {
        target: { value: "We need a CRM" },
      });
      fireEvent.click(screen.getByRole("button", { name: /book free/i }));
    }

    it("calls supabase.from('inquiries').insert with the form data", async () => {
      render(<LeadForm />);
      await fillAndSubmit();

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith("inquiries");
      });

      const insertCall = mockSupabase.from.mock.results[0].value.insert;
      expect(insertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Bob Smith",
          email: "bob@acme.com",
          company: "Acme Corp",
        })
      );
    });

    it("calls supabase.functions.invoke('notify-lead') with the form data", async () => {
      render(<LeadForm />);
      await fillAndSubmit();

      await waitFor(() => {
        expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
          "notify-lead",
          expect.objectContaining({
            body: expect.objectContaining({
              name: "Bob Smith",
              email: "bob@acme.com",
            }),
          })
        );
      });
    });

    it("shows the success state after submission", async () => {
      render(<LeadForm />);
      await fillAndSubmit();

      await waitFor(() => {
        expect(screen.getByText(/agents deployed/i)).toBeInTheDocument();
      });
    });

    it("still shows success even when the DB insert fails (error is swallowed)", async () => {
      const insertBuilder = {
        insert: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
      };
      mockSupabase.from.mockReturnValue(insertBuilder as any);

      render(<LeadForm />);
      await fillAndSubmit();

      await waitFor(() => {
        expect(screen.getByText(/agents deployed/i)).toBeInTheDocument();
      });
    });

    it("still shows success even when notify-lead throws (error is swallowed)", async () => {
      mockSupabase.functions.invoke.mockRejectedValue(new Error("Email service down"));

      render(<LeadForm />);
      await fillAndSubmit();

      await waitFor(() => {
        expect(screen.getByText(/agents deployed/i)).toBeInTheDocument();
      });
    });
  });

  describe("budget field", () => {
    it("includes the selected budget in the message sent to DB", async () => {
      render(<LeadForm />);

      fireEvent.change(screen.getByPlaceholderText("Your name"), {
        target: { value: "Alice" },
      });
      fireEvent.change(screen.getByPlaceholderText("Work email"), {
        target: { value: "alice@example.com" },
      });
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "$15K-$30K" },
      });
      fireEvent.click(screen.getByRole("button", { name: /book free/i }));

      await waitFor(() => {
        const insertCall = mockSupabase.from.mock.results[0].value.insert;
        const insertArg = insertCall.mock.calls[0][0];
        expect(insertArg.message).toContain("$15K-$30K");
      });
    });
  });
});
