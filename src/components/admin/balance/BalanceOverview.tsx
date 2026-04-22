import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, AlertTriangle, Receipt, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Period = "today" | "week" | "month" | "all";

interface Stats {
  revenue: number;
  cost: number;
  profit: number;
  salesCount: number;
  unitsSold: number;
  expenses: number;
  net: number;
  pendingFiados: number;
  topProducts: { name: string; qty: number; revenue: number }[];
  lowStock: { name: string; stock: number }[];
}

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "week", label: "7 días" },
  { id: "month", label: "30 días" },
  { id: "all", label: "Todo" },
];

const sumValues = (obj: any): number =>
  (Object.values(obj || {}) as any[]).reduce((s: number, v: any) => s + (Number(v) || 0), 0);

const calcStock = (p: any): number => {
  const colores = (p.colores as any[]) || [];
  if (colores.length > 0) return colores.reduce((sum, c: any) => sum + sumValues(c.sizes), 0);
  return sumValues(p.sizes);
};

export default function BalanceOverview() {
  const [period, setPeriod] = useState<Period>("month");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [period]);

  const load = async () => {
    setLoading(true);
    try {
      let from: string | null = null;
      const now = new Date();
      if (period === "today") {
        const d = new Date(now); d.setHours(0, 0, 0, 0); from = d.toISOString();
      } else if (period === "week") {
        const d = new Date(now); d.setDate(d.getDate() - 7); from = d.toISOString();
      } else if (period === "month") {
        const d = new Date(now); d.setDate(d.getDate() - 30); from = d.toISOString();
      }

      const salesQ = supabase.from("sales").select("*, sale_items(*)");
      const expQ = supabase.from("expenses").select("*");
      const fiadosQ = supabase.from("fiados").select("amount, status").eq("status", "pendiente");
      const prodQ = supabase.from("products").select("name, sizes, colores");

      if (from) {
        salesQ.gte("sale_date", from);
        expQ.gte("expense_date", from);
      }

      const [{ data: sales }, { data: expenses }, { data: fiados }, { data: products }] = await Promise.all([
        salesQ, expQ, fiadosQ, prodQ,
      ]);

      const revenue = (sales || []).reduce((s, x: any) => s + Number(x.total || 0), 0);
      const cost = (sales || []).reduce((s, x: any) => s + Number(x.total_cost || 0), 0);
      const profit = revenue - cost;
      const expensesTotal = (expenses || []).reduce((s, x: any) => s + Number(x.amount || 0), 0);
      const net = profit - expensesTotal;
      const unitsSold = (sales || []).reduce(
        (s, x: any) => s + (x.sale_items || []).reduce((q: number, i: any) => q + Number(i.quantity || 0), 0), 0
      );
      const pendingFiados = (fiados || []).reduce((s, x: any) => s + Number(x.amount || 0), 0);

      // Top productos
      const productMap = new Map<string, { qty: number; revenue: number }>();
      (sales || []).forEach((s: any) => {
        (s.sale_items || []).forEach((it: any) => {
          const key = it.product_name;
          const cur = productMap.get(key) || { qty: 0, revenue: 0 };
          cur.qty += Number(it.quantity || 0);
          cur.revenue += Number(it.unit_price || 0) * Number(it.quantity || 0);
          productMap.set(key, cur);
        });
      });
      const topProducts = Array.from(productMap.entries())
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      const lowStock = (products || [])
        .map((p: any) => ({ name: p.name, stock: calcStock(p) }))
        .filter((p) => p.stock > 0 && p.stock <= 3)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      setStats({
        revenue, cost, profit, salesCount: sales?.length || 0,
        unitsSold, expenses: expensesTotal, net, pendingFiados, topProducts, lowStock,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 text-xs uppercase tracking-wider border rounded-md transition-colors ${
              period === p.id
                ? "bg-foreground text-background border-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading || !stats ? (
        <div className="text-sm text-muted-foreground">Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card icon={DollarSign} label="Ingresos" value={formatPrice(stats.revenue)} accent="text-emerald-600" />
            <Card icon={TrendingDown} label="Costo mercadería" value={formatPrice(stats.cost)} accent="text-orange-600" />
            <Card icon={Receipt} label="Gastos" value={formatPrice(stats.expenses)} accent="text-rose-600" />
            <Card icon={TrendingUp} label="Ganancia neta" value={formatPrice(stats.net)} accent={stats.net >= 0 ? "text-emerald-600" : "text-rose-600"} />
            <Card icon={ShoppingCart} label="Ventas" value={String(stats.salesCount)} />
            <Card icon={Package} label="Unidades vendidas" value={String(stats.unitsSold)} />
            <Card icon={TrendingUp} label="Ganancia bruta" value={formatPrice(stats.profit)} />
            <Card icon={Wallet} label="Por cobrar (fiados)" value={formatPrice(stats.pendingFiados)} accent="text-amber-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-border rounded-lg p-5 bg-card">
              <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Productos más vendidos
              </h3>
              {stats.topProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin ventas en este período.</p>
              ) : (
                <ul className="space-y-2">
                  {stats.topProducts.map((p) => (
                    <li key={p.name} className="flex justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                      <span className="truncate pr-2">{p.name}</span>
                      <span className="text-muted-foreground whitespace-nowrap">{p.qty}u · {formatPrice(p.revenue)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border border-border rounded-lg p-5 bg-card">
              <h3 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Stock crítico
              </h3>
              {stats.lowStock.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin productos con stock bajo.</p>
              ) : (
                <ul className="space-y-2">
                  {stats.lowStock.map((p) => (
                    <li key={p.name} className="flex justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                      <span className="truncate pr-2">{p.name}</span>
                      <span className="text-amber-600 font-medium">{p.stock}u</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Card({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: string }) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={`font-display text-xl font-semibold ${accent || "text-foreground"}`}>{value}</div>
    </div>
  );
}
