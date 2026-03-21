import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const ALLOWED_TABS = new Set(["products", "encargues", "hero", "faqs", "config", "ai"]);

async function callAI(messages: Array<{ role: string; content: string }>) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const response = await fetch(AI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("Demasiadas consultas al cerebro admin. Intentá nuevamente en unos segundos.");
    if (response.status === 402) throw new Error("El crédito de IA del workspace no alcanza para procesar esta acción.");
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

async function getAdminClient(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return { error: new Response(JSON.stringify({ error: "Falta autenticación" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }) };
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser();

  if (userError || !user) {
    return { error: new Response(JSON.stringify({ error: "Sesión inválida" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }) };
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: roleRow } = await adminClient
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) {
    return { error: new Response(JSON.stringify({ error: "No tenés permisos de admin" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }) };
  }

  return { adminClient, user };
}

function summarizeEvents(events: any[], products: any[], customProducts: any[]) {
  const byPath = new Map<string, { pageViews: number; clicks: number; addToCart: number; checkout: number; customCheckout: number }>();
  const demand = new Map<string, { name: string; type: string; score: number }>();

  const productMap = new Map(products.map((item) => [item.id, item]));
  const customMap = new Map(customProducts.map((item) => [item.id, item]));
  const weights: Record<string, number> = {
    product_view: 1,
    add_to_cart: 4,
    checkout_intent: 8,
    custom_checkout_intent: 7,
  };

  for (const event of events) {
    const current = byPath.get(event.path) || { pageViews: 0, clicks: 0, addToCart: 0, checkout: 0, customCheckout: 0 };
    if (event.event_type === "page_view") current.pageViews += 1;
    if (event.event_type === "click") current.clicks += 1;
    if (event.event_type === "add_to_cart") current.addToCart += 1;
    if (event.event_type === "checkout_intent") current.checkout += 1;
    if (event.event_type === "custom_checkout_intent") current.customCheckout += 1;
    byPath.set(event.path, current);

    const weight = weights[event.event_type] || 0;
    if (!weight) continue;

    if (event.product_id && productMap.has(event.product_id)) {
      const product = productMap.get(event.product_id);
      const currentDemand = demand.get(event.product_id) || { name: product.name, type: "stock", score: 0 };
      currentDemand.score += weight;
      demand.set(event.product_id, currentDemand);
    }

    if (event.custom_product_id && customMap.has(event.custom_product_id)) {
      const product = customMap.get(event.custom_product_id);
      const currentDemand = demand.get(event.custom_product_id) || { name: product.name, type: "encargue", score: 0 };
      currentDemand.score += weight;
      demand.set(event.custom_product_id, currentDemand);
    }
  }

  return {
    byPath: Array.from(byPath.entries()).map(([path, value]) => ({ path, ...value })),
    demand: Array.from(demand.entries())
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12),
  };
}

async function getDashboardSnapshot(adminClient: any) {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString();

  const [{ data: events }, { data: products }, { data: customProducts }, { data: settings }] = await Promise.all([
    adminClient
      .from("analytics_events")
      .select("path, event_type, product_id, custom_product_id, metadata, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000),
    adminClient.from("products").select("id, name, price, featured").limit(120),
    adminClient.from("custom_products").select("id, name, price_estimate, featured").limit(120),
    adminClient.from("site_settings").select("key, value").in("key", ["hero", "announcement", "contact"]),
  ]);

  const summary = summarizeEvents(events || [], products || [], customProducts || []);
  const settingsMap = Object.fromEntries((settings || []).map((item: any) => [item.key, item.value]));

  return {
    events: events || [],
    products: products || [],
    customProducts: customProducts || [],
    settings: settingsMap,
    summary,
  };
}

function fallbackAnalyze(snapshot: any) {
  const busiest = snapshot.summary.byPath.sort((a: any, b: any) => b.pageViews - a.pageViews)[0];
  const strongestDemand = snapshot.summary.demand[0];

  return {
    headline: "Lectura inicial del negocio",
    summary: busiest
      ? `La ruta con más atención es ${busiest.path}. Conviene optimizar su jerarquía visual y reforzar llamados a la acción en esa página.`
      : "Todavía no hay suficientes eventos para una lectura completa, pero el tracking ya está activo.",
    opportunity: strongestDemand
      ? `${strongestDemand.name} aparece como el producto con mayor intención detectada. Podés destacarlo y usarlo como gancho comercial.`
      : "Empezá generando tráfico para que la IA detecte patrones de compra reales.",
    focusPath: busiest?.path || "/",
    recommendations: [
      {
        title: "Reforzar CTA principal",
        reason: "Las páginas con más vistas necesitan un llamado a la acción más visible para convertir mejor.",
        action: "Probar copy más directo y bloques destacados.",
      },
      {
        title: "Empujar top demanda",
        reason: "Los productos con más intención merecen más protagonismo en portada y secciones destacadas.",
        action: "Marcarlos como destacados y usarlos en banners.",
      },
      {
        title: "Seguir acumulando data",
        reason: "El sistema necesita más eventos para detectar cuellos de botella finos por categoría y página.",
        action: "Revisar de nuevo cuando haya más visitas y consultas.",
      },
    ],
  };
}

async function buildAnalyzeResponse(snapshot: any) {
  try {
    return await callAI([
      {
        role: "system",
        content: `Sos una estratega senior de e-commerce y CRO para un panel de administración. Respondé SIEMPRE en español argentino y devolvé JSON con esta forma exacta:
{
  "headline": "...",
  "summary": "...",
  "opportunity": "...",
  "focusPath": "/ruta",
  "recommendations": [
    {"title": "...", "reason": "...", "action": "..."}
  ]
}
Generá entre 3 y 4 recomendaciones accionables. Sé concreta, priorizá negocio y conversión. Si no hay datos suficientes, decilo sin inventar.`,
      },
      {
        role: "user",
        content: `Analizá este snapshot del negocio:
${JSON.stringify(snapshot.summary, null, 2)}`,
      },
    ]);
  } catch {
    return fallbackAnalyze(snapshot);
  }
}

async function upsertSetting(adminClient: any, key: string, patch: Record<string, unknown>) {
  const { data } = await adminClient.from("site_settings").select("value").eq("key", key).maybeSingle();
  const currentValue = (data?.value || {}) as Record<string, unknown>;
  const nextValue = { ...currentValue, ...patch };

  await adminClient.from("site_settings").upsert(
    { key, value: nextValue, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );

  return nextValue;
}

function sanitizeTab(tab: unknown) {
  if (typeof tab !== "string") return "ai";
  return ALLOWED_TABS.has(tab) ? tab : "ai";
}

async function buildCommandPlan(snapshot: any, prompt: string) {
  const stockList = snapshot.products
    .slice(0, 60)
    .map((item: any) => `STOCK | ${item.id} | ${item.name} | precio ${item.price} | destacado ${item.featured ? "sí" : "no"}`)
    .join("\n");

  const customList = snapshot.customProducts
    .slice(0, 60)
    .map((item: any) => `ENCARGUE | ${item.id} | ${item.name} | precio ${item.price_estimate} | destacado ${item.featured ? "sí" : "no"}`)
    .join("\n");

  return callAI([
    {
      role: "system",
      content: `Sos el Cerebro Admin de una tienda de moda. Podés responder y además proponer acciones seguras. Devolvé SIEMPRE JSON con esta forma exacta:
{
  "reply": "respuesta breve",
  "openTab": "products|encargues|hero|faqs|config|ai",
  "actions": [
    {
      "type": "update_announcement|update_contact|update_hero|update_product_price|update_custom_product_price|set_product_featured|set_custom_product_featured|none",
      "productId": "uuid opcional",
      "value": 0,
      "featured": true,
      "patch": {}
    }
  ]
}
Reglas:
- Solo usá acciones si el usuario dio una orden explícita.
- Si no podés ejecutar algo con seguridad, usá type "none" y explicalo.
- Para contenido, usá patch con campos puntuales.
- Para hero, patch puede incluir: tagline, title_line1, title_line2, subtitle, button_text.
- Para announcement, patch puede incluir: text, enabled.
- Para contact, patch puede incluir: whatsapp, instagram, instagram_url, email, location.
- Para precios, usá el productId exacto de la lista.
- Respondé en español argentino, tono ejecutivo y claro.`,
    },
    {
      role: "user",
      content: `Pedido del admin: ${prompt}

Resumen del negocio:
${JSON.stringify(snapshot.summary, null, 2)}

Configuración actual:
${JSON.stringify(snapshot.settings, null, 2)}

Productos stock:
${stockList}

Productos por encargue:
${customList}`,
    },
  ]);
}

async function executeActions(adminClient: any, userId: string, prompt: string, actions: any[]) {
  const executedActions: string[] = [];

  for (const action of actions || []) {
    if (!action || action.type === "none") continue;

    switch (action.type) {
      case "update_announcement": {
        await upsertSetting(adminClient, "announcement", action.patch || {});
        executedActions.push("Barra de anuncio actualizada");
        break;
      }
      case "update_contact": {
        await upsertSetting(adminClient, "contact", action.patch || {});
        executedActions.push("Datos de contacto actualizados");
        break;
      }
      case "update_hero": {
        await upsertSetting(adminClient, "hero", action.patch || {});
        executedActions.push("Textos de portada actualizados");
        break;
      }
      case "update_product_price": {
        if (action.productId && typeof action.value === "number" && action.value > 0) {
          await adminClient.from("products").update({ price: action.value }).eq("id", action.productId);
          executedActions.push("Precio de producto stock actualizado");
        }
        break;
      }
      case "update_custom_product_price": {
        if (action.productId && typeof action.value === "number" && action.value > 0) {
          await adminClient.from("custom_products").update({ price_estimate: action.value }).eq("id", action.productId);
          executedActions.push("Precio estimado de encargue actualizado");
        }
        break;
      }
      case "set_product_featured": {
        if (action.productId && typeof action.featured === "boolean") {
          await adminClient.from("products").update({ featured: action.featured }).eq("id", action.productId);
          executedActions.push(action.featured ? "Producto stock marcado como destacado" : "Producto stock quitado de destacados");
        }
        break;
      }
      case "set_custom_product_featured": {
        if (action.productId && typeof action.featured === "boolean") {
          await adminClient.from("custom_products").update({ featured: action.featured }).eq("id", action.productId);
          executedActions.push(action.featured ? "Encargue marcado como destacado" : "Encargue quitado de destacados");
        }
        break;
      }
    }
  }

  await adminClient.from("admin_ai_actions").insert({
    admin_user_id: userId,
    action_type: executedActions.length > 0 ? "command_execution" : "analysis_only",
    prompt,
    status: "completed",
    result: { executedActions },
  });

  return executedActions;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const adminSetup = await getAdminClient(req);
    if (adminSetup.error) return adminSetup.error;

    const { adminClient, user } = adminSetup;
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "command" ? "command" : "analyze";
    const snapshot = await getDashboardSnapshot(adminClient);

    if (mode === "analyze") {
      const analysis = await buildAnalyzeResponse(snapshot);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = String(body.prompt || "").trim();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Falta el prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = await buildCommandPlan(snapshot, prompt);
    const executedActions = await executeActions(adminClient, user.id, prompt, plan.actions || []);

    return new Response(
      JSON.stringify({
        reply: plan.reply || "Listo.",
        openTab: sanitizeTab(plan.openTab),
        executedActions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("admin-brain error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
