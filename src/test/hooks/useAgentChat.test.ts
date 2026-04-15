import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAgentChat } from "@/hooks/useAgentChat";

// ─── SSE Stream helpers ────────────────────────────────────────────────────────

function encodeSSE(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let idx = 0;
  return new ReadableStream({
    pull(controller) {
      if (idx < chunks.length) {
        controller.enqueue(encoder.encode(chunks[idx++]));
      } else {
        controller.close();
      }
    },
  });
}

function sseDataLine(content: string): string {
  return `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n`;
}

const SSE_DONE = "data: [DONE]\n";

function makeFetchOk(chunks: string[]): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: true,
    body: encodeSSE(chunks),
  } as unknown as Response);
}

function makeFetchError(status = 500, message = "Internal Server Error"): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: false,
    body: null,
    json: vi.fn().mockResolvedValue({ error: message }),
    status,
  } as unknown as Response);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useAgentChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("initial state", () => {
    it("starts with empty messages and isLoading=false", () => {
      const { result } = renderHook(() => useAgentChat());
      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it("accepts a custom agentType prop", () => {
      const { result } = renderHook(() => useAgentChat("architect"));
      expect(result.current.messages).toEqual([]);
    });
  });

  describe("reset()", () => {
    it("clears all messages", async () => {
      vi.stubGlobal("fetch", makeFetchOk([sseDataLine("Hello"), SSE_DONE]));

      const { result } = renderHook(() => useAgentChat());

      await act(async () => {
        await result.current.send("hi");
      });

      expect(result.current.messages.length).toBeGreaterThan(0);

      act(() => {
        result.current.reset();
      });

      expect(result.current.messages).toEqual([]);
    });
  });

  describe("send() — user message", () => {
    it("immediately appends the user message before the stream resolves", async () => {
      // Use a slow-resolving promise so we can inspect mid-flight state
      let resolveFetch!: (value: unknown) => void;
      const fetchPromise = new Promise((res) => { resolveFetch = res; });
      vi.stubGlobal("fetch", vi.fn().mockReturnValue(fetchPromise));

      const { result } = renderHook(() => useAgentChat());

      act(() => {
        result.current.send("test input");
      });

      expect(result.current.messages[0]).toEqual({ role: "user", content: "test input" });
      expect(result.current.isLoading).toBe(true);

      // Cleanup: resolve the hanging fetch
      resolveFetch({ ok: false, body: null, json: () => Promise.resolve({ error: "err" }) });
    });

    it("passes history + new message to fetch as the messages array", async () => {
      const mockFetch = makeFetchOk([sseDataLine("reply"), SSE_DONE]);
      vi.stubGlobal("fetch", mockFetch);

      const { result } = renderHook(() => useAgentChat("planner"));

      await act(async () => {
        await result.current.send("first");
      });

      const callBody = JSON.parse((mockFetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(callBody.messages).toEqual([{ role: "user", content: "first" }]);
      expect(callBody.agentType).toBe("planner");
    });
  });

  describe("send() — successful SSE stream", () => {
    it("accumulates streamed content into an assistant message", async () => {
      vi.stubGlobal(
        "fetch",
        makeFetchOk([sseDataLine("Hello"), sseDataLine(", world"), SSE_DONE])
      );

      const { result } = renderHook(() => useAgentChat());

      await act(async () => {
        await result.current.send("hi");
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const assistant = result.current.messages.find((m) => m.role === "assistant");
      expect(assistant).toBeDefined();
      expect(assistant!.content).toContain("Hello");
      expect(assistant!.content).toContain(", world");
    });

    it("stops processing lines after [DONE] in the same chunk", async () => {
      // All lines in ONE chunk: the inner buffer loop breaks on [DONE]
      // and the remaining lines in that same buffer are never processed.
      const singleChunk =
        sseDataLine("Answer") + SSE_DONE + sseDataLine("should not appear");

      vi.stubGlobal("fetch", makeFetchOk([singleChunk]));

      const { result } = renderHook(() => useAgentChat());

      await act(async () => {
        await result.current.send("q");
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const assistant = result.current.messages.find((m) => m.role === "assistant");
      expect(assistant!.content).not.toContain("should not appear");
      expect(assistant!.content).toContain("Answer");
    });

    it("sets isLoading back to false after stream completes", async () => {
      vi.stubGlobal("fetch", makeFetchOk([sseDataLine("ok"), SSE_DONE]));

      const { result } = renderHook(() => useAgentChat());

      await act(async () => {
        await result.current.send("ping");
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });
  });

  describe("send() — HTTP error", () => {
    it("appends an error assistant message when the response is not ok", async () => {
      vi.stubGlobal("fetch", makeFetchError(500, "Internal Server Error"));

      const { result } = renderHook(() => useAgentChat());

      await act(async () => {
        await result.current.send("hello");
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const errorMsg = result.current.messages.find((m) => m.role === "assistant");
      expect(errorMsg).toBeDefined();
      expect(errorMsg!.content).toMatch(/Error:/i);
    });

    it("sets isLoading=false even on error", async () => {
      vi.stubGlobal("fetch", makeFetchError());

      const { result } = renderHook(() => useAgentChat());

      await act(async () => {
        await result.current.send("hello");
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("send() — malformed JSON in stream", () => {
    it("skips malformed data lines without crashing", async () => {
      // One valid line, one invalid JSON, then done
      const chunks = [
        sseDataLine("Valid"),
        "data: {INVALID JSON}\n",
        SSE_DONE,
      ];
      vi.stubGlobal("fetch", makeFetchOk(chunks));

      const { result } = renderHook(() => useAgentChat());

      await act(async () => {
        await result.current.send("test");
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const assistant = result.current.messages.find((m) => m.role === "assistant");
      // Should still have the valid content, not crash
      expect(assistant).toBeDefined();
    });
  });

  describe("setMessages()", () => {
    it("allows external injection of messages", () => {
      const { result } = renderHook(() => useAgentChat());

      act(() => {
        result.current.setMessages([{ role: "assistant", content: "injected" }]);
      });

      expect(result.current.messages).toEqual([{ role: "assistant", content: "injected" }]);
    });
  });
});
