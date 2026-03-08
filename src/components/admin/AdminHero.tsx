import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSetting, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, Loader2 } from "lucide-react";

interface HeroData {
  image: string;
  tagline: string;
  title_line1: string;
  title_line2: string;
  subtitle: string;
  button_text: string;
}

const DEFAULT: HeroData = {
  image: "/banner-aura.jpg", tagline: "Descubrí tu esencia",
  title_line1: "TU AURA", title_line2: "FEMENINA",
  subtitle: "Prendas pensadas para resaltar tu belleza natural y potenciar tu confianza.",
  button_text: "VER COLECCIÓN",
};

export default function AdminHero() {
  const { data, isLoading } = useSiteSetting<HeroData>("hero");
  const update = useUpdateSiteSetting();
  const { toast } = useToast();
  const [form, setForm] = useState<HeroData>(DEFAULT);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (data) setForm(data); }, [data]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileName = `hero-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('product-images').upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, image: urlData.publicUrl }));
      toast({ title: "Imagen subida" });
    } catch {
      toast({ title: "Error al subir", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSave = () => {
    update.mutate({ key: "hero", value: form }, {
      onSuccess: () => toast({ title: "Portada actualizada" }),
      onError: () => toast({ title: "Error al guardar", variant: "destructive" }),
    });
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>;

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl font-semibold mb-6">Portada / Hero</h2>

      <div className="space-y-6">
        {/* Preview */}
        <div className="aspect-video rounded-md overflow-hidden bg-secondary relative">
          <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-end p-6">
            <div className="text-white">
              <p className="text-[10px] tracking-widest uppercase font-bold text-accent">{form.tagline}</p>
              <h3 className="text-2xl font-display">{form.title_line1} <span className="italic">{form.title_line2}</span></h3>
              <p className="text-xs mt-1 opacity-80">{form.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Upload */}
        <div>
          <label className="text-sm font-medium mb-2 block">Imagen de portada</label>
          <div className="flex gap-2">
            <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="URL de la imagen" className="flex-1" />
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="hero-upload" />
              <label htmlFor="hero-upload">
                <Button type="button" variant="outline" asChild className="cursor-pointer">
                  <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                </Button>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Tagline (texto superior)</label>
          <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Título línea 1</label>
            <Input value={form.title_line1} onChange={(e) => setForm({ ...form, title_line1: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Título línea 2 (cursiva)</label>
            <Input value={form.title_line2} onChange={(e) => setForm({ ...form, title_line2: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Subtítulo</label>
          <Textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} rows={2} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Texto del botón</label>
          <Input value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} />
        </div>

        <Button onClick={handleSave} disabled={update.isPending} className="bg-foreground text-background hover:bg-foreground/90 gap-2">
          <Save className="h-4 w-4" /> {update.isPending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}
