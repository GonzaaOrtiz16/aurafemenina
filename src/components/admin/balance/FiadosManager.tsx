import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check, Trash2, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Fiado {
  id: string; customer_name: string; customer_phone: string | null;
  description: string; amount: number; sale_date: string; due_date: string | null;
  status: string; paid_at: string | null;
}

export default function FiadosManager() {
  const { toast } = useToast();
  const [fiados, setFiados] = useState<Fiado[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("fiados").select("*").order("status").order("sale_date", { ascending: false });
    setFiados((data as any) || []);
    setLoading(false);
  };

  const save = async () => {
    if (!customerName || !description || amount <= 0) {
      toast({ title: "Completá todos los campos requeridos", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("fiados").insert({
      customer_name: customerName,
      customer_phone: customerPhone || null,
      description, amount,
      due_date: dueDate || null,
      notes: notes || null,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Fiado registrado" });
    setOpen(false);
    setCustomerName(""); setCustomerPhone(""); setDescription(""); setAmount(0); setDueDate(""); setNotes("");
    load();
  };

  const markPaid = async (id: string) => {
    const { error } = await supabase.from("fiados").update({ status: "pagado", paid_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Marcado como pagado" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este fiado?")) return;
    const { error } = await supabase.from("fiados").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const remind = (f: Fiado) => {
    if (!f.customer_phone) {
      toast({ title: "No hay teléfono cargado", variant: "destructive" });
      return;
    }
    const phone = f.customer_phone.replace(/\D/g, "");
    const msg = encodeURIComponent(`Hola ${f.customer_name}! Te recuerdo el saldo pendiente por ${f.description}: ${formatPrice(f.amount)}. ¡Gracias! 💕`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const pending = fiados.filter((f) => f.status === "pendiente");
  const totalPending = pending.reduce((s, f) => s + Number(f.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-display text-lg font-semibold">Fiados (cuentas por cobrar)</h3>
          <p className="text-xs text-muted-foreground">
            Pendiente: <span className="text-amber-600 font-medium">{formatPrice(totalPending)}</span> · {pending.length} cliente{pending.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Nuevo fiado</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Registrar fiado</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Cliente *</Label><Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} /></div>
                <div><Label>Teléfono</Label><Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="11 1234 5678" /></div>
              </div>
              <div><Label>Descripción *</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Vestido negro talle M" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Monto ($) *</Label><Input type="number" min={0} value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} /></div>
                <div><Label>Vencimiento</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
              </div>
              <div><Label>Notas</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
              <Button onClick={save} className="w-full">Guardar fiado</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Descripción</th>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Vence</th>
              <th className="text-right p-3">Monto</th>
              <th className="w-32"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Cargando...</td></tr>
            ) : fiados.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Sin fiados registrados</td></tr>
            ) : fiados.map((f) => (
              <tr key={f.id} className="border-t border-border">
                <td className="p-3">
                  <span className={`text-xs uppercase tracking-wider px-2 py-1 rounded ${f.status === "pendiente" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {f.status}
                  </span>
                </td>
                <td className="p-3">{f.customer_name}</td>
                <td className="p-3">{f.description}</td>
                <td className="p-3 whitespace-nowrap text-xs">{new Date(f.sale_date).toLocaleDateString("es-AR")}</td>
                <td className="p-3 whitespace-nowrap text-xs">{f.due_date ? new Date(f.due_date).toLocaleDateString("es-AR") : "—"}</td>
                <td className="p-3 text-right font-medium">{formatPrice(f.amount)}</td>
                <td className="p-3 flex justify-end gap-1">
                  {f.status === "pendiente" && (
                    <>
                      {f.customer_phone && <Button variant="ghost" size="icon" title="Recordar por WhatsApp" onClick={() => remind(f)}><MessageCircle className="h-4 w-4 text-emerald-600" /></Button>}
                      <Button variant="ghost" size="icon" title="Marcar pagado" onClick={() => markPaid(f.id)}><Check className="h-4 w-4 text-emerald-600" /></Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => remove(f.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
