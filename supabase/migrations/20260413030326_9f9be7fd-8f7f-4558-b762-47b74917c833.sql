ALTER TABLE public.workflow_runs
  ADD COLUMN IF NOT EXISTS agent_results jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS status_history jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS project_description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS client_name text DEFAULT 'Client',
  ADD COLUMN IF NOT EXISTS deployment_type text DEFAULT 'agent-native',
  ADD COLUMN IF NOT EXISTS agent_native_score jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS validation_passed boolean DEFAULT NULL;

ALTER TABLE public.managed_agents
  ADD COLUMN IF NOT EXISTS mcp_config jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sandbox_config jsonb DEFAULT '{"isolated": true, "max_memory_mb": 512, "network": "restricted", "audit": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS agent_native_score integer DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_managed_events_session_id ON public.managed_events(session_id);
CREATE INDEX IF NOT EXISTS idx_managed_events_event_type ON public.managed_events(event_type);
CREATE INDEX IF NOT EXISTS idx_managed_sessions_user_id ON public.managed_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_managed_sessions_status ON public.managed_sessions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_user_id ON public.workflow_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON public.workflow_runs(current_status);