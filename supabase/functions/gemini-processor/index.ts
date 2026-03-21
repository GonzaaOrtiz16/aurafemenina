import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── ACTION: chat (Aura Stylist) ──
    if (action === "chat") {
      const pageContext = payload?.pageContext || {};

      // 1. Fetch de productos EN STOCK (Entrega inmediata)
      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, price, original_price, description, colores, sizes, featured, categories(name,slug), subcategories(name,slug)")
        .limit(1000);

      // 2. Fetch de productos POR ENCARGUE
      const { data: encargueProducts } = await supabase
        .from("custom_products")
        .select("id, name, slug, price_estimate, description, estimated_days, colores, sizes, featured, encargue_categories(name,slug), encargue_subcategories(name,slug)")
        .limit(1000);

      // Fetch contact for WhatsApp
      const { data: contactSetting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "contact")
        .maybeSingle();

      const whatsapp = (contactSetting?.value as any)?.whatsapp || "5491134944228";

      const formatSizeMap = (sizes: Record<string, unknown> | null | undefined) => {
        if (!sizes || typeof sizes !== "object") return "sin dato";
        const entries = Object.entries(sizes);
        if (entries.length === 0) return "sin dato";
        return entries.map(([size, stock]) => `${size}:${stock}`).join(", ");
      };

      const formatColorStock = (colores: any[] | null | undefined) => {
        if (!Array.isArray(colores) || colores.length === 0) return "sin dato";
        return colores
          .map((color) => `${color?.nombre || "sin nombre"} {${formatSizeMap(color?.sizes || {})}}`)
          .join(" | ");
      };

      const productsCatalog = (products || [])
        .map((p: any) => {
          const cat = p.categories?.name || "Sin categoría";
          const subcat = p.subcategories?.name ? ` / ${p.subcategories.name}` : "";
          const origPrice = p.original_price ? ` (antes $${p.original_price})` : "";
          return [
            `- ID: ${p.id}`,
            `Nombre: ${p.name}`,
            `Catálogo: stock inmediato`,
            `Categoría: ${cat}${subcat}`,
            `Precio exacto: $${p.price}${origPrice}`,
            `Talles exactos: ${formatSizeMap(p.sizes || {})}`,
            `Stock exacto por color/talle: ${formatColorStock(p.colores || [])}`,
            `Descripción: ${p.description || "sin dato"}`,
            `Destacado: ${p.featured ? "sí" : "no"}`,
            `Link: /producto/${p.slug}`,
          ].join(" | ");
        })
        .join("\n");

      const encargueCatalog = (encargueProducts || [])
        .map((p: any) => {
          const cat = p.encargue_categories?.name || "Sin categoría";
          const subcat = p.encargue_subcategories?.name ? ` / ${p.encargue_subcategories.name}` : "";
          return [
            `- ID: ${p.id}`,
            `Nombre: ${p.name}`,
            `Catálogo: por encargue`,
            `Categoría: ${cat}${subcat}`,
            `Precio exacto: ${p.price_estimate != null ? `$${p.price_estimate}` : "sin dato"}`,
            `Demora exacta: ${p.estimated_days || "sin dato"}`,
            `Talles exactos: ${formatSizeMap(p.sizes || {})}`,
            `Stock exacto por color/talle: ${formatColorStock(p.colores || [])}`,
            `Descripción: ${p.description || "sin dato"}`,
            `Destacado: ${p.featured ? "sí" : "no"}`,
            `Link: /encargues/${p.slug}`,
          ].join(" | ");
        })
        .join("\n");

      const systemPrompt = `Sos "Aura Stylist", la asesora de moda virtual de Aura Femenina, una tienda de ropa femenina argentina.
Hablás en español argentino y sonás cercana, estética y experta. Podés decir frases como "Es un fuego", "Te va a quedar divino" y "Es tendencia esta temporada" cuando encaje de forma natural.

TENÉS ACCESO EN TIEMPO REAL A TODO EL CATÁLOGO Y AL CONTEXTO ACTUAL DE LA PÁGINA.

CONTEXTO DE PÁGINA ACTUAL:
${JSON.stringify(pageContext)}

CATÁLOGO EN STOCK (entrega inmediata):
${productsCatalog}

CATÁLOGO POR ENCARGUE (prendas exclusivas bajo pedido):
${encargueCatalog}

REGLAS DE HIERRO:
- CERO ALUCINACIONES: jamás inventes precios, talles, stock, colores, categorías, demoras ni disponibilidad.
- Si la usuaria pregunta por precio, usá el valor exacto del catálogo o del contexto del producto actual. Nunca redondees, nunca supongas valores viejos.
- Si un dato no está explícitamente en el catálogo o en el contexto del producto actual, respondé exactamente: "Dejame consultarlo con las chicas del taller" y ofrecé este link de WhatsApp: https://wa.me/${whatsapp}
- Si el mensaje incluye contexto invisible del producto actual, ese contexto tiene prioridad total sobre el resto del catálogo.
- Tenés permitido y esperado recomendar tanto productos en stock como productos por encargue. Si es por encargue, aclaralo explícitamente.
- Cuando recomiendes un talle, cerrá con una acción concreta para asegurar la unidad: si es stock, invitá a "Agregar al carrito"; si es por encargue, invitá a "Consultar disponibilidad" por WhatsApp.
- Si preguntan por stock o talles, basate únicamente en "Talles exactos" y "Stock exacto por color/talle".
- Si preguntan por envíos, decí que hacen envíos a todo el país y que los costos se pueden ver en el carrito.
- Sé brillante, útil y vendedora, pero siempre fiel a los datos reales.
- Respondé SIEMPRE en español argentino.`;

      const messages = payload.messages || [];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Demasiadas consultas, intentá de nuevo en unos segundos." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "Servicio temporalmente no disponible." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // ── ACTION: generate-description ──
    if (action === "generate-description") {
      const { productName, category } = payload;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `Sos una redactora de moda de alta gama argentina. Escribís descripciones elegantes, persuasivas y concisas para una tienda de ropa femenina llamada "Aura Femenina". 
Usá español argentino. Máximo 2-3 oraciones. Enfocate en cómo la prenda hace sentir a quien la usa. Sé poética pero concreta. No uses hashtags.`,
            },
            {
              role: "user",
              content: `Escribí una descripción para: "${productName}"${category ? ` (categoría: ${category})` : ""}`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("AI error");
      const data = await response.json();
      const description = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ description }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: smart-search ──
    if (action === "smart-search") {
      const { query } = payload;

      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, price, description, colores, categories(name)")
        .limit(200);

      const productList = (products || [])
        .map((p: any) => {
          const cat = p.categories?.name || "";
          const colores = (p.colores || []).map((c: any) => c.nombre).filter(Boolean).join(", ");
          return `ID:${p.id} | ${p.name} | $${p.price} | Cat:${cat} | Colores:${colores} | ${p.description || ""}`;
        })
        .join("\n");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `Sos un motor de búsqueda inteligente para una tienda de ropa femenina. 
Dada una consulta del usuario, analizá la intención y devolvé los IDs de los productos más relevantes del catálogo.
CATÁLOGO:
${productList}

Respondé SOLO con un JSON array de IDs ordenados por relevancia: ["id1", "id2", ...]`,
            },
            { role: "user", content: query },
          ],
        }),
      });

      if (!response.ok) throw new Error("AI search error");
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "[]";
      const match = content.match(/\[[\s\S]*?\]/);
      const ids = match ? JSON.parse(match[0]) : [];

      return new Response(JSON.stringify({ ids }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: generate-seo ──
    if (action === "generate-seo") {
      const { productName, description, category } = payload;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `Sos un experto en SEO para e-commerce de moda femenina argentina. Generá meta tags optimizados.
Respondé SOLO con JSON: {"metaTitle": "...", "metaDescription": "..."}`,
            },
            {
              role: "user",
              content: `Producto: "${productName}"${category ? ` | Categoría: ${category}` : ""}${description ? ` | Descripción: ${description}` : ""}`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("AI SEO error");
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "{}";
      const match = content.match(/\{[\s\S]*?\}/);
      const seo = match ? JSON.parse(match[0]) : {};

      return new Response(JSON.stringify(seo), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: complete-look ──
    if (action === "complete-look") {
      const { productName, productCategory, catalog } = payload;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `Sos una estilista de moda experta. Dado un producto principal, elegí exactamente 2 productos complementarios del catálogo para armar un outfit completo.
Respondé SOLO con un JSON array de IDs: ["id1", "id2"]`,
            },
            {
              role: "user",
              content: `Producto principal: "${productName}" (${productCategory})\n\nCatálogo:\n${catalog}`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("AI complete-look error");
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "[]";
      const match = content.match(/\[[\s\S]*?\]/);
      const ids = match ? JSON.parse(match[0]) : [];

      return new Response(JSON.stringify({ ids }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: visual-search ──
    if (action === "visual-search") {
      const { imageBase64 } = payload;
      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, price, description, colores, categories(name)")
        .limit(200);

      const productList = (products || [])
        .map((p: any) => `ID:${p.id} | ${p.name} | Cat:${p.categories?.name || ""}`)
        .join("\n");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `Analizá la imagen y encontrá los productos más similares del catálogo.
CATÁLOGO:
${productList}
Respondé SOLO con un JSON array de IDs: ["id1", "id2", ...]`,
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Encontrá prendas similares a esta imagen." },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
              ],
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("AI visual search error");
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "[]";
      const match = content.match(/\[[\s\S]*?\]/);
      const ids = match ? JSON.parse(match[0]) : [];

      return new Response(JSON.stringify({ ids }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gemini-processor error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
