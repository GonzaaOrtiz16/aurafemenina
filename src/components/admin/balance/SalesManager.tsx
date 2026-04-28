import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Search, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ColorVariant { nombre: string; hex?: string; sizes?: Record<string, number>; }
interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  sizes: Record<string, number> | null;
  colores: ColorVariant[] | null;
}
interface SaleItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  list_price: number;   // precio de lista (siempre)
  unit_price: number;   // precio aplicado (con o sin 10% efectivo)
  unit_cost: number;
  size: string | null;
  color: string | null;
}
interface Sale {
  id: string;
  sale_date: string;
  customer_name: string | null;
  payment_method: string;
  total: number;
  total_cost: number;
  sale_items: { product_name: string; quantity: number; size: string | null; color: string | null }[];
}

export default function SalesManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  // Recalcular precios al cambiar método de pago (efectivo = 10% off sobre precio de lista)
  useEffect(() => {
    setItems((prev) => prev.map((it) => ({
      ...it,
      unit_price: it.list_price > 0
        ? (paymentMethod === "efectivo" ? Math.round(it.list_price * 0.9) : Math.round(it.list_price))
        : it.unit_price,
    })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from("sales").select("id, sale_date, customer_name, payment_method, total, total_cost, sale_items(product_name, quantity, size, color)").order("sale_date", { ascending: false }).limit(100),
      supabase.from("products").select("id, name, price, cost, sizes, colores").order("name"),
    ]);
    setSales((s as any) || []);
    setProducts((p as any) || []);
    setLoading(false);
  };

  const resetForm = () => {
    setCustomerName(""); setCustomerPhone(""); setPaymentMethod("efectivo");
    setDiscount(0); setNotes(""); setItems([]); setSearch("");
  };

  const applyMethodPrice = (listPrice: number, method: string) =>
    method === "efectivo" ? Math.round(listPrice * 0.9) : Math.round(listPrice);

  const addProduct = (p: Product) => {
    const list = Number(p.price);
    setItems((prev) => [
      ...prev,
      {
        product_id: p.id,
        product_name: p.name,
        quantity: 1,
        list_price: list,
        unit_price: applyMethodPrice(list, paymentMethod),
        unit_cost: Number(p.cost || 0),
        size: null,
        color: null,
      },
    ]);
    setSearch("");
  };

  const addManualItem = () => {
    setItems((prev) => [...prev, { product_id: null, product_name: "", quantity: 1, list_price: 0, unit_price: 0, unit_cost: 0, size: null, color: null }]);
  };

  const updateItem = (idx: number, patch: Partial<SaleItem>) => {
    setItems((prev) => prev.map((i, n) => n === idx ? { ...i, ...patch } : i));
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, n) => n !== idx));
  };

  // Helpers para variantes del producto en el item
  const getProduct = (id: string | null) => products.find((p) => p.id === id);

  const getColorsForItem = (it: SaleItem): ColorVariant[] => {
    const p = getProduct(it.product_id);
    if (!p) return [];
    return (p.colores || []).filter((c) => c && c.nombre);
  };

  const getSizesForItem = (it: SaleItem): { size: string; stock: number }[] => {
    const p = getProduct(it.product_id);
    if (!p) return [];
    const colores = p.colores || [];
    const hasVariants = colores.length > 0 && colores.some((c) => c.sizes && Object.keys(c.sizes).length > 0);
    if (hasVariants) {
      if (it.color) {
        const c = colores.find((c) => c.nombre === it.color);
        const sizes = c?.sizes || {};
        return Object.entries(sizes).map(([size, stock]) => ({ size, stock: Number(stock) }));
      }
      // sin color elegido → unificar talles sumando stock
      const acc: Record<string, number> = {};
      colores.forEach((c) => {
        Object.entries(c.sizes || {}).forEach(([s, st]) => {
          acc[s] = (acc[s] || 0) + Number(st);
        });
      });
      return Object.entries(acc).map(([size, stock]) => ({ size, stock }));
    }
    const sizes = p.sizes || {};
    return Object.entries(sizes).map(([size, stock]) => ({ size, stock: Number(stock) }));
  };

  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const totalCost = items.reduce((s, i) => s + i.unit_cost * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  const profit = total - totalCost;

  const save = async () => {
    if (items.length === 0) {
      toast({ title: "Agregá al menos un producto", variant: "destructive" });
      return;
    }

    // Validación: color y talle obligatorios cuando el producto los tiene
    for (const it of items) {
      if (!it.product_id) continue; // items manuales no requieren
      const colors = getColorsForItem(it);
      const sizes = getSizesForItem(it);
      if (colors.length > 0 && !it.color) {
        toast({ title: "Color requerido", description: `Elegí un color para "${it.product_name}"`, variant: "destructive" });
        return;
      }
      if (sizes.length > 0 && !it.size) {
        toast({ title: "Talle requerido", description: `Elegí un talle para "${it.product_name}"`, variant: "destructive" });
        return;
      }
    }

    const { data: sale, error } = await supabase.from("sales").insert({
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      payment_method: paymentMethod,
      subtotal, discount, total, total_cost: totalCost,
      notes: notes || null,
      channel: "manual",
    }).select().single();

    if (error || !sale) {
      toast({ title: "Error al guardar", description: error?.message, variant: "destructive" });
      return;
    }

    const itemsPayload = items.map((i) => ({
      sale_id: sale.id,
      product_id: i.product_id,
      product_name: i.product_name,
      quantity: i.quantity,
      unit_price: i.unit_price,
      unit_cost: i.unit_cost,
      size: i.size,
      color: i.color,
    }));
    const { error: e2 } = await supabase.from("sale_items").insert(itemsPayload);
    if (e2) {
      toast({ title: "Error al guardar items", description: e2.message, variant: "destructive" });
      return;
    }

    // Descontar stock de productos vinculados
    const stockErrors: string[] = [];
    for (const it of items) {
      if (!it.product_id || !it.size) continue;
      const p = getProduct(it.product_id);
      if (!p) continue;

      const colores = (p.colores || []).map((c) => ({ ...c, sizes: { ...(c.sizes || {}) } }));
      const hasVariants = colores.length > 0 && colores.some((c) => c.sizes && Object.keys(c.sizes).length > 0);

      if (hasVariants) {
        if (!it.color) {
          stockErrors.push(`${p.name}: falta color para descontar stock`);
          continue;
        }
        const c = colores.find((c) => c.nombre === it.color);
        if (!c || !c.sizes || c.sizes[it.size] == null) {
          stockErrors.push(`${p.name}: ${it.color}/${it.size} no existe`);
          continue;
        }
        c.sizes[it.size] = Math.max(0, Number(c.sizes[it.size]) - it.quantity);
        const { error: upErr } = await supabase.from("products").update({ colores: colores as any }).eq("id", p.id);
        if (upErr) stockErrors.push(`${p.name}: ${upErr.message}`);
      } else {
        const sizes = { ...(p.sizes || {}) };
        if (sizes[it.size] == null) {
          stockErrors.push(`${p.name}: talle ${it.size} no existe`);
          continue;
        }
        sizes[it.size] = Math.max(0, Number(sizes[it.size]) - it.quantity);
        const { error: upErr } = await supabase.from("products").update({ sizes: sizes as any }).eq("id", p.id);
        if (upErr) stockErrors.push(`${p.name}: ${upErr.message}`);
      }
    }

    if (stockErrors.length > 0) {
      toast({
        title: "Venta registrada con avisos de stock",
        description: stockErrors.join(" · "),
        variant: "destructive",
      });
    } else {
      toast({ title: "Venta registrada", description: `Total: ${formatPrice(total)} · Ganancia: ${formatPrice(profit)}` });
    }

    // Invalidar cache para que la página pública refresque stock
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    await queryClient.invalidateQueries({ queryKey: ["product"] });

    setOpen(false);
    resetForm();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta venta? (no repone el stock)")) return;
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Venta eliminada" });
    load();
  };

  const filteredProducts = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-display text-lg font-semibold">Ventas registradas</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nueva venta</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Registrar venta manual</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cliente</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nombre (opcional)" /></div>
                <div><Label>Teléfono</Label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Opcional" /></div>
              </div>

              <div>
                <Label>Buscar producto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Escribí para buscar..." className="pl-9" />
                </div>
                {filteredProducts.length > 0 && (
                  <div className="mt-1 border border-border rounded-md bg-popover divide-y divide-border max-h-60 overflow-y-auto">
                    {filteredProducts.map((p) => (
                      <button key={p.id} onClick={() => addProduct(p)} className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex justify-between">
                        <span>{p.name}</span>
                        <span className="text-muted-foreground">{formatPrice(Number(p.price))}</span>
                      </button>
                    ))}
                  </div>
                )}
                <Button variant="link" size="sm" onClick={addManualItem} className="px-0 text-xs">+ Agregar item manual</Button>
              </div>

              {items.length > 0 && (
                <div className="border border-border rounded-md divide-y divide-border">
                  {items.map((it, idx) => {
                    const colors = getColorsForItem(it);
                    const sizes = getSizesForItem(it);
                    const hasColors = colors.length > 0;
                    const hasSizes = sizes.length > 0;
                    return (
                      <div key={idx} className="p-3 space-y-2">
                        <div className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-12 md:col-span-5">
                            <Label className="text-xs">Producto</Label>
                            <Input value={it.product_name} onChange={(e) => updateItem(idx, { product_name: e.target.value })} />
                          </div>
                          <div className="col-span-3 md:col-span-2">
                            <Label className="text-xs">Cant.</Label>
                            <Input type="number" min={1} value={it.quantity} onChange={(e) => updateItem(idx, { quantity: parseInt(e.target.value) || 1 })} />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <Label className="text-xs">Precio</Label>
                            <Input type="number" min={0} value={it.unit_price} onChange={(e) => updateItem(idx, { unit_price: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <div className="col-span-4 md:col-span-2">
                            <Label className="text-xs">Costo</Label>
                            <Input type="number" min={0} value={it.unit_cost} onChange={(e) => updateItem(idx, { unit_cost: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <div className="col-span-1 md:col-span-1 flex justify-end">
                            <Button size="icon" variant="ghost" onClick={() => removeItem(idx)}><X className="h-4 w-4" /></Button>
                          </div>
                        </div>

                        {(hasColors || hasSizes) && (
                          <div className="grid grid-cols-12 gap-2">
                            {hasColors && (
                              <div className="col-span-6">
                                <Label className="text-xs">Color</Label>
                                <Select
                                  value={it.color || ""}
                                  onValueChange={(v) => updateItem(idx, { color: v, size: null })}
                                >
                                  <SelectTrigger><SelectValue placeholder="Elegí color" /></SelectTrigger>
                                  <SelectContent>
                                    {colors.map((c) => (
                                      <SelectItem key={c.nombre} value={c.nombre}>{c.nombre}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {hasSizes && (
                              <div className={hasColors ? "col-span-6" : "col-span-12"}>
                                <Label className="text-xs">Talle (descuenta stock)</Label>
                                <Select
                                  value={it.size || ""}
                                  onValueChange={(v) => updateItem(idx, { size: v })}
                                >
                                  <SelectTrigger><SelectValue placeholder="Elegí talle" /></SelectTrigger>
                                  <SelectContent>
                                    {sizes.map((s) => (
                                      <SelectItem key={s.size} value={s.size} disabled={s.stock <= 0}>
                                        {s.size} {s.stock <= 0 ? "(sin stock)" : `· stock ${s.stock}`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground text-right">
                          {formatPrice(it.unit_price * it.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Método de pago</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descuento ($)</Label>
                  <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              <div><Label>Notas</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>

              <div className="bg-muted rounded-md p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Descuento</span><span>-{formatPrice(discount)}</span></div>
                <div className="flex justify-between font-semibold border-t border-border pt-1"><span>Total</span><span>{formatPrice(total)}</span></div>
                <div className="flex justify-between text-emerald-600"><span>Ganancia estimada</span><span>{formatPrice(profit)}</span></div>
              </div>

              <Button onClick={save} className="w-full">Guardar venta y descontar stock</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Items</th>
              <th className="text-left p-3">Pago</th>
              <th className="text-right p-3">Total</th>
              <th className="text-right p-3">Ganancia</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Cargando...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Sin ventas registradas</td></tr>
            ) : sales.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="p-3 whitespace-nowrap">{new Date(s.sale_date).toLocaleDateString("es-AR")}</td>
                <td className="p-3">{s.customer_name || "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">
                  {(s.sale_items || []).map((i) => {
                    const variant = [i.color, i.size].filter(Boolean).join("/");
                    return `${i.quantity}× ${i.product_name}${variant ? ` (${variant})` : ""}`;
                  }).join(", ")}
                </td>
                <td className="p-3 capitalize text-xs">{s.payment_method}</td>
                <td className="p-3 text-right font-medium">{formatPrice(s.total)}</td>
                <td className="p-3 text-right text-emerald-600">{formatPrice(s.total - s.total_cost)}</td>
                <td className="p-3"><Button variant="ghost" size="icon" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
