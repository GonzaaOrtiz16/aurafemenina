import { useEffect, useState } from "react";
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

interface Product { id: string; name: string; price: number; cost: number; }
interface SaleItem { product_id: string | null; product_name: string; quantity: number; unit_price: number; unit_cost: number; }
interface Sale {
  id: string;
  sale_date: string;
  customer_name: string | null;
  payment_method: string;
  total: number;
  total_cost: number;
  sale_items: { product_name: string; quantity: number }[];
}

export default function SalesManager() {
  const { toast } = useToast();
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

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from("sales").select("id, sale_date, customer_name, payment_method, total, total_cost, sale_items(product_name, quantity)").order("sale_date", { ascending: false }).limit(100),
      supabase.from("products").select("id, name, price, cost").order("name"),
    ]);
    setSales((s as any) || []);
    setProducts((p as any) || []);
    setLoading(false);
  };

  const resetForm = () => {
    setCustomerName(""); setCustomerPhone(""); setPaymentMethod("efectivo");
    setDiscount(0); setNotes(""); setItems([]); setSearch("");
  };

  const addProduct = (p: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === p.id);
      if (existing) return prev.map((i) => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product_id: p.id, product_name: p.name, quantity: 1, unit_price: Number(p.price), unit_cost: Number(p.cost || 0) }];
    });
    setSearch("");
  };

  const addManualItem = () => {
    setItems((prev) => [...prev, { product_id: null, product_name: "", quantity: 1, unit_price: 0, unit_cost: 0 }]);
  };

  const updateItem = (idx: number, patch: Partial<SaleItem>) => {
    setItems((prev) => prev.map((i, n) => n === idx ? { ...i, ...patch } : i));
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, n) => n !== idx));
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

    const itemsPayload = items.map((i) => ({ ...i, sale_id: sale.id }));
    const { error: e2 } = await supabase.from("sale_items").insert(itemsPayload);
    if (e2) {
      toast({ title: "Error al guardar items", description: e2.message, variant: "destructive" });
      return;
    }

    toast({ title: "Venta registrada", description: `Total: ${formatPrice(total)} · Ganancia: ${formatPrice(profit)}` });
    setOpen(false);
    resetForm();
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta venta?")) return;
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  {items.map((it, idx) => (
                    <div key={idx} className="p-3 grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-12 md:col-span-4">
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
                      <div className="col-span-1 md:col-span-2 flex gap-2 items-center justify-end">
                        <span className="text-xs text-muted-foreground hidden md:block">{formatPrice(it.unit_price * it.quantity)}</span>
                        <Button size="icon" variant="ghost" onClick={() => removeItem(idx)}><X className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
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

              <Button onClick={save} className="w-full">Guardar venta</Button>
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
                <td className="p-3 text-xs text-muted-foreground">{(s.sale_items || []).map((i) => `${i.quantity}× ${i.product_name}`).join(", ")}</td>
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
