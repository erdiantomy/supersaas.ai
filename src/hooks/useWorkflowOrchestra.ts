import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type WorkflowStatus =
  | "intake" | "planning" | "architecting" | "quoting" | "negotiating"
  | "paid" | "building" | "testing" | "deploying" | "live" | "optimizing"
  | "paused" | "shutdown";

export interface WorkflowRun {
  id: string;
  user_id: string;
  project_id: string | null;
  client_id: string | null;
  current_status: WorkflowStatus;
  raw_client_prompt: string;
  planner_output: any;
  architecture_json: any;
  quote_data: any;
  negotiation_history: any[];
  final_agreed_quote: any;
  stripe_session_id: string | null;
  generated_code_bundle: string | null;
  live_app_url: string | null;
  super_admin_override: { action: string | null; reason: string | null; timestamp: string | null };
  metadata: { timeline_days: number; projected_roi: number; total_agent_minutes: number };
  created_at: string;
  updated_at: string;
}

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invoke-orchestra`;

async function callOrchestra(body: any) {
  const resp = await fetch(FUNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export function useWorkflowOrchestra() {
  const [workflow, setWorkflow] = useState<WorkflowRun | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!workflow?.id) return;

    const channel = supabase
      .channel(`workflow:${workflow.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "workflow_runs",
          filter: `id=eq.${workflow.id}`,
        },
        (payload) => {
          setWorkflow(payload.new as WorkflowRun);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workflow?.id]);

  const startWorkflow = useCallback(async (clientPrompt: string, userId: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await callOrchestra({ action: "start", client_prompt: clientPrompt, user_id: userId });
      // Fetch full state
      const status = await callOrchestra({ action: "status", workflow_id: result.workflow_id });
      setWorkflow(status);
      return result;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const advanceWorkflow = useCallback(async () => {
    if (!workflow?.id) return;
    setIsProcessing(true);
    setError(null);
    try {
      const result = await callOrchestra({ action: "advance", workflow_id: workflow.id });
      const status = await callOrchestra({ action: "status", workflow_id: workflow.id });
      setWorkflow(status);
      return result;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setIsProcessing(false);
    }
  }, [workflow?.id]);

  const sendOverride = useCallback(async (overrideAction: string, reason?: string) => {
    if (!workflow?.id) return;
    setIsProcessing(true);
    try {
      await callOrchestra({
        action: "override",
        workflow_id: workflow.id,
        override: { action: overrideAction, reason },
      });
      const status = await callOrchestra({ action: "status", workflow_id: workflow.id });
      setWorkflow(status);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProcessing(false);
    }
  }, [workflow?.id]);

  return { workflow, isProcessing, error, startWorkflow, advanceWorkflow, sendOverride, setWorkflow };
}
