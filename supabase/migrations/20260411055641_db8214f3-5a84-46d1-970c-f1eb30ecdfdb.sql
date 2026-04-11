
-- Quotes table for AI-generated proposals
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  proposed_scope TEXT NOT NULL,
  timeline TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft',
  counter_offer_details JSONB,
  ai_reasoning TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all quotes" ON public.quotes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own quotes" ON public.quotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own quotes" ON public.quotes FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Agent logs table
CREATE TABLE public.agent_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID,
  agent_type TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  status TEXT NOT NULL DEFAULT 'running',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all agent_logs" ON public.agent_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own agent_logs" ON public.agent_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert agent_logs" ON public.agent_logs FOR INSERT WITH CHECK (true);

-- Generated apps table
CREATE TABLE public.generated_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  code_snapshot JSONB,
  deploy_url TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'building',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all generated_apps" ON public.generated_apps FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own generated_apps" ON public.generated_apps FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects p JOIN clients c ON c.id = p.client_id
    WHERE p.id = generated_apps.project_id AND c.user_id = auth.uid()
  )
);

CREATE TRIGGER update_generated_apps_updated_at BEFORE UPDATE ON public.generated_apps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for agent_logs so clients see live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_logs;
