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
      // 1. Fetch de productos EN STOCK (Entrega inmediata)
      const { data: products } = await supabase
        .from("products")
        .select("name, slug, price, original_price, description, colores, sizes, images, categories(name)")
        .limit(100);

      // 2. Fetch de productos POR ENCARGUE (Catálogo Premium)
      // Ajustado a tus columnas reales: price_estimate y estimated_days
      const { data: encargueProducts } = await supabase
        .from("custom_products")
        .select("name, price_estimate, description, estimated_days")
        .limit(100);

      // Fetch contact for WhatsApp
      const { data: contactSetting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "contact")
        .maybeSingle();

      const whatsapp = (contactSetting?.value as any)?.whatsapp || "5491134944228";

      // Armamos la lista de Stock Inmediato
      const productsCatalog = (products || [])
        .map((p: any) => {
          const colores = (p.colores || []).map((c: any) => c.nombre).filter(Boolean).join(", ");
          const sizes = p.colores?.length
            ? [...new Set((p.colores as any[]).flatMap((c: any) => Object.keys(c.sizes || {})))].join(", ")
            : Object.keys(p.sizes || {}).join(", ");
          const cat = p.categories?.name || "";
          const price = p.price;
          const origPrice = p.original_price ? ` (antes $${p.original_price})` : "";
          return `- ${p.name} | $${price}${origPrice} | Cat: ${cat} | Colores: ${colores || "N/A"} | Talles: ${sizes || "N/A"} | Link: /producto/${p.slug}`;
        })
        .join("\n");

      // Armamos la lista de Productos por Encargue con tus columnas reales
      const encargueCatalog = (encargueProducts || [])
        .map((p: any) => {
          const price = p.price_estimate ? `$${p.price_estimate}` : 'Consultar';
          const days = p.estimated_days || '5-15';
          return `- ${p.name} | Precio est: ${price} | Entrega: ${days} días | (MODALIDAD: POR ENCARGUE)`;
        })
        .join("\n");

      const systemPrompt = `Sos "Aura Stylist", la asesora de moda virtual de Aura Femenina, una tienda de ropa femenina argentina.
Tu personalidad es cálida, fashionista, empática y profesional. Usás un tono amigable pero elegante, como una amiga que sabe de moda.
Hablás en español argentino (usás "vos", "tenés", "mirá", etc.).

ATENCIÓN: La tienda maneja DOS catálogos distintos.

1. CATÁLOGO EN STOCK (Entrega inmediata):
${productsCatalog}

2. CATÁLOGO "POR ENCARGUE" (Prendas exclusivas bajo pedido):
${encargueCatalog}

REGLAS DE ORO:
- Podés recomendar productos de ambos catálogos libremente según lo que busque la clienta. Mencioná precios y talles disponibles.
- SI LA CLIENTA ELIGE UN PRODUCTO DEL CATÁLOGO "POR ENCARGUE": Tenés que aclararle que esas prendas no están en stock físico inmediato, que se traen por encargo y tienen una demora estimada de entrega (generalmente entre 5 y 15 días).
- Para concretar cualquier compra "Por Encargue" o resolver dudas específicas de esos pedidos, derivá SIEMPRE a la clienta al WhatsApp: ${whatsapp}.
- Si preguntan por envíos, decí que hacen envíos a todo el país y que pueden ver los costos en el carrito.
- Sé concisa pero encantadora. Usá emojis con moderación (✨, 💕, 👗).
- Nunca inventes productos que no estén en las dos listas de arriba.
- Respondé SIEMPRE en español argentino.`;

      const messages = payload.messages || [];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
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
