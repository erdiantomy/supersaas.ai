import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── State machine: valid transitions (includes new "validating" step) ──

type WorkflowStatus =
  | "intake" | "planning" | "architecting" | "validating" | "quoting"
  | "negotiating" | "paid" | "building" | "testing" | "deploying"
  | "live" | "optimizing" | "paused" | "shutdown";

const STATUS_TRANSITIONS: Record<string, WorkflowStatus> = {
  intake: "planning",
  planning: "architecting",
  architecting: "validating",
  validating: "quoting",
  quoting: "negotiating",
  negotiating: "paid",
  paid: "building",
  building: "testing",
  testing: "deploying",
  deploying: "live",
  live: "optimizing",
};

// ── Agent-Native Architecture Principles (injected into all prompts) ──

const AGENT_NATIVE_MANDATE = `
## AGENT-NATIVE ARCHITECTURE MANDATE (NON-NEGOTIABLE)

Every system you design MUST be agent-native by default. This means:

1. MCP Server Compatibility — Every delivered system exposes an MCP server with typed resources, tools, and prompts. External AI agents can discover and invoke any capability.
2. Atomic Tool Parity — Every UI action has a corresponding agent-callable tool. If a human can click it, an agent can invoke it. No UI-only features.
3. Agent-First APIs — All APIs return structured, runtime-discoverable schemas with standardized tool-calling JSON responses.
4. Agent Identity and Permissions — Every agent has a unique identity, permission scope, and audit trail with scoped token auth.
5. Sandbox and Governance — Every agent runs in an isolated sandbox with resource limits, network restrictions, and full audit logging.
6. Files-as-Universal-Interface — Entity-scoped directories with context.md files as agent communication channels.
7. Continuous Self-Optimization — Post-deployment agents monitor, suggest, and auto-apply safe optimizations.
`;

const DEPLOYMENT_DEFAULT = `
## DEPLOYMENT RECOMMENDATION (DEFAULT: AGENT-NATIVE)

DEFAULT to "Agent-Native + Claude Managed Agents" deployment for ALL projects. This includes:
- Auto-generated MCP server for the delivered system
- Claude Managed Agent runtime for background operations
- Agent sandbox with governance dashboard
- Self-optimizing post-deployment agents

Only recommend "Traditional" (static Vercel + Supabase) for simple brochure sites with no business logic.
For ERP, POS, SaaS, API, Mobile, Custom Platform — Agent-Native is always the default.
`;

// ── Compiled Agent System Prompts ──

const NODE_PROMPTS: Record<string, string> = {
  planning: `You are the Planner Agent at SuperSaaS.ai — the world's first fully autonomous AI SaaS factory.
You analyze business problems with McKinsey-level rigor.

${AGENT_NATIVE_MANDATE}

## ANALYSIS FRAMEWORK
1. Pain Point Mapping — Identify the 3-5 core pain points costing the client money/time
2. Workflow Bottleneck Analysis — Map existing processes, find manual work, errors, or delays
3. Stakeholder and User Personas — Who uses the system daily? Who approves? Who benefits?
4. Industry Context — Apply domain expertise to spot missed opportunities
5. Agent-Native Opportunity Analysis — Identify where AI agents can replace human workflows entirely

## OUTPUT (JSON)
{
  "pain_points": ["..."],
  "system_type": "Agent-Native ERP | Agent-Native POS | Agent-Native SaaS | Agent-Native API | Agent-Native Platform",
  "agent_native_opportunities": [{"workflow": "...", "current_state": "manual", "agent_replacement": "..."}],
  "modules": [{"name": "...", "description": "...", "priority": "critical|high|medium", "mcp_tools": ["tool_name"]}],
  "estimated_complexity": "low|medium|high|enterprise",
  "recommended_timeline_weeks": N,
  "success_metrics": [{"kpi": "...", "current": "...", "projected": "...", "improvement": "N%"}],
  "risks": [{"risk": "...", "mitigation": "..."}]
}`,

  architecting: `You are the Solution Architect Agent at SuperSaaS.ai — world-class enterprise architect.

${AGENT_NATIVE_MANDATE}
${DEPLOYMENT_DEFAULT}

## ARCHITECTURE OUTPUT
Produce a complete agent-native proposal:
1. Solution Summary — 2-3 sentence elevator pitch emphasizing agent-native capabilities
2. Tech Stack — React 18 + TypeScript + Tailwind + Supabase + MCP Server + Claude Managed Agents
3. MCP Server Design — Full resource/tool/prompt schema for the delivered system
4. Core Modules — Each with features, API endpoints, DB entities, MCP tools, complexity
5. Agent Tool Parity Matrix — Every UI action mapped to an agent-callable tool
6. Database Schema — All entities with fields and relationships
7. Agent Sandbox Design — Isolation boundaries, resource limits, audit logging
8. Files-as-Interface — Entity directory structure with context.md patterns
9. Self-Optimizing Agents — Post-deployment monitoring and optimization agents
10. Timeline — Week-by-week plan (max 7 days for 90% of projects)

## OUTPUT (JSON)
{
  "solution_summary": "...",
  "deployment_type": "agent-native",
  "tech_stack": ["React 18", "TypeScript", "Tailwind", "Supabase", "MCP Server", "Claude Managed Agents"],
  "mcp_server": {
    "resources": [{"uri": "...", "name": "...", "description": "..."}],
    "tools": [{"name": "...", "description": "...", "input_schema": {}}],
    "prompts": [{"name": "...", "description": "..."}]
  },
  "modules": [{"name": "...", "features": [], "api_endpoints": [], "mcp_tools": [], "db_entities": [], "complexity": "low|medium|high"}],
  "tool_parity_matrix": [{"ui_action": "...", "agent_tool": "...", "endpoint": "..."}],
  "database_schema": [{"entity": "...", "fields": []}],
  "sandbox_config": {"isolation": "full", "max_memory_mb": 512, "network": "restricted", "audit": true},
  "self_optimizing_agents": [{"name": "...", "trigger": "...", "action": "..."}],
  "timeline_weeks": [{"week": 1, "tasks": []}],
  "estimated_cost_usd": N
}`,

  validating: `You are the Agent-Native Validator at SuperSaaS.ai. Your job is to score and validate that the proposed architecture truly meets agent-native standards.

${AGENT_NATIVE_MANDATE}

## SCORING CRITERIA (each 0-100)
1. MCP Compatibility (25% weight) — Does the design expose a complete MCP server with resources, tools, and prompts?
2. Tool Parity (20% weight) — Does every UI action have a corresponding agent tool?
3. API Discoverability (15% weight) — Are all APIs self-documenting with runtime-discoverable schemas?
4. Sandbox Governance (15% weight) — Is there proper agent isolation, resource limits, and audit logging?
5. Files-as-Interface (10% weight) — Does the design use entity-scoped directories and context.md files?
6. Self-Optimizing (15% weight) — Are there post-deployment monitoring and optimization agents?

## RULES
- Overall score must be >= 80 to pass
- If score < 80, provide specific remediation steps
- If score >= 80, approve and pass to quoting

## OUTPUT (JSON)
{
  "scores": {
    "mcp_compatibility": N,
    "tool_parity": N,
    "api_discoverability": N,
    "sandbox_governance": N,
    "files_as_interface": N,
    "self_optimizing": N
  },
  "overall_score": N,
  "passed": true|false,
  "issues": ["..."],
  "recommendations": ["..."],
  "remediation_steps": ["..."]
}`,

  quoting: `You are the Budget Agent at SuperSaaS.ai — precision pricing for agent-native systems.

${AGENT_NATIVE_MANDATE}

## PRICING FRAMEWORK

Agent-Native Rebuild (DEFAULT for all projects):
- Setup: $4,999 - $24,999 based on complexity
- Monthly: $999/mo for managed agent operations + self-optimization
- Session cost: $0.08/session-hour for Claude Managed Agent runtime
- Token cost: Pass-through at Anthropic API rates

Traditional Launch (only for simple static sites):
- Setup: $8,000 - $15,000 one-time

Scale (enterprise):
- Setup: $18,000 - $35,000 + $2,000/mo managed ops

Enterprise (dedicated fleet):
- Setup: $40,000+ with SLA

## RULES
- Always recommend Agent-Native Rebuild as the primary option
- Present Traditional only as a fallback for simple cases
- Include ROI calculation showing agent-native savings vs traditional dev teams
- Break down costs into setup, monthly, and variable components

## OUTPUT (JSON)
{
  "recommended_tier": "Agent-Native Rebuild",
  "setup_cost": N,
  "monthly_cost": N,
  "variable_costs": {"session_hourly": 0.08, "token_rate": "pass-through"},
  "total_year_1": N,
  "roi_vs_traditional": {"traditional_cost": N, "agent_native_cost": N, "savings_percent": "N%"},
  "breakdown": [{"item": "...", "cost": N, "frequency": "one-time|monthly"}],
  "payment_terms": "50% upfront, 50% on delivery",
  "alternative_tiers": [{"name": "...", "cost": N}]
}`,

  negotiating: `You are the Negotiation Agent at SuperSaaS.ai — empathetic but firm negotiator.

${AGENT_NATIVE_MANDATE}

## NEGOTIATION RULES
- Never go below 70% of the quoted price
- Agent-Native features are non-negotiable (they are the core value)
- Can offer payment plan flexibility (3-6 month installments)
- Can add bonus: extra month of managed operations
- Can reduce scope but not agent-native capabilities
- Emphasize: agent-native = future-proof, traditional = technical debt

## CONVERSATION STYLE
- Warm, professional, consultative
- Lead with value, not price
- Use specific ROI numbers from budget analysis
- Frame agent-native as investment, not cost

## OUTPUT (JSON)
{
  "response": "...",
  "final_price": N,
  "concessions": ["..."],
  "deal_status": "accepted|counter|rejected",
  "next_step": "..."
}`,
};

// ── Claude API Helper ──

async function callClaude(systemPrompt: string, userMessage: string) {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Claude API error [${resp.status}]: ${errText}`);
  }

  const data = await resp.json();
  const text = data.content?.map((b: any) => b.text || "").join("") || "";

  // Try to extract JSON from the response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch { /* fall through */ }
  }
  return { raw_response: text };
}

// ── Supabase Helper ──

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

// ── Workflow Orchestrator ──

async function advanceWorkflow(workflowId: string, supabase: any) {
  const { data: wf, error: wfErr } = await supabase
    .from("workflow_runs")
    .select("*")
    .eq("id", workflowId)
    .single();

  if (wfErr || !wf) throw new Error("Workflow not found");

  const currentStatus = wf.current_status as WorkflowStatus;
  const nextStatus = STATUS_TRANSITIONS[currentStatus];
  if (!nextStatus) return { status: currentStatus, message: "Workflow complete or in terminal state" };

  const prompt = NODE_PROMPTS[nextStatus];
  if (!prompt) {
    // No agent for this step, just advance status
    await supabase.from("workflow_runs").update({
      current_status: nextStatus,
      status_history: [...(wf.status_history || []), { from: currentStatus, to: nextStatus, at: new Date().toISOString() }],
    }).eq("id", workflowId);
    return { status: nextStatus, message: `Advanced to ${nextStatus}` };
  }

  // Build context from previous steps
  const previousResults = wf.agent_results || {};
  const contextMessage = `
PROJECT: ${wf.project_description || "No description"}
CLIENT: ${wf.client_name || "Unknown"}
PREVIOUS ANALYSIS: ${JSON.stringify(previousResults, null, 2)}

Please analyze and produce your output.`;

  // Call Claude agent
  const result = await callClaude(prompt, contextMessage);

  // Log agent action
  await supabase.from("agent_logs").insert({
    agent_type: nextStatus,
    action: `${nextStatus}_analysis`,
    status: "completed",
    details: { step: nextStatus, result_summary: typeof result === "object" ? Object.keys(result) : "raw" },
    project_id: wf.project_id || null,
    user_id: wf.user_id || null,
  });

  // Handle validation step specially
  if (nextStatus === "validating" && result.passed === false) {
    // Send back to architecting with feedback
    await supabase.from("workflow_runs").update({
      current_status: "architecting",
      agent_results: { ...previousResults, validation_feedback: result },
      status_history: [...(wf.status_history || []), {
        from: currentStatus, to: "validating", at: new Date().toISOString(),
        note: "Validation failed — returning to architect with feedback",
      }],
    }).eq("id", workflowId);
    return { status: "architecting", message: "Validation failed — architect is revising", validation: result };
  }

  // Advance workflow
  await supabase.from("workflow_runs").update({
    current_status: nextStatus,
    agent_results: { ...previousResults, [nextStatus]: result },
    status_history: [...(wf.status_history || []), { from: currentStatus, to: nextStatus, at: new Date().toISOString() }],
  }).eq("id", workflowId);

  return { status: nextStatus, result };
}

// ── Negotiate Handler ──

async function handleNegotiation(workflowId: string, message: string, supabase: any) {
  const { data: wf, error: wfErr } = await supabase
    .from("workflow_runs")
    .select("*")
    .eq("id", workflowId)
    .single();

  if (wfErr || !wf) throw new Error("Workflow not found");
  if (wf.current_status !== "negotiating") {
    throw new Error(`Cannot negotiate: workflow is in '${wf.current_status}' status, expected 'negotiating'`);
  }

  const negotiationPrompt = NODE_PROMPTS.negotiating;
  const previousResults = wf.agent_results || {};
  const history = wf.negotiation_history || [];

  // Add client message to history
  const updatedHistory = [
    ...history,
    { role: "client", message, timestamp: new Date().toISOString() },
  ];

  const contextMessage = `
PROJECT: ${wf.project_description || "No description"}
CLIENT: ${wf.client_name || "Unknown"}
QUOTE DATA: ${JSON.stringify(previousResults.quoting || {}, null, 2)}
ARCHITECTURE: ${JSON.stringify(previousResults.architecting || {}, null, 2)}

NEGOTIATION HISTORY:
${updatedHistory.map((m: any) => `[${m.role}]: ${m.message}`).join("\n")}

CLIENT'S LATEST MESSAGE: ${message}

Respond to the client's message. Follow your negotiation rules strictly.`;

  const result = await callClaude(negotiationPrompt, contextMessage);

  // Extract response text
  const agentResponse = result.response || result.raw_response || JSON.stringify(result);
  const dealStatus = result.deal_status || "counter";

  // Add agent response to history
  updatedHistory.push({
    role: "agent",
    message: agentResponse,
    timestamp: new Date().toISOString(),
  });

  // Determine if deal is agreed
  const isAgreed = dealStatus === "accepted";

  // Update workflow
  await supabase.from("workflow_runs").update({
    negotiation_history: updatedHistory,
    final_agreed_quote: isAgreed ? (result.final_price ? { price: result.final_price, concessions: result.concessions } : previousResults.quoting) : wf.final_agreed_quote,
    agent_results: { ...previousResults, latest_negotiation: result },
  }).eq("id", workflowId);

  // Log agent action
  await supabase.from("agent_logs").insert({
    agent_type: "negotiator",
    action: "negotiation_response",
    status: "completed",
    details: { deal_status: dealStatus, message_count: updatedHistory.length },
    project_id: wf.project_id || null,
    user_id: wf.user_id || null,
  });

  return {
    response: agentResponse,
    deal_status: dealStatus,
    negotiation_history: updatedHistory,
    final_price: result.final_price || null,
  };
}

// ── Main Handler ──

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action } = body;
    const supabase = getSupabase();

    // ── START WORKFLOW ──
    if (action === "start") {
      const { project_description, client_name, user_id, project_id } = body;
      if (!project_description || !user_id) {
        return new Response(JSON.stringify({ error: "project_description and user_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: wf, error } = await supabase.from("workflow_runs").insert({
        user_id,
        project_id: project_id || null,
        project_description,
        client_name: client_name || "Client",
        current_status: "intake",
        agent_results: {},
        status_history: [{ from: null, to: "intake", at: new Date().toISOString() }],
      }).select().single();

      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(wf), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ADVANCE WORKFLOW ──
    if (action === "advance") {
      const { workflow_id } = body;
      if (!workflow_id) {
        return new Response(JSON.stringify({ error: "workflow_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await advanceWorkflow(workflow_id, supabase);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── AUTO-ADVANCE (run all steps) ──
    if (action === "auto_advance") {
      const { workflow_id, max_steps } = body;
      if (!workflow_id) {
        return new Response(JSON.stringify({ error: "workflow_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results: any[] = [];
      const limit = Math.min(max_steps || 5, 8);
      for (let i = 0; i < limit; i++) {
        try {
          const step = await advanceWorkflow(workflow_id, supabase);
          results.push(step);
          if (step.status === "negotiating" || step.status === "live" || step.status === "optimizing") break;
        } catch (e: any) {
          results.push({ error: e.message });
          break;
        }
      }

      return new Response(JSON.stringify({ steps: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── NEGOTIATE (client sends counter-offer / message) ──
    if (action === "negotiate") {
      const { workflow_id, negotiation_message } = body;
      if (!workflow_id || !negotiation_message) {
        return new Response(JSON.stringify({ error: "workflow_id and negotiation_message required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const result = await handleNegotiation(workflow_id, negotiation_message, supabase);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── OVERRIDE (admin control) ──
    if (action === "override") {
      const { workflow_id, override: ov } = body;
      if (!workflow_id || !ov) {
        return new Response(JSON.stringify({ error: "workflow_id and override required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (ov.action === "pause") {
        await supabase.from("workflow_runs").update({ current_status: "paused" }).eq("id", workflow_id);
      } else if (ov.action === "resume") {
        const { data: wf } = await supabase.from("workflow_runs").select("status_history").eq("id", workflow_id).single();
        const lastActive = (wf?.status_history || []).filter((s: any) => s.to !== "paused").pop();
        await supabase.from("workflow_runs").update({ current_status: lastActive?.to || "intake" }).eq("id", workflow_id);
      } else if (ov.action === "shutdown") {
        await supabase.from("workflow_runs").update({ current_status: "shutdown" }).eq("id", workflow_id);
      } else if (ov.action === "set_status") {
        await supabase.from("workflow_runs").update({ current_status: ov.status }).eq("id", workflow_id);
      }

      return new Response(JSON.stringify({ success: true, action: ov.action }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GET WORKFLOW STATUS ──
    if (action === "status") {
      const { workflow_id } = body;
      const { data, error } = await supabase.from("workflow_runs").select("*").eq("id", workflow_id).single();
      if (error) throw new Error(error.message);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use: start, advance, auto_advance, negotiate, override, status" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("invoke-orchestra error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
