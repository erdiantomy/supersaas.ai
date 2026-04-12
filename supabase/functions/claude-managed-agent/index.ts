import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANTHROPIC_API = "https://api.anthropic.com/v1";
const BETA_HEADER = "managed-agents-2026-04-01";

function getSupabase() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

function getAnthropicKey(): string {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured. Please add it via Lovable Cloud secrets.");
  return key;
}

async function anthropicFetch(path: string, body: any) {
  const resp = await fetch(`${ANTHROPIC_API}${path}`, {
    method: "POST",
    headers: {
      "x-api-key": getAnthropicKey(),
      "anthropic-version": "2023-06-01",
      "anthropic-beta": BETA_HEADER,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Anthropic API [${resp.status}]: ${t}`);
  }
  return resp.json();
}

async function anthropicGet(path: string) {
  const resp = await fetch(`${ANTHROPIC_API}${path}`, {
    method: "GET",
    headers: {
      "x-api-key": getAnthropicKey(),
      "anthropic-version": "2023-06-01",
      "anthropic-beta": BETA_HEADER,
    },
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Anthropic API GET [${resp.status}]: ${t}`);
  }
  return resp.json();
}

async function anthropicDelete(path: string) {
  const resp = await fetch(`${ANTHROPIC_API}${path}`, {
    method: "DELETE",
    headers: {
      "x-api-key": getAnthropicKey(),
      "anthropic-version": "2023-06-01",
      "anthropic-beta": BETA_HEADER,
    },
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Anthropic API DELETE [${resp.status}]: ${t}`);
  }
  return resp.json();
}

// Stream SSE events from Anthropic session and persist to Supabase
async function streamSessionEvents(sessionId: string, dbSessionId: string, supabase: any) {
  const resp = await fetch(`${ANTHROPIC_API}/sessions/${sessionId}/events`, {
    method: "GET",
    headers: {
      "x-api-key": getAnthropicKey(),
      "anthropic-version": "2023-06-01",
      "anthropic-beta": BETA_HEADER,
      "Accept": "text/event-stream",
    },
  });

  if (!resp.ok || !resp.body) {
    throw new Error(`Failed to stream session events: ${resp.status}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx;
    while ((newlineIdx = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 2);

      if (!chunk.startsWith("data: ")) continue;
      const jsonStr = chunk.slice(6).trim();
      if (jsonStr === "[DONE]") break;

      try {
        const event = JSON.parse(jsonStr);
        // Persist event to DB for realtime relay
        await supabase.from("managed_events").insert({
          session_id: dbSessionId,
          event_type: event.type || "unknown",
          event_data: event,
          requires_approval: event.type === "approval_request",
          approval_status: event.type === "approval_request" ? "pending" : "none",
        });

        // Update session status based on events
        if (event.type === "session_complete") {
          await supabase.from("managed_sessions").update({
            status: "completed",
            last_event_at: new Date().toISOString(),
          }).eq("id", dbSessionId);
        } else if (event.type === "error") {
          await supabase.from("managed_sessions").update({
            status: "error",
            last_event_at: new Date().toISOString(),
          }).eq("id", dbSessionId);
        } else {
          await supabase.from("managed_sessions").update({
            last_event_at: new Date().toISOString(),
          }).eq("id", dbSessionId);
        }
      } catch { /* ignore parse errors */ }
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;
    const supabase = getSupabase();

    // ── CREATE AGENT ──
    if (action === "create_agent") {
      const { name, model, system_prompt, tools, user_id } = body;
      if (!name || !user_id) {
        return new Response(JSON.stringify({ error: "name and user_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create agent via Anthropic API
      const agentResult = await anthropicFetch("/agents", {
        model: model || "claude-sonnet-4-20250514",
        name,
        system: system_prompt || `You are ${name}, a production AI agent built by SuperSaaS.ai.`,
        tools: tools || [
          { type: "text_editor_20250429" },
          { type: "bash_20250124" },
          { type: "web_search_20250305" },
        ],
      });

      // Store in DB
      const { data: dbAgent, error } = await supabase.from("managed_agents").insert({
        user_id,
        name,
        model: model || "claude-sonnet-4-20250514",
        system_prompt: system_prompt || "",
        tools: tools || [],
        anthropic_agent_id: agentResult.id,
        status: "active",
      }).select().single();

      if (error) throw new Error(`DB insert failed: ${error.message}`);

      return new Response(JSON.stringify({ agent: dbAgent, anthropic: agentResult }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── CREATE ENVIRONMENT ──
    if (action === "create_environment") {
      const { agent_id, name: envName, packages, user_id } = body;
      if (!agent_id || !user_id) {
        return new Response(JSON.stringify({ error: "agent_id and user_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get agent's Anthropic ID
      const { data: agent } = await supabase.from("managed_agents")
        .select("anthropic_agent_id").eq("id", agent_id).single();
      if (!agent) throw new Error("Agent not found");

      const envResult = await anthropicFetch("/environments", {
        agent_id: agent.anthropic_agent_id,
        name: envName || "default",
        packages: packages || [],
      });

      const { data: dbEnv, error } = await supabase.from("managed_environments").insert({
        user_id,
        agent_id,
        name: envName || "default",
        packages: packages || [],
        anthropic_environment_id: envResult.id,
      }).select().single();

      if (error) throw new Error(`DB insert failed: ${error.message}`);

      return new Response(JSON.stringify({ environment: dbEnv, anthropic: envResult }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── START SESSION ──
    if (action === "start_session") {
      const { agent_id, environment_id, user_id, prompt, approval_mode, workflow_run_id } = body;
      if (!agent_id || !user_id || !prompt) {
        return new Response(JSON.stringify({ error: "agent_id, user_id, and prompt required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: agent } = await supabase.from("managed_agents")
        .select("anthropic_agent_id").eq("id", agent_id).single();
      if (!agent) throw new Error("Agent not found");

      let envId: string | undefined;
      if (environment_id) {
        const { data: env } = await supabase.from("managed_environments")
          .select("anthropic_environment_id").eq("id", environment_id).single();
        envId = env?.anthropic_environment_id;
      }

      const sessionPayload: any = {
        agent_id: agent.anthropic_agent_id,
        messages: [{ role: "user", content: prompt }],
        mode: approval_mode === "approval" ? "approval_required" : "auto_run",
      };
      if (envId) sessionPayload.environment_id = envId;

      const sessionResult = await anthropicFetch("/sessions", sessionPayload);

      // Store session in DB
      const { data: dbSession, error } = await supabase.from("managed_sessions").insert({
        user_id,
        agent_id,
        environment_id: environment_id || null,
        workflow_run_id: workflow_run_id || null,
        anthropic_session_id: sessionResult.id,
        status: "running",
        approval_mode: approval_mode || "auto",
        cost_data: { session_hours: 0, token_cost: 0, total_cost: 0 },
      }).select().single();

      if (error) throw new Error(`DB insert failed: ${error.message}`);

      // Start background event streaming (fire and forget)
      EdgeRuntime?.waitUntil?.(
        streamSessionEvents(sessionResult.id, dbSession.id, supabase).catch(e => {
          console.error("Event streaming error:", e);
        })
      );

      return new Response(JSON.stringify({ session: dbSession, anthropic: sessionResult }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── APPROVE EVENT ──
    if (action === "approve_event") {
      const { event_id, approved } = body;
      if (!event_id) {
        return new Response(JSON.stringify({ error: "event_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: event } = await supabase.from("managed_events")
        .select("*, managed_sessions(anthropic_session_id)").eq("id", event_id).single();
      if (!event) throw new Error("Event not found");

      // Send approval to Anthropic
      const sessionAnthropicId = event.managed_sessions?.anthropic_session_id;
      if (sessionAnthropicId) {
        await anthropicFetch(`/sessions/${sessionAnthropicId}/approve`, {
          event_id: event.event_data?.event_id,
          approved: approved !== false,
        });
      }

      await supabase.from("managed_events").update({
        approval_status: approved !== false ? "approved" : "rejected",
      }).eq("id", event_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── PAUSE / INTERRUPT / SHUTDOWN SESSION ──
    if (action === "control_session") {
      const { session_id, control } = body;
      if (!session_id || !control) {
        return new Response(JSON.stringify({ error: "session_id and control required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: session } = await supabase.from("managed_sessions")
        .select("anthropic_session_id").eq("id", session_id).single();
      if (!session) throw new Error("Session not found");

      if (control === "pause" || control === "interrupt") {
        await anthropicFetch(`/sessions/${session.anthropic_session_id}/interrupt`, {});
        await supabase.from("managed_sessions").update({ status: "paused" }).eq("id", session_id);
      } else if (control === "shutdown") {
        await anthropicDelete(`/sessions/${session.anthropic_session_id}`);
        await supabase.from("managed_sessions").update({ status: "shutdown" }).eq("id", session_id);
      } else if (control === "resume") {
        await anthropicFetch(`/sessions/${session.anthropic_session_id}/resume`, {});
        await supabase.from("managed_sessions").update({ status: "running" }).eq("id", session_id);
      }

      return new Response(JSON.stringify({ success: true, status: control }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LIST SESSIONS ──
    if (action === "list_sessions") {
      const { user_id } = body;
      const { data, error } = await supabase.from("managed_sessions")
        .select("*, managed_agents(name, model), managed_environments(name)")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── LIST AGENTS ──
    if (action === "list_agents") {
      const { user_id } = body;
      const { data, error } = await supabase.from("managed_agents")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GET SESSION EVENTS ──
    if (action === "get_events") {
      const { session_id } = body;
      const { data, error } = await supabase.from("managed_events")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: create_agent, create_environment, start_session, approve_event, control_session, list_sessions, list_agents, get_events" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("claude-managed-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
