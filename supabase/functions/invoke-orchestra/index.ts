import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── State machine: node definitions ──────────────────────────────

type WorkflowStatus =
  | "intake" | "planning" | "architecting" | "quoting" | "negotiating"
  | "paid" | "building" | "testing" | "deploying" | "live" | "optimizing"
  | "paused" | "shutdown";

const STATUS_TRANSITIONS: Record<string, WorkflowStatus> = {
  intake: "planning",
  planning: "architecting",
  architecting: "quoting",
  quoting: "negotiating",
  negotiating: "paid",
  paid: "building",
  building: "testing",
  testing: "deploying",
  deploying: "live",
  live: "optimizing",
};

// ── Agent system prompts per node ────────────────────────────────

const NODE_PROMPTS: Record<string, string> = {
  planning: `You are the Planner Agent at SuperSaaS.ai — the world's first fully autonomous AI SaaS factory.
You are analyzing a client's business problem. Produce a structured analysis:

## Requirements Analysis
- Core pain points identified
- Existing workflow bottlenecks
- Key stakeholders and users

## Recommended System Type
- ERP / POS / SaaS / API / Mobile App / Custom Platform
- Why this solution fits

## Module Breakdown
List 4-8 core modules with brief descriptions

## Success Metrics
KPIs the system should improve

Respond in JSON format wrapped in a markdown code block:
\`\`\`json
{
  "pain_points": ["..."],
  "system_type": "...",
  "modules": [{"name": "...", "description": "..."}],
  "estimated_complexity": "low|medium|high|enterprise",
  "recommended_timeline_weeks": N
}
\`\`\``,

  architecting: `You are the Solution Architect Agent at SuperSaaS.ai.
Based on the planner's analysis, produce a detailed technical architecture:

## Tech Stack
- Frontend, Backend, Database, Infrastructure

## Module Architecture
For each module: key features, API endpoints, data models

## Database Schema
Main entities and relationships

## Integration Points
External services, APIs, payment gateways

Respond in JSON format wrapped in a markdown code block:
\`\`\`json
{
  "tech_stack": {"frontend": "...", "backend": "...", "database": "...", "infra": "..."},
  "modules": [{"name": "...", "features": ["..."], "api_count": N, "complexity": "..."}],
  "database_entities": [{"name": "...", "fields": ["..."]}],
  "integrations": ["..."],
  "estimated_components": N,
  "timeline_weeks": N
}
\`\`\``,

  quoting: `You are the Budget & Quotation Agent at SuperSaaS.ai.
Based on the architecture, generate a detailed cost breakdown:

Pricing model:
- Base rate: $150/agent-hour
- Discovery & Planning: ~$2K
- Architecture & Design: ~$3K  
- Development: $100-200 per component
- Testing & QA: 15% of dev cost
- Deployment & DevOps: ~$2K
- Post-launch support: $2K/month

Calculate total based on complexity. Minimum project: $8K.
Offer 3 tiers: MVP (essential only), Standard (full scope), Premium (+ monitoring + optimization).

Respond in JSON:
\`\`\`json
{
  "tiers": [
    {"name": "Launch MVP", "price": N, "timeline_weeks": N, "modules_included": N, "features": ["..."]},
    {"name": "Scale", "price": N, "timeline_weeks": N, "modules_included": N, "features": ["..."]},
    {"name": "Enterprise", "price": N, "timeline_weeks": N, "modules_included": N, "features": ["..."]}
  ],
  "breakdown": {"planning": N, "architecture": N, "development": N, "testing": N, "deployment": N},
  "monthly_managed": N,
  "currency": "USD"
}
\`\`\``,
};

// ── AI call helper ───────────────────────────────────────────────

async function callAgent(
  agentType: string,
  context: string,
  apiKey: string,
): Promise<string> {
  const systemPrompt = NODE_PROMPTS[agentType] || "You are a helpful AI agent.";

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: context },
      ],
      stream: false,
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI call failed [${resp.status}]: ${t}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

function extractJson(text: string): any {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (match) {
    try { return JSON.parse(match[1]); } catch { /* fall through */ }
  }
  try { return JSON.parse(text); } catch { return null; }
}

