import { useState, useCallback } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`;

export function useAgentChat(agentType: string = "planner") {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(
    async (input: string, projectId?: string, userId?: string) => {
      const userMsg: Msg = { role: "user", content: input };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setIsLoading(true);

      let assistantSoFar = "";
      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: updated, agentType, projectId, userId }),
        });

        if (!resp.ok || !resp.body) {
          const errData = await resp.json().catch(() => ({ error: "Stream failed" }));
          throw new Error(errData.error || `HTTP ${resp.status}`);
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantSoFar += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant") {
                    return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                  }
                  return [...prev, { role: "assistant", content: assistantSoFar }];
                });
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (e: any) {
        setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, agentType]
  );

  const reset = useCallback(() => setMessages([]), []);

  return { messages, isLoading, send, reset, setMessages };
}
