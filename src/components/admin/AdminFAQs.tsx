import { useState, useEffect } from "react";
import { useSiteSetting, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

export default function AdminFAQs() {
  const { data, isLoading } = useSiteSetting<FAQ[]>("faqs");
  const update = useUpdateSiteSetting();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => { if (data) setFaqs(data); }, [data]);

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (idx: number) => setFaqs(faqs.filter((_, i) => i !== idx));
  const updateFaq = (idx: number, field: keyof FAQ, value: string) => {
    const updated = [...faqs];
    updated[idx] = { ...updated[idx], [field]: value };
    setFaqs(updated);
  };

  const handleSave = () => {
    update.mutate({ key: "faqs", value: faqs }, {
      onSuccess: () => toast({ title: "Preguntas frecuentes actualizadas" }),
      onError: () => toast({ title: "Error al guardar", variant: "destructive" }),
    });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold">Preguntas Frecuentes</h2>
        <Button onClick={addFaq} variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Agregar</Button>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-border rounded-md p-4 space-y-3 bg-card">
            <div className="flex items-start gap-2">
              <GripVertical className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Input placeholder="Pregunta" value={faq.question} onChange={(e) => updateFaq(idx, "question", e.target.value)} className="font-medium" />
                <Textarea placeholder="Respuesta" value={faq.answer} onChange={(e) => updateFaq(idx, "answer", e.target.value)} rows={3} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeFaq(idx)} className="text-destructive flex-shrink-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={update.isPending} className="mt-6 bg-foreground text-background hover:bg-foreground/90 gap-2">
        <Save className="h-4 w-4" /> {update.isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </div>
  );
}
