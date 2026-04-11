
-- Drop overly permissive policies
DROP POLICY "System can insert workflow_runs" ON public.workflow_runs;
DROP POLICY "System can update workflow_runs" ON public.workflow_runs;

-- Tighter insert: user can create their own, admins can create any
CREATE POLICY "Users can insert own workflow_runs"
  ON public.workflow_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update only by admin (edge functions use service_role which bypasses RLS)
CREATE POLICY "Admins can update workflow_runs"
  ON public.workflow_runs FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
