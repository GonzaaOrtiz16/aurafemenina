import { useState, useEffect } from "react";
import { useSiteSetting, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Trash2 } from "lucide-react";

interface ContactData {
  whatsapp: string;
  email: string;
  instagram: string;
  instagram_url: string;
  location: string;
  hours_weekday: string;
  hours_saturday: string;
}

interface AnnouncementData {
  text: string;
  enabled: boolean;
}

interface Step {
  title: string;
  description: string;
}

export default function AdminConfig() {
  const { data: contactData, isLoading: l1 } = useSiteSetting<ContactData>("contact");
  const { data: annData, isLoading: l2 } = useSiteSetting<AnnouncementData>("announcement");
  const { data: stepsData, isLoading: l3 } = useSiteSetting<Step[]>("how_to_buy");
  const update = useUpdateSiteSetting();
  const { toast } = useToast();

  const [contact, setContact] = useState<ContactData>({
    whatsapp: "", email: "", instagram: "", instagram_url: "", location: "", hours_weekday: "", hours_saturday: "",
  });
  const [announcement, setAnnouncement] = useState<AnnouncementData>({ text: "", enabled: true });
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => { if (contactData) setContact(contactData); }, [contactData]);
  useEffect(() => { if (annData) setAnnouncement(annData); }, [annData]);
  useEffect(() => { if (stepsData) setSteps(stepsData); }, [stepsData]);

  const saveContact = () => {
    update.mutate({ key: "contact", value: contact }, {
      onSuccess: () => toast({ title: "Contacto actualizado" }),
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  const saveAnnouncement = () => {
    update.mutate({ key: "announcement", value: announcement }, {
      onSuccess: () => toast({ title: "Barra de anuncios actualizada" }),
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  const saveSteps = () => {
    update.mutate({ key: "how_to_buy", value: steps }, {
      onSuccess: () => toast({ title: "Pasos actualizados" }),
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  const addStep = () => setSteps([...steps, { title: "", description: "" }]);
  const removeStep = (idx: number) => setSteps(steps.filter((_, i) => i !== idx));
  const updateStep = (idx: number, field: keyof Step, value: string) => {
    const updated = [...steps];
    updated[idx] = { ...updated[idx], [field]: value };
    setSteps(updated);
  };

  if (l1 || l2 || l3) return <p className="text-sm text-muted-foreground">Cargando...</p>;

  return (
    <div className="max-w-2xl space-y-10">
      {/* Announcement Bar */}
      <div>
        <h2 className="font-display text-2xl font-semibold mb-6">Barra de Anuncios</h2>
        <div className="space-y-4 border border-border rounded-md p-4 bg-card">
          <div className="flex items-center gap-3">
            <Switch checked={announcement.enabled} onCheckedChange={(v) => setAnnouncement({ ...announcement, enabled: v })} />
            <label className="text-sm">{announcement.enabled ? "Visible" : "Oculta"}</label>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Texto del anuncio</label>
            <Input value={announcement.text} onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })} />
          </div>
          <Button onClick={saveAnnouncement} disabled={update.isPending} className="bg-foreground text-background hover:bg-foreground/90 gap-2">
            <Save className="h-4 w-4" /> Guardar
          </Button>
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <h2 className="font-display text-2xl font-semibold mb-6">Información de Contacto</h2>
        <div className="space-y-4 border border-border rounded-md p-4 bg-card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">WhatsApp (con código país)</label>
              <Input value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} placeholder="5491134944228" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Instagram @</label>
              <Input value={contact.instagram} onChange={(e) => setContact({ ...contact, instagram: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Link de Instagram</label>
              <Input value={contact.instagram_url} onChange={(e) => setContact({ ...contact, instagram_url: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Ubicación</label>
            <Input value={contact.location} onChange={(e) => setContact({ ...contact, location: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Horario semana</label>
              <Input value={contact.hours_weekday} onChange={(e) => setContact({ ...contact, hours_weekday: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Horario sábado</label>
              <Input value={contact.hours_saturday} onChange={(e) => setContact({ ...contact, hours_saturday: e.target.value })} />
            </div>
          </div>
          <Button onClick={saveContact} disabled={update.isPending} className="bg-foreground text-background hover:bg-foreground/90 gap-2">
            <Save className="h-4 w-4" /> Guardar
          </Button>
        </div>
      </div>

      {/* How to Buy Steps */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">Pasos "¿Cómo comprar?"</h2>
          <Button onClick={addStep} variant="outline" className="gap-2"><Plus className="h-4 w-4" /> Agregar</Button>
        </div>
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={idx} className="border border-border rounded-md p-4 bg-card space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input placeholder="Título (ej: 1. Elegí tus productos)" value={step.title} onChange={(e) => updateStep(idx, "title", e.target.value)} className="font-medium" />
                  <Textarea placeholder="Descripción" value={step.description} onChange={(e) => updateStep(idx, "description", e.target.value)} rows={2} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeStep(idx)} className="text-destructive flex-shrink-0"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={saveSteps} disabled={update.isPending} className="mt-4 bg-foreground text-background hover:bg-foreground/90 gap-2">
          <Save className="h-4 w-4" /> Guardar pasos
        </Button>
      </div>
    </div>
  );
}