// ── Main handler ─────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, workflow_id, client_prompt, user_id, override } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Action: START – create new workflow run ──
    if (action === "start") {
      if (!client_prompt || !user_id) {
        return new Response(JSON.stringify({ error: "client_prompt and user_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: run, error } = await supabase.from("workflow_runs").insert({
        user_id,
        raw_client_prompt: client_prompt,
        current_status: "intake",
      }).select().single();

      if (error) throw new Error(`DB insert failed: ${error.message}`);

      // Immediately advance to planning
      return await advanceWorkflow(supabase, run.id, LOVABLE_API_KEY);
    }

    // ── Action: ADVANCE – continue to next step ──
    if (action === "advance") {
      if (!workflow_id) {
        return new Response(JSON.stringify({ error: "workflow_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return await advanceWorkflow(supabase, workflow_id, LOVABLE_API_KEY);
    }

    // ── Action: OVERRIDE – super admin control ──
    if (action === "override") {
      if (!workflow_id || !override) {
        return new Response(JSON.stringify({ error: "workflow_id and override required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const overrideData = {
        action: override.action,
        reason: override.reason || null,
        timestamp: new Date().toISOString(),
      };

      let newStatus: string | undefined;
      if (override.action === "pause") newStatus = "paused";
      if (override.action === "shutdown") newStatus = "shutdown";

      const update: any = { super_admin_override: overrideData };
      if (newStatus) update.current_status = newStatus;

      const { error } = await supabase.from("workflow_runs").update(update).eq("id", workflow_id);
      if (error) throw new Error(`Override failed: ${error.message}`);

      // Log the override
      await supabase.from("agent_logs").insert({
        agent_type: "super_admin",
        action: `override_${override.action}`,
        details: overrideData,
        status: "completed",
      });

      return new Response(JSON.stringify({ success: true, status: newStatus || "override_applied" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Action: STATUS – get current state ──
    if (action === "status") {
      const { data, error } = await supabase.from("workflow_runs")
        .select("*")
        .eq("id", workflow_id)
        .single();
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: start, advance, override, status" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("invoke-orchestra error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── Workflow advancement engine ──────────────────────────────────

async function advanceWorkflow(supabase: any, workflowId: string, apiKey: string) {
  // Fetch current state
  const { data: run, error } = await supabase.from("workflow_runs")
    .select("*").eq("id", workflowId).single();
  if (error || !run) throw new Error("Workflow not found");

  // Check for override
  if (run.super_admin_override?.action === "pause" || run.super_admin_override?.action === "shutdown") {
    return new Response(JSON.stringify({
      workflow_id: run.id,
      status: run.current_status,
      message: `Workflow ${run.super_admin_override.action}ed by Super Admin`,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const currentStatus = run.current_status as string;
  const nextStatus = STATUS_TRANSITIONS[currentStatus];

  if (!nextStatus) {
    return new Response(JSON.stringify({
      workflow_id: run.id,
      status: currentStatus,
      message: "Workflow is at terminal state or requires manual intervention",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  // Log start
  await supabase.from("agent_logs").insert({
    user_id: run.user_id,
    agent_type: nextStatus,
    action: `node_${nextStatus}_start`,
    details: { workflow_id: workflowId, from: currentStatus },
    status: "running",
  });

  // Build context for the agent
  let context = `Client prompt: ${run.raw_client_prompt}`;
  if (run.planner_output) context += `\n\nPlanner analysis: ${JSON.stringify(run.planner_output)}`;
  if (run.architecture_json) context += `\n\nArchitecture: ${JSON.stringify(run.architecture_json)}`;
  if (run.quote_data) context += `\n\nQuote data: ${JSON.stringify(run.quote_data)}`;

  // Execute agent node
  const update: any = { current_status: nextStatus };
  let agentOutput = "";
  
  try {
    if (NODE_PROMPTS[nextStatus]) {
      agentOutput = await callAgent(nextStatus, context, apiKey);
      const parsed = extractJson(agentOutput);

      if (nextStatus === "planning") {
        update.planner_output = parsed || { raw: agentOutput };
        update.metadata = {
          ...run.metadata,
          timeline_days: (parsed?.recommended_timeline_weeks || 4) * 7,
        };
      } else if (nextStatus === "architecting") {
        update.architecture_json = parsed || { raw: agentOutput };
        update.metadata = {
          ...run.metadata,
          total_agent_minutes: (run.metadata?.total_agent_minutes || 0) + 12,
        };
      } else if (nextStatus === "quoting") {
        update.quote_data = parsed || { raw: agentOutput };
        if (parsed?.tiers) {
          update.metadata = {
            ...run.metadata,
            projected_roi: Math.round((parsed.tiers[1]?.price || 15000) * 3.2),
          };
        }
      }
    } else {
      // For statuses without AI (paid, building, testing, deploying, live, optimizing)
      // Just transition the status
      if (nextStatus === "building") {
        update.metadata = { ...run.metadata, total_agent_minutes: (run.metadata?.total_agent_minutes || 0) + 45 };
      }
      if (nextStatus === "live") {
        update.live_app_url = `https://${workflowId.slice(0, 8)}.supersaas.app`;
      }
    }
  } catch (e) {
    console.error(`Agent ${nextStatus} failed:`, e);
    // Retry once
    try {
      if (NODE_PROMPTS[nextStatus]) {
        agentOutput = await callAgent(nextStatus, context, apiKey);
        const parsed = extractJson(agentOutput);
        if (nextStatus === "planning") update.planner_output = parsed || { raw: agentOutput };
        else if (nextStatus === "architecting") update.architecture_json = parsed || { raw: agentOutput };
        else if (nextStatus === "quoting") update.quote_data = parsed || { raw: agentOutput };
      }
    } catch (retryErr) {
      console.error(`Agent ${nextStatus} retry failed:`, retryErr);
      update.current_status = "paused";
      update.super_admin_override = {
        action: "pause",
        reason: `Agent ${nextStatus} failed after retry: ${retryErr instanceof Error ? retryErr.message : "Unknown"}`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Persist state
  const { error: updateErr } = await supabase.from("workflow_runs")
    .update(update).eq("id", workflowId);
  if (updateErr) throw new Error(`State update failed: ${updateErr.message}`);

  // Log completion
  await supabase.from("agent_logs").insert({
    user_id: run.user_id,
    agent_type: nextStatus,
    action: `node_${nextStatus}_complete`,
    details: { workflow_id: workflowId, output_length: agentOutput.length },
    status: "completed",
  });

  return new Response(JSON.stringify({
    workflow_id: workflowId,
    status: update.current_status,
    planner_output: update.planner_output || run.planner_output,
    architecture_json: update.architecture_json || run.architecture_json,
    quote_data: update.quote_data || run.quote_data,
    metadata: update.metadata || run.metadata,
    message: `Advanced to ${update.current_status}`,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
