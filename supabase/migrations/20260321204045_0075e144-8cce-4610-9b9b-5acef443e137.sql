DROP POLICY IF EXISTS "Anyone can insert analytics events" ON public.analytics_events;

CREATE POLICY "Public can insert validated analytics events"
ON public.analytics_events
FOR INSERT
TO public
WITH CHECK (
  length(trim(session_id)) >= 8
  AND length(trim(event_type)) >= 2
  AND length(trim(path)) >= 1
  AND (viewport_width IS NULL OR viewport_width BETWEEN 1 AND 10000)
  AND (viewport_height IS NULL OR viewport_height BETWEEN 1 AND 10000)
  AND (x_percent IS NULL OR (x_percent >= 0 AND x_percent <= 100))
  AND (y_percent IS NULL OR (y_percent >= 0 AND y_percent <= 100))
  AND (element_key IS NULL OR length(trim(element_key)) <= 120)
  AND (order_ref IS NULL OR length(trim(order_ref)) <= 120)
);