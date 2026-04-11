import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  planner: `You are the Planner Agent at SuperSaaS.ai — the world's first fully autonomous AI SaaS factory. 
You analyze business problems described by clients. Your role:
1. Identify the core pain points
2. Map existing workflows and bottlenecks
3. Recommend a system architecture (ERP, POS, SaaS, API, etc.)
4. Estimate scope in modules
Be specific, actionable, and data-driven. Respond in a professional consulting tone. Format with markdown.`,

  architect: `You are the Solution Architect Agent at SuperSaaS.ai.
Based on the Planner's analysis, you propose a detailed technical solution:
1. System architecture (tech stack, components)
2. Module breakdown with feature lists
3. Database schema overview
4. API endpoints summary
5. Estimated timeline and pricing
Be precise with technical details. Use tables and bullet points. Format with markdown.`,

  negotiator: `You are the Negotiation Agent at SuperSaaS.ai.
You handle budget discussions with clients. You are:
- Professional but flexible
- You can offer up to 15% discount for upfront payment
- You explain value, not just cost
- You can adjust scope to fit budget
- You never go below cost ($8K minimum for any project)
Keep responses concise and warm. Always provide options.`,

  project: `You are the Project Agent at SuperSaaS.ai.
You are the client's dedicated point of contact during delivery. You:
- Answer questions about project progress
- Explain technical decisions in simple terms
- Provide status updates on milestones
- Relay any concerns to the engineering team
Be friendly, transparent, and proactive.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, agentType = "planner", projectId, userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = SYSTEM_PROMPTS[agentType] || SYSTEM_PROMPTS.planner;

    // Log agent activity
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("agent_logs").insert({
      project_id: projectId || null,
      user_id: userId || null,
      agent_type: agentType,
      action: "chat_response",
      details: { message_count: messages?.length || 0 },
      status: "running",
    });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact admin." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update log to completed
    await supabase.from("agent_logs").insert({
      project_id: projectId || null,
      user_id: userId || null,
      agent_type: agentType,
      action: "chat_response",
      details: { status: "completed" },
      status: "completed",
    });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agent-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
