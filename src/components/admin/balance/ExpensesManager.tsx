import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Expense {
  id: string; expense_date: string; category: string; description: string; amount: number; payment_method: string;
}

const CATEGORIES = ["mercadería", "envíos", "packaging", "publicidad", "servicios", "impuestos", "otros"];

export default function ExpensesManager() {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState("mercadería");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [notes, setNotes] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false }).limit(100);
    setExpenses((data as any) || []);
    setLoading(false);
  };

  const save = async () => {
    if (!description || amount <= 0) {
      toast({ title: "Completá descripción y monto", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("expenses").insert({
      category, description, amount, payment_method: paymentMethod, notes: notes || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Gasto registrado" });
    setOpen(false);
    setCategory("mercadería"); setDescription(""); setAmount(0); setPaymentMethod("efectivo"); setNotes("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-display text-lg font-semibold">Gastos</h3>
          <p className="text-xs text-muted-foreground">Total acumulado: <span className="text-foreground font-medium">{formatPrice(total)}</span></p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nuevo gasto</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar gasto</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label>Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Descripción</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Compra de remeras x10" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Monto ($)</Label><Input type="number" min={0} value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} /></div>
                <div>
                  <Label>Método de pago</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Notas</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
              <Button onClick={save} className="w-full">Guardar gasto</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Categoría</th>
              <th className="text-left p-3">Descripción</th>
              <th className="text-left p-3">Pago</th>
              <th className="text-right p-3">Monto</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Cargando...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Sin gastos registrados</td></tr>
            ) : expenses.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="p-3 whitespace-nowrap">{new Date(e.expense_date).toLocaleDateString("es-AR")}</td>
                <td className="p-3 capitalize text-xs">{e.category}</td>
                <td className="p-3">{e.description}</td>
                <td className="p-3 capitalize text-xs">{e.payment_method}</td>
                <td className="p-3 text-right text-rose-600 font-medium">-{formatPrice(e.amount)}</td>
                <td className="p-3"><Button variant="ghost" size="icon" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
