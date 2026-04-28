import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot,
  BrainCircuit,
  Flame,
  MousePointerClick,
  RefreshCw,
  Send,
  TrendingUp,
  WandSparkles,
} from "lucide-react";

type AdminTab = "products" | "encargues" | "hero" | "faqs" | "config" | "ai";

interface AdminAIProps {
  onNavigateTab?: (tab: AdminTab) => void;
}

interface AnalyticsEventRow {
  id: string;
  path: string;
  event_type: string;
  product_id: string | null;
  custom_product_id: string | null;
  x_percent: number | null;
  y_percent: number | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

interface ProductRow {
  id: string;
  name: string;
  price?: number;
  price_estimate?: number;
  featured?: boolean;
}

interface InsightResponse {
  headline?: string;
  summary?: string;
  opportunity?: string;
  focusPath?: string;
  recommendations?: Array<{
    title: string;
    reason: string;
    action: string;
  }>;
}

interface CommandResponse {
  reply?: string;
  openTab?: AdminTab;
  executedActions?: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  actions?: string[];
}

const QUICK_PROMPTS = [
  "Analizá qué páginas tienen más fricción y decime qué mejorar primero.",
  "Decime qué productos muestran más intención de compra.",
  "Cambiá el anuncio principal por uno más vendedor para esta semana.",
  "Marcá como destacado el producto stock con más intención de compra.",
];

export default function AdminAI({ onNavigateTab }: AdminAIProps) {
  const db = supabase as any;
  const queryClient = useQueryClient();
  const [selectedPath, setSelectedPath] = useState<string>("/");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Soy tu **Cerebro Admin**. Puedo analizar comportamiento real, detectar oportunidades y ejecutar cambios seguros sobre contenido y catálogo.",
    },
  ]);

  const analyticsQuery = useQuery({
    queryKey: ["admin-ai", "analytics-events"],
    queryFn: async () => {
      const { data, error } = await db
        .from("analytics_events")
        .select("id, path, event_type, product_id, custom_product_id, x_percent, y_percent, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;
      return (data || []) as AnalyticsEventRow[];
    },
    refetchInterval: 60_000,
  });

  const stockProductsQuery = useQuery({
    queryKey: ["admin-ai", "stock-products"],
    queryFn: async () => {
      const { data, error } = await db.from("products").select("id, name, price, featured").limit(200);
      if (error) throw error;
      return (data || []) as ProductRow[];
    },
  });

  const customProductsQuery = useQuery({
    queryKey: ["admin-ai", "custom-products"],
    queryFn: async () => {
      const { data, error } = await db.from("custom_products").select("id, name, price_estimate, featured").limit(200);
      if (error) throw error;
      return (data || []) as ProductRow[];
    },
  });

  const activityQuery = useQuery({
    queryKey: ["admin-ai", "activity"],
    queryFn: async () => {
      const { data, error } = await db
        .from("admin_ai_actions")
        .select("id, action_type, status, created_at, result")
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data || [];
    },
  });

  const insightsQuery = useQuery({
    queryKey: ["admin-ai", "insights"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-brain", {
        body: { mode: "analyze" },
      });

      if (error) throw error;
      return (data || {}) as InsightResponse;
    },
    staleTime: 60_000,
  });

  const commandMutation = useMutation({
    mutationFn: async (nextPrompt: string) => {
      const { data, error } = await supabase.functions.invoke("admin-brain", {
        body: { mode: "command", prompt: nextPrompt },
      });

      if (error) throw error;
      return (data || {}) as CommandResponse;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Listo.",
          actions: data.executedActions || [],
        },
      ]);

      const acts = data.executedActions || [];
      if (acts.length > 0) {
        toast.success(`✅ ${acts.length} acción(es) ejecutada(s)`, {
          description: acts.join(" · "),
          duration: 6000,
        });
      } else {
        toast.info("Cerebro respondió sin ejecutar cambios", {
          description: (data.reply || "").slice(0, 120) || "Revisá la respuesta en el chat.",
        });
      }

      if (data.openTab && onNavigateTab) onNavigateTab(data.openTab);

      queryClient.invalidateQueries({ queryKey: ["admin-ai"] });
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["custom-products"] });
    },
    onError: (err: any) => {
      toast.error("Error en el Cerebro Admin", {
        description: err?.message || "No se pudo ejecutar la acción.",
      });
    },
  });

  const events = analyticsQuery.data || [];
  const stockProducts = stockProductsQuery.data || [];
  const customProducts = customProductsQuery.data || [];

  const availablePaths = useMemo(() => {
    const unique = Array.from(new Set(events.map((event) => event.path))).filter(Boolean);
    return unique.length > 0 ? unique : ["/"];
  }, [events]);

  useEffect(() => {
    if (!availablePaths.includes(selectedPath)) {
      setSelectedPath(availablePaths[0] || "/");
    }
  }, [availablePaths, selectedPath]);

  const selectedClicks = useMemo(
    () => events.filter((event) => event.path === selectedPath && event.event_type === "click"),
    [events, selectedPath],
  );

  const heatmapCells = useMemo(() => {
    const rows = 5;
    const cols = 8;
    const cells = Array.from({ length: rows * cols }, () => 0);

    selectedClicks.forEach((event) => {
      const x = Math.min(cols - 1, Math.max(0, Math.floor(((event.x_percent ?? 0) / 100) * cols)));
      const y = Math.min(rows - 1, Math.max(0, Math.floor(((event.y_percent ?? 0) / 100) * rows)));
      cells[y * cols + x] += 1;
    });

    const max = Math.max(...cells, 1);

    return cells.map((count, index) => ({
      count,
      index,
      intensity: count / max,
    }));
  }, [selectedClicks]);

  const scrollByPath = useMemo(() => {
    const grouped = new Map<string, number[]>();

    events
      .filter((event) => event.event_type === "scroll_depth")
      .forEach((event) => {
        const depth = Number(event.metadata?.depth || 0);
        if (!grouped.has(event.path)) grouped.set(event.path, []);
        grouped.get(event.path)?.push(depth);
      });

    return Array.from(grouped.entries())
      .map(([path, values]) => ({
        path,
        average: Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1)),
        max: Math.max(...values),
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);
  }, [events]);

  const productDemand = useMemo(() => {
    const stockMap = new Map(stockProducts.map((product) => [product.id, product]));
    const customMap = new Map(customProducts.map((product) => [product.id, product]));
    const scores = new Map<string, { label: string; type: string; score: number }>();

    const weights: Record<string, number> = {
      product_view: 1,
      add_to_cart: 4,
      checkout_intent: 8,
      custom_checkout_intent: 7,
    };

    events.forEach((event) => {
      const weight = weights[event.event_type] || 0;
      if (!weight) return;

      if (event.product_id && stockMap.has(event.product_id)) {
        const product = stockMap.get(event.product_id)!;
        const current = scores.get(event.product_id) || { label: product.name, type: "Stock", score: 0 };
        current.score += weight;
        scores.set(event.product_id, current);
      }

      if (event.custom_product_id && customMap.has(event.custom_product_id)) {
        const product = customMap.get(event.custom_product_id)!;
        const current = scores.get(event.custom_product_id) || { label: product.name, type: "Encargue", score: 0 };
        current.score += weight;
        scores.set(event.custom_product_id, current);
      }
    });

    return Array.from(scores.values()).sort((a, b) => b.score - a.score).slice(0, 6);
  }, [customProducts, events, stockProducts]);

  const totals = useMemo(() => {
    const pageViews = events.filter((event) => event.event_type === "page_view").length;
    const clicks = events.filter((event) => event.event_type === "click").length;
    const cartIntents = events.filter((event) => event.event_type === "add_to_cart").length;
    const checkouts = events.filter((event) => event.event_type === "checkout_intent" || event.event_type === "custom_checkout_intent").length;

    return { pageViews, clicks, cartIntents, checkouts };
  }, [events]);

  const handleSend = async (forcedPrompt?: string) => {
    const nextPrompt = (forcedPrompt || prompt).trim();
    if (!nextPrompt) return;

    setMessages((prev) => [...prev, { role: "user", content: nextPrompt }]);
    setPrompt("");
    await commandMutation.mutateAsync(nextPrompt);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Visitas", value: totals.pageViews, icon: TrendingUp },
          { label: "Clicks útiles", value: totals.clicks, icon: MousePointerClick },
          { label: "Agregar al carrito", value: totals.cartIntents, icon: Flame },
          { label: "Intención cierre", value: totals.checkouts, icon: WandSparkles },
        ].map((item) => (
          <Card key={item.label} className="border-border/80 bg-card/70 backdrop-blur">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary/60">
                <item.icon className="h-5 w-5 text-accent" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-border/80 bg-card/80">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 font-display text-2xl font-semibold">
                  <BrainCircuit className="h-5 w-5 text-accent" /> Insights IA
                </CardTitle>
                <CardDescription>
                  Recomendaciones sobre comportamiento real, intención de compra y puntos de fuga.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => insightsQuery.refetch()}
                disabled={insightsQuery.isFetching}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${insightsQuery.isFetching ? "animate-spin" : ""}`} /> Actualizar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
                  {insightsQuery.data?.headline || "Leyendo señales de la tienda"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {insightsQuery.data?.summary || "Todavía no hay suficiente información procesada por IA, pero el sistema ya está capturando comportamiento real para construir el diagnóstico."}
                </p>
              </div>

              {insightsQuery.data?.opportunity && (
                <div className="rounded-2xl border border-accent/20 bg-secondary/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Oportunidad</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed">{insightsQuery.data.opportunity}</p>
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-3">
                {(insightsQuery.data?.recommendations || []).slice(0, 3).map((item) => (
                  <div key={item.title} className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="text-sm font-semibold leading-tight">{item.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">{item.action}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/80 bg-card/80">
              <CardHeader>
                <CardTitle className="font-display text-2xl font-semibold">Mapa de calor</CardTitle>
                <CardDescription>Clicks reales agrupados por zonas para detectar qué llama más la atención.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {availablePaths.slice(0, 8).map((path) => (
                    <Button
                      key={path}
                      type="button"
                      variant={selectedPath === path ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPath(path)}
                      className="rounded-full text-[10px] uppercase tracking-[0.18em]"
                    >
                      {path}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-8 gap-2 rounded-[1.75rem] border border-border bg-secondary/30 p-4">
                  {heatmapCells.map((cell) => (
                    <div
                      key={cell.index}
                      className="aspect-square rounded-xl border border-border/40"
                      style={{
                        background: `hsl(var(--accent) / ${0.08 + cell.intensity * 0.62})`,
                      }}
                      title={cell.count > 0 ? `${cell.count} clicks` : "Sin actividad"}
                    />
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  Ruta analizada: <span className="font-semibold text-foreground">{selectedPath}</span> · {selectedClicks.length} clicks registrados.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/80">
              <CardHeader>
                <CardTitle className="font-display text-2xl font-semibold">Demanda y scroll</CardTitle>
                <CardDescription>Qué productos concentran más intención y qué páginas logran mayor profundidad.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Top demanda</p>
                  <div className="space-y-3">
                    {productDemand.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aún no hay suficientes eventos para rankear productos.</p>
                    ) : (
                      productDemand.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 p-3">
                          <div>
                            <p className="text-sm font-medium leading-tight">{item.label}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{item.type}</p>
                          </div>
                          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                            score {item.score}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Scroll promedio</p>
                  <div className="space-y-3">
                    {scrollByPath.map((item) => (
                      <div key={item.path} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4 text-xs">
                          <span className="font-medium">{item.path}</span>
                          <span className="text-muted-foreground">{item.average}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${item.average}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-2xl font-semibold">
              <Bot className="h-5 w-5 text-accent" /> Cerebro Admin
            </CardTitle>
            <CardDescription>
              Dale órdenes en lenguaje natural para analizar, proponer y ejecutar cambios seguros.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => void handleSend(quick)}
                  className="rounded-full border border-border bg-secondary/50 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  {quick}
                </button>
              ))}
            </div>

            <ScrollArea className="h-[420px] rounded-[1.75rem] border border-border bg-background/70 p-4">
              <div className="space-y-4 pr-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`rounded-3xl px-4 py-3 ${
                      message.role === "assistant"
                        ? "mr-8 border border-border bg-card"
                        : "ml-8 bg-foreground text-background"
                    }`}
                  >
                    <div className={`prose prose-sm max-w-none ${message.role === "assistant" ? "text-foreground" : "text-background"}`}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action) => (
                          <Badge key={action} variant="outline" className="rounded-full text-[10px] uppercase tracking-[0.18em]">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="rounded-[1.75rem] border border-border bg-background/70 p-3">
              <Textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ej: subí a destacados el producto con más intención de compra o cambiá el anuncio por uno más urgente..."
                rows={4}
                className="min-h-[110px] resize-none border-0 bg-transparent p-2 focus-visible:ring-0"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Contenido + catálogo + análisis</p>
                <Button onClick={() => void handleSend()} disabled={commandMutation.isPending} className="gap-2 rounded-full px-5">
                  {commandMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Ejecutar
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Actividad reciente</p>
              <div className="space-y-2">
                {(activityQuery.data || []).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border bg-background/60 px-3 py-2 text-xs">
                    <span className="font-medium">{item.action_type}</span>
                    <span className="text-muted-foreground">{new Date(item.created_at).toLocaleDateString("es-AR")}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
