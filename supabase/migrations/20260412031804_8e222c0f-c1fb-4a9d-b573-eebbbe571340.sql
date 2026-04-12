
-- Managed Agents table
CREATE TABLE public.managed_agents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  model text NOT NULL DEFAULT 'claude-sonnet-4-20250514',
  system_prompt text,
  tools jsonb NOT NULL DEFAULT '[]'::jsonb,
  version integer NOT NULL DEFAULT 1,
  anthropic_agent_id text,
  status text NOT NULL DEFAULT 'draft',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all managed_agents" ON public.managed_agents FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own managed_agents" ON public.managed_agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own managed_agents" ON public.managed_agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own managed_agents" ON public.managed_agents FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_managed_agents_updated_at BEFORE UPDATE ON public.managed_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Managed Environments table
CREATE TABLE public.managed_environments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  agent_id uuid REFERENCES public.managed_agents(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'default',
  packages jsonb NOT NULL DEFAULT '[]'::jsonb,
  anthropic_environment_id text,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_environments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all managed_environments" ON public.managed_environments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own managed_environments" ON public.managed_environments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own managed_environments" ON public.managed_environments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own managed_environments" ON public.managed_environments FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_managed_environments_updated_at BEFORE UPDATE ON public.managed_environments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Managed Sessions table
CREATE TABLE public.managed_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  agent_id uuid REFERENCES public.managed_agents(id) ON DELETE CASCADE NOT NULL,
  environment_id uuid REFERENCES public.managed_environments(id) ON DELETE SET NULL,
  workflow_run_id uuid REFERENCES public.workflow_runs(id) ON DELETE SET NULL,
  anthropic_session_id text,
  status text NOT NULL DEFAULT 'pending',
  approval_mode text NOT NULL DEFAULT 'auto',
  cost_data jsonb DEFAULT '{"session_hours": 0, "token_cost": 0, "total_cost": 0}'::jsonb,
  last_event_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all managed_sessions" ON public.managed_sessions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own managed_sessions" ON public.managed_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own managed_sessions" ON public.managed_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_managed_sessions_updated_at BEFORE UPDATE ON public.managed_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Managed Events table
CREATE TABLE public.managed_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES public.managed_sessions(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  requires_approval boolean NOT NULL DEFAULT false,
  approval_status text DEFAULT 'none',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all managed_events" ON public.managed_events FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view own session events" ON public.managed_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.managed_sessions ms WHERE ms.id = managed_events.session_id AND ms.user_id = auth.uid())
);
CREATE POLICY "System can insert managed_events" ON public.managed_events FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.managed_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.managed_events;
