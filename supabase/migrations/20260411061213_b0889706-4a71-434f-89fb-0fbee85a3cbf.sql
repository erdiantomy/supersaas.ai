
-- Create workflow_runs table for LangGraph-style state persistence
CREATE TABLE public.workflow_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id),
  user_id uuid NOT NULL,
  current_status text NOT NULL DEFAULT 'intake',
  raw_client_prompt text NOT NULL DEFAULT '',
  planner_output jsonb DEFAULT NULL,
  architecture_json jsonb DEFAULT NULL,
  quote_data jsonb DEFAULT NULL,
  negotiation_history jsonb DEFAULT '[]'::jsonb,
  final_agreed_quote jsonb DEFAULT NULL,
  stripe_session_id text DEFAULT NULL,
  generated_code_bundle text DEFAULT NULL,
  live_app_url text DEFAULT NULL,
  super_admin_override jsonb DEFAULT '{"action": null, "reason": null, "timestamp": null}'::jsonb,
  metadata jsonb DEFAULT '{"timeline_days": 0, "projected_roi": 0, "total_agent_minutes": 0}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

-- Admins can manage all
CREATE POLICY "Admins can manage all workflow_runs"
  ON public.workflow_runs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own
CREATE POLICY "Users can view own workflow_runs"
  ON public.workflow_runs FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert (edge functions)
CREATE POLICY "System can insert workflow_runs"
  ON public.workflow_runs FOR INSERT
  WITH CHECK (true);

-- System can update (edge functions)
CREATE POLICY "System can update workflow_runs"
  ON public.workflow_runs FOR UPDATE
  USING (true);

-- Timestamp trigger
CREATE TRIGGER update_workflow_runs_updated_at
  BEFORE UPDATE ON public.workflow_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_runs;
