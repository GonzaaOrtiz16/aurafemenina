import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "aura-analytics-session";

type AnalyticsEventType =
  | "page_view"
  | "click"
  | "scroll_depth"
  | "product_view"
  | "add_to_cart"
  | "checkout_intent"
  | "custom_checkout_intent";

interface AnalyticsEventInput {
  eventType: AnalyticsEventType;
  path?: string;
  elementKey?: string;
  productId?: string;
  customProductId?: string;
  orderRef?: string;
  xPercent?: number;
  yPercent?: number;
  metadata?: Record<string, unknown>;
}

function getAnalyticsSessionId() {
  if (typeof window === "undefined") return "server-session";

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const next = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(SESSION_KEY, next);
  return next;
}

function normalizePercent(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(100, Number(value.toFixed(2))));
}

export async function trackAnalyticsEvent({
  eventType,
  path,
  elementKey,
  productId,
  customProductId,
  orderRef,
  xPercent,
  yPercent,
  metadata = {},
}: AnalyticsEventInput) {
  if (typeof window === "undefined") return;

  const db = supabase as any;

  const payload = {
    session_id: getAnalyticsSessionId(),
    event_type: eventType,
    path: path || window.location.pathname,
    element_key: elementKey || null,
    product_id: productId || null,
    custom_product_id: customProductId || null,
    order_ref: orderRef || null,
    x_percent: normalizePercent(xPercent),
    y_percent: normalizePercent(yPercent),
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    metadata,
  };

  try {
    await db.from("analytics_events").insert(payload);
  } catch (error) {
    console.warn("analytics event failed", error);
  }
}
