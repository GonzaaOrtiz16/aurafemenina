-- Analytics events for heatmaps, funnel insights, and admin recommendations
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid NULL,
  event_type text NOT NULL,
  path text NOT NULL,
  element_key text NULL,
  product_id uuid NULL,
  custom_product_id uuid NULL,
  order_ref text NULL,
  x_percent numeric(5,2) NULL,
  y_percent numeric(5,2) NULL,
  viewport_width integer NULL,
  viewport_height integer NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT analytics_events_x_percent_range CHECK (x_percent IS NULL OR (x_percent >= 0 AND x_percent <= 100)),
  CONSTRAINT analytics_events_y_percent_range CHECK (y_percent IS NULL OR (y_percent >= 0 AND y_percent <= 100))
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read analytics events"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete analytics events"
ON public.analytics_events
FOR DELETE
TO authenticated
USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON public.analytics_events (path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_id ON public.analytics_events (product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_custom_product_id ON public.analytics_events (custom_product_id) WHERE custom_product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events (session_id);

-- Optional audit trail for AI admin actions
CREATE TABLE IF NOT EXISTS public.admin_ai_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL,
  target_type text NULL,
  target_id text NULL,
  prompt text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_ai_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin AI actions"
ON public.admin_ai_actions
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert admin AI actions"
ON public.admin_ai_actions
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin() AND auth.uid() = admin_user_id);

CREATE POLICY "Admins can delete admin AI actions"
ON public.admin_ai_actions
FOR DELETE
TO authenticated
USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_admin_ai_actions_created_at ON public.admin_ai_actions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_ai_actions_admin_user_id ON public.admin_ai_actions (admin_user_id);