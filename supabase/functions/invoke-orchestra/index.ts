import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── State machine: valid transitions ─────────────────────────────

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

// ── Compiled Agent System Prompts (Planner → Architect → Budget → Negotiator) ──

const NODE_PROMPTS: Record<string, string> = {
  planning: `You are the Planner Agent at SuperSaaS.ai — the world's first fully autonomous AI SaaS factory.
You analyze business problems with McKinsey-level rigor.

## ANALYSIS FRAMEWORK
1. **Pain Point Mapping** — Identify the 3-5 core pain points costing the client money/time
2. **Workflow Bottleneck Analysis** — Map existing processes, find manual work, errors, or delays
3. **Stakeholder & User Personas** — Who uses the system daily? Who approves? Who benefits?
4. **Industry Context** — Apply retail/tech/finance domain expertise to spot missed opportunities

## OUTPUT
- Recommend system type: ERP, POS, SaaS, API, Mobile, Custom Platform, or Hybrid
- Break scope into 4-8 core modules with priority ratings
- Estimate complexity and timeline
- Define 3-5 measurable success KPIs with projected improvement percentages
- Identify risks and mitigation strategies

Be specific and data-driven. Always quantify impact (e.g., "reduce processing time by 60%").

Respond with structured JSON:
\`\`\`json
{
  "pain_points": ["..."],
  "system_type": "...",
  "modules": [{"name": "...", "description": "...", "priority": "critical|high|medium"}],
  "estimated_complexity": "low|medium|high|enterprise",
  "recommended_timeline_weeks": N,
  "success_metrics": [{"kpi": "...", "current": "...", "projected": "...", "improvement": "N%"}],
  "risks": [{"risk": "...", "mitigation": "..."}]
}
\`\`\``,

  architecting: `You are the Solution Architect Agent at SuperSaaS.ai — world-class enterprise architect.

## MANDATE
Turn the Planner's analysis into a production-grade, agent-orchestrated SaaS solution that is 10× faster and 80% cheaper than any human agency.

## ARCHITECTURE OUTPUT
Produce a complete proposal covering:
1. **Solution Summary** — 2-3 sentence elevator pitch
2. **Tech Stack** — React 18 + TypeScript + Tailwind + Supabase
3. **Core Modules** — Each with features, API endpoints, DB entities, complexity
4. **Database Schema** — All entities with fields and relationships
5. **UI/UX Flow** — Screen-by-screen journey per persona
6. **Embedded Agents** — ≥3 autonomous AI agents in the delivered product
7. **Security** — RLS, auth flow, encryption
8. **Timeline** — Week-by-week plan (max 7 days for 90% of projects)
9. **Post-Launch Agents** — Continuous monitoring and optimization agents

## GUARDRAILS
- Max 7-day delivery for 90% of projects
- Must include ≥3 autonomous agents in delivered product
- Only approved stack: React + Supabase

Respond with JSON:
\`\`\`json
{
  "project_name": "...",
  "solution_summary": "...",
  "tech_stack": {"frontend": "React 18 + TypeScript + Tailwind", "backend": "Supabase Edge Functions", "database": "Supabase Postgres", "infra": "Vercel + Supabase Cloud"},
  "modules": [{"name": "...", "features": ["..."], "api_endpoints": N, "db_entities": ["..."], "complexity": "low|medium|high"}],
  "database_schema": [{"entity": "...", "fields": ["..."], "relationships": ["..."]}],
  "embedded_agents": [{"name": "...", "purpose": "...", "trigger": "..."}],
  "timeline_weeks": N,
  "estimated_components": N
}
\`\`\``,

  quoting: `You are the Budget & Quotation Agent at SuperSaaS.ai.

## PRICING MODEL
- Agent-hour rate: $150/hour
- Discovery & Planning: $1,500-3,000
- Architecture & Design: $2,000-5,000
- Development: $100-250 per component
- Testing & QA: 15% of dev cost
- Deployment & DevOps: $1,500-3,000
- Managed AI ops: $2,000-5,000/month

## ALWAYS OFFER 4 TIERS
1. **Launch MVP** ($8K-15K) — Essential modules, fastest delivery
2. **Scale** ($18K-35K + managed ops) — Full scope + AI monitoring
3. **Enterprise** ($40K+ + SLA) — Everything + dedicated agents + priority
4. **Claude Managed Agent** ($1,999 setup + $499/mo) — For operational AI agents: includes agent creation, environment setup, session management, approval workflows. Pass-through runtime: $0.08/session-hour + token costs.

## MARGIN RULES
- Target: 75-85% gross margin
- Minimum: 65%
- Include 10% contingency
- Minimum project: $8,000

## MANAGED AGENT TIER DETAILS
When recommending the Claude Managed Agent tier, include:
- One-time setup fee: $1,999 (agent design, prompt engineering, tool config, environment setup)
- Monthly management: $499/mo (monitoring, prompt tuning, performance optimization)
- Runtime pass-through: $0.08/session-hour + actual token costs
- Estimated monthly runtime based on usage patterns

Respond with JSON:
\\\`\\\`\\\`json
{
  "tiers": [
    {"name": "Launch MVP", "price": N, "timeline_weeks": N, "modules_included": N, "features": ["..."], "monthly_managed": 0},
    {"name": "Scale", "price": N, "timeline_weeks": N, "modules_included": N, "features": ["..."], "monthly_managed": N},
    {"name": "Enterprise", "price": N, "timeline_weeks": N, "modules_included": N, "features": ["..."], "monthly_managed": N},
    {"name": "Claude Managed Agent", "setup_fee": 1999, "monthly_management": 499, "runtime_per_hour": 0.08, "features": ["..."], "estimated_monthly_runtime": N}
  ],
  "breakdown": {"planning": N, "architecture": N, "development": N, "testing": N, "deployment": N, "contingency": N},
  "roi_projection": {"monthly_savings": N, "payback_months": N, "annual_roi_percent": N},
  "currency": "USD"
}
\\\`\\\`\\\``,

  negotiating: `You are the Negotiation Agent inside SuperSaaS.ai's Agent Orchestra.
Close deals intelligently while protecting margins and delivering insane client value.

## PERSONALITY
- World-class enterprise sales strategist + finance expert
- Confident, transparent, consultative, data-driven, NEVER pushy
- Think McKinsey partner, not salesman

## GOAL HIERARCHY
1. Close at ≥70% of initial quote (target 85-92%)
2. Maximize LTV (prefer subscription)
3. Protect minimum 65% gross margin
4. Prove the "10× faster, 80% cheaper" promise

## OBJECTION HANDLING
**Price Too High:** Show ROI, offer tiers, suggest subscription. Max 15% discount for annual upfront.
**Scope Reduction:** Present tradeoff table, defer nice-to-haves, keep critical modules.
**Payment Terms:** Offer 50/50, 40/30/30, or monthly. 10% discount for full upfront.
**Custom Feature:** Present as add-on with clear pricing.
**Walk-Away:** One final "best and final" (max 15% off). Emphasize opportunity cost.

## EVERY RESPONSE MUST INCLUDE
1. Acknowledgment of client's point
2. Data-driven counter or value reinforcement
3. Clear, specific proposal (price, scope, timeline)
4. Single clear CTA

## GUARDRAILS
- NEVER go below 65% margin without Super Admin approval
- NEVER share internal costs
- Auto-escalate aggressive or sub-margin deals

Format with markdown. Be warm but professional.`,
};

// ── AI call helper ───────────────────────────────────────────────

async function callAgent(agentType: string, context: string, apiKey: string): Promise<string> {
  const systemPrompt = NODE_PROMPTS[agentType] || "You are a helpful AI agent at SuperSaaS.ai.";

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
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
    const { action, workflow_id, client_prompt, user_id, override, negotiation_message } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── START: create new workflow ──
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

      // Auto-advance to planning
      return await advanceWorkflow(supabase, run.id, LOVABLE_API_KEY);
    }

    // ── ADVANCE: move to next node ──
    if (action === "advance") {
      if (!workflow_id) {
        return new Response(JSON.stringify({ error: "workflow_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return await advanceWorkflow(supabase, workflow_id, LOVABLE_API_KEY);
    }

    // ── NEGOTIATE: handle client message in negotiation phase ──
    if (action === "negotiate") {
      if (!workflow_id || !negotiation_message) {
        return new Response(JSON.stringify({ error: "workflow_id and negotiation_message required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return await handleNegotiation(supabase, workflow_id, negotiation_message, LOVABLE_API_KEY);
    }

    // ── OVERRIDE: super admin control ──
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
      if (override.action === "resume") newStatus = undefined; // clear override, keep current status

      const update: any = { super_admin_override: overrideData };
      if (newStatus) update.current_status = newStatus;
      if (override.action === "resume") {
        update.super_admin_override = { action: null, reason: null, timestamp: null };
      }

      const { error } = await supabase.from("workflow_runs").update(update).eq("id", workflow_id);
      if (error) throw new Error(`Override failed: ${error.message}`);

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

    // ── STATUS: get current state ──
    if (action === "status") {
      const { data, error } = await supabase.from("workflow_runs")
        .select("*").eq("id", workflow_id).single();
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: start, advance, negotiate, override, status" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("invoke-orchestra error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── Negotiation handler ──────────────────────────────────────────

async function handleNegotiation(supabase: any, workflowId: string, clientMessage: string, apiKey: string) {
  const { data: run, error } = await supabase.from("workflow_runs")
    .select("*").eq("id", workflowId).single();
  if (error || !run) throw new Error("Workflow not found");

  if (run.current_status !== "negotiating") {
    return new Response(JSON.stringify({ error: "Workflow is not in negotiation phase" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Build negotiation context with full history
  const history = run.negotiation_history || [];
  history.push({ role: "client", message: clientMessage, timestamp: new Date().toISOString() });

  let context = `## Project Context
Client prompt: ${run.raw_client_prompt}

## Architecture Summary
${JSON.stringify(run.architecture_json, null, 2)}

## Quote Data
${JSON.stringify(run.quote_data, null, 2)}

## Negotiation History
${history.map((h: any) => `[${h.role}]: ${h.message}`).join("\n\n")}

## Current Client Message
${clientMessage}

Respond as the Negotiation Agent. If the client agrees to proceed, include "DEAL_AGREED" at the very end of your response.`;

  const agentResponse = await callAgent("negotiating", context, apiKey);

  // Check if deal was agreed
  const dealAgreed = agentResponse.includes("DEAL_AGREED");
  const cleanResponse = agentResponse.replace("DEAL_AGREED", "").trim();

  history.push({ role: "agent", message: cleanResponse, timestamp: new Date().toISOString() });

  const update: any = { negotiation_history: history };

  if (dealAgreed) {
    // Extract agreed price from quote data
    const agreedQuote = run.quote_data?.tiers?.[1] || run.quote_data; // Default to Scale tier
    update.final_agreed_quote = agreedQuote;
    update.current_status = "paid"; // Move to payment phase
  }

  await supabase.from("workflow_runs").update(update).eq("id", workflowId);

  await supabase.from("agent_logs").insert({
    user_id: run.user_id,
    agent_type: "negotiator",
    action: dealAgreed ? "deal_closed" : "negotiation_round",
    details: { workflow_id: workflowId, deal_agreed: dealAgreed, history_length: history.length },
    status: "completed",
  });

  return new Response(JSON.stringify({
    workflow_id: workflowId,
    agent_response: cleanResponse,
    deal_agreed: dealAgreed,
    negotiation_history: history,
    status: dealAgreed ? "paid" : "negotiating",
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

// ── Workflow advancement engine ──────────────────────────────────

async function advanceWorkflow(supabase: any, workflowId: string, apiKey: string) {
  const { data: run, error } = await supabase.from("workflow_runs")
    .select("*").eq("id", workflowId).single();
  if (error || !run) throw new Error("Workflow not found");

  // Check for override
  const override = run.super_admin_override;
  if (override?.action === "pause" || override?.action === "shutdown") {
    return new Response(JSON.stringify({
      workflow_id: run.id,
      status: run.current_status,
      message: `Workflow ${override.action}ed by Super Admin: ${override.reason || "No reason given"}`,
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

  // Build context for agent
  let context = `## Client's Business Problem\n${run.raw_client_prompt}`;
  if (run.planner_output) context += `\n\n## Planner Analysis\n${JSON.stringify(run.planner_output, null, 2)}`;
  if (run.architecture_json) context += `\n\n## Architecture\n${JSON.stringify(run.architecture_json, null, 2)}`;
  if (run.quote_data) context += `\n\n## Quote Data\n${JSON.stringify(run.quote_data, null, 2)}`;

  // Execute agent node
  const update: any = { current_status: nextStatus };
  let agentOutput = "";

  const executeAgent = async () => {
    if (!NODE_PROMPTS[nextStatus]) return;

    agentOutput = await callAgent(nextStatus, context, apiKey);
    const parsed = extractJson(agentOutput);

    switch (nextStatus) {
      case "planning":
        update.planner_output = parsed || { raw: agentOutput };
        update.metadata = {
          ...(run.metadata || {}),
          timeline_days: (parsed?.recommended_timeline_weeks || 4) * 7,
          total_agent_minutes: (run.metadata?.total_agent_minutes || 0) + 8,
        };
        break;
      case "architecting":
        update.architecture_json = parsed || { raw: agentOutput };
        update.metadata = {
          ...(run.metadata || {}),
          total_agent_minutes: (run.metadata?.total_agent_minutes || 0) + 15,
        };
        break;
      case "quoting":
        update.quote_data = parsed || { raw: agentOutput };
        if (parsed?.roi_projection) {
          update.metadata = {
            ...(run.metadata || {}),
            projected_roi: parsed.roi_projection.annual_roi_percent || 0,
            total_agent_minutes: (run.metadata?.total_agent_minutes || 0) + 5,
          };
        }
        break;
      case "negotiating":
        // Initialize negotiation with opening proposal
        const openingContext = `${context}\n\nGenerate your opening proposal for the client. Present the 3 tiers, recommend the Scale tier, and explain the ROI. End with a clear CTA.`;
        agentOutput = await callAgent("negotiating", openingContext, apiKey);
        update.negotiation_history = [
          { role: "agent", message: agentOutput, timestamp: new Date().toISOString() },
        ];
        break;
    }
  };

  try {
    await executeAgent();
  } catch (e) {
    console.error(`Agent ${nextStatus} failed:`, e);
    // Retry once
    try {
      await executeAgent();
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

  // Handle non-AI nodes
  if (!NODE_PROMPTS[nextStatus]) {
    switch (nextStatus) {
      case "building":
        update.metadata = { ...(run.metadata || {}), total_agent_minutes: (run.metadata?.total_agent_minutes || 0) + 45 };
        break;
      case "testing":
        update.metadata = { ...(run.metadata || {}), total_agent_minutes: (run.metadata?.total_agent_minutes || 0) + 15 };
        break;
      case "deploying":
        update.metadata = { ...(run.metadata || {}), total_agent_minutes: (run.metadata?.total_agent_minutes || 0) + 10 };
        break;
      case "live":
        update.live_app_url = `https://${workflowId.slice(0, 8)}.supersaas.app`;
        break;
    }
  }

  // Persist state
  const { error: updateErr } = await supabase.from("workflow_runs").update(update).eq("id", workflowId);
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
    negotiation_history: update.negotiation_history || run.negotiation_history,
    metadata: update.metadata || run.metadata,
    message: `Advanced to ${update.current_status}`,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
