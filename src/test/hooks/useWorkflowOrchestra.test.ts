import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

import "@/test/mocks/supabase";
import { mockSupabase } from "@/test/mocks/supabase";

import { useWorkflowOrchestra } from "@/hooks/useWorkflowOrchestra";

// ─── Fetch mock helpers ────────────────────────────────────────────────────────

function makeFetchOk(body: object): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response);
}

function makeFetchError(message = "Request failed"): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: false,
    json: vi.fn().mockResolvedValue({ error: message }),
    status: 500,
  } as unknown as Response);
}

const FAKE_WORKFLOW = {
  id: "wf-001",
  current_status: "planning",
  project_description: "Test project",
  client_name: "Test Client",
  user_id: "user-123",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useWorkflowOrchestra", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default Supabase channel mock
    mockSupabase.channel.mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("initial state", () => {
    it("starts with no workflow, not processing, no error", () => {
      const { result } = renderHook(() => useWorkflowOrchestra());
      expect(result.current.workflow).toBeNull();
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("startWorkflow()", () => {
    it("calls orchestra with action=start and returns a workflow", async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ id: "wf-001" }) })
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(FAKE_WORKFLOW) });
      vi.stubGlobal("fetch", mockFetch);

      const { result } = renderHook(() => useWorkflowOrchestra());

      await act(async () => {
        await result.current.startWorkflow("Build a CRM", "user-123");
      });

      expect(result.current.workflow).toEqual(FAKE_WORKFLOW);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();

      // First call should be action=start
      const firstBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(firstBody.action).toBe("start");
      expect(firstBody.project_description).toBe("Build a CRM");
      expect(firstBody.user_id).toBe("user-123");

      // Second call should be action=status
      const secondBody = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(secondBody.action).toBe("status");
      expect(secondBody.workflow_id).toBe("wf-001");
    });

    it("sets error and clears isProcessing on fetch failure", async () => {
      vi.stubGlobal("fetch", makeFetchError("Network error"));

      const { result } = renderHook(() => useWorkflowOrchestra());

      await act(async () => {
        try {
          await result.current.startWorkflow("project", "user-1");
        } catch {
          // expected to throw
        }
      });

      expect(result.current.error).toBe("Network error");
      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe("advanceWorkflow()", () => {
    it("does nothing when no workflow is set", async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      const { result } = renderHook(() => useWorkflowOrchestra());

      await act(async () => {
        await result.current.advanceWorkflow();
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("calls action=advance then action=status and updates workflow", async () => {
      const advancedWorkflow = { ...FAKE_WORKFLOW, current_status: "architecting" };
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ status: "architecting" }) })
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(advancedWorkflow) });
      vi.stubGlobal("fetch", mockFetch);

      const { result } = renderHook(() => useWorkflowOrchestra());

      // Seed workflow state
      act(() => {
        result.current.setWorkflow(FAKE_WORKFLOW as any);
      });

      await act(async () => {
        await result.current.advanceWorkflow();
      });

      const advanceBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(advanceBody.action).toBe("advance");
      expect(advanceBody.workflow_id).toBe("wf-001");

      expect(result.current.workflow?.current_status).toBe("architecting");
    });
  });

  describe("sendNegotiationMessage()", () => {
    it("returns null when no workflow is set", async () => {
      vi.stubGlobal("fetch", vi.fn());
      const { result } = renderHook(() => useWorkflowOrchestra());

      let ret: unknown;
      await act(async () => {
        ret = await result.current.sendNegotiationMessage("Hello");
      });
      expect(ret).toBeNull();
    });

    it("calls action=negotiate with the message and refreshes state", async () => {
      const negotiatedWorkflow = {
        ...FAKE_WORKFLOW,
        current_status: "negotiating",
        negotiation_history: [{ role: "client", message: "Can we lower the price?" }],
      };
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({ response: "Let me check...", deal_status: "counter" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(negotiatedWorkflow),
        });
      vi.stubGlobal("fetch", mockFetch);

      const { result } = renderHook(() => useWorkflowOrchestra());

      act(() => {
        result.current.setWorkflow({ ...FAKE_WORKFLOW, current_status: "negotiating" } as any);
      });

      let ret: unknown;
      await act(async () => {
        ret = await result.current.sendNegotiationMessage("Can we lower the price?");
      });

      const negotiateBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(negotiateBody.action).toBe("negotiate");
      expect(negotiateBody.negotiation_message).toBe("Can we lower the price?");
      expect((ret as any).deal_status).toBe("counter");
    });
  });

  describe("sendOverride()", () => {
    it("calls action=override with the override action and refreshes state", async () => {
      const pausedWorkflow = { ...FAKE_WORKFLOW, current_status: "paused" };
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ success: true }) })
        .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue(pausedWorkflow) });
      vi.stubGlobal("fetch", mockFetch);

      const { result } = renderHook(() => useWorkflowOrchestra());

      act(() => {
        result.current.setWorkflow(FAKE_WORKFLOW as any);
      });

      await act(async () => {
        await result.current.sendOverride("pause", "Taking a break");
      });

      const overrideBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(overrideBody.action).toBe("override");
      expect(overrideBody.override.action).toBe("pause");
      expect(overrideBody.override.reason).toBe("Taking a break");

      expect(result.current.workflow?.current_status).toBe("paused");
    });
  });

  describe("realtime subscription", () => {
    it("subscribes to workflow_runs channel when workflow.id is set", () => {
      const { result } = renderHook(() => useWorkflowOrchestra());

      act(() => {
        result.current.setWorkflow(FAKE_WORKFLOW as any);
      });

      expect(mockSupabase.channel).toHaveBeenCalledWith("workflow:wf-001");
    });

    it("does not subscribe when workflow is null", () => {
      renderHook(() => useWorkflowOrchestra());
      expect(mockSupabase.channel).not.toHaveBeenCalled();
    });
  });
});
