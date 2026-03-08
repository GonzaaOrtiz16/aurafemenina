import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Save, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CustomProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  price_estimate: number;
  estimated_days: string | null;
}

export default function AdminEncargues() {
  const { toast } = useToast();
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomProduct | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", price_estimate: "", estimated_days: "7-15 días", images: [] as string[],
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("custom_products").select("*").order("created_at", { ascending: false });
    setProducts((data as CustomProduct[]) || []);
    setLoading(false);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", price_estimate: "", estimated_days: "7-15 días", images: [] });
    setDialogOpen(true);
  };

  const openEdit = (p: CustomProduct) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description || "",
      price_estimate: String(p.price_estimate), estimated_days: p.estimated_days || "7-15 días",
      images: p.images || [],
    });
    setDialogOpen(true);
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `encargue-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const { error } = await supabase.storage.from('product-images').upload(fileName, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        setForm((prev) => ({ ...prev, images: [...prev.images, urlData.publicUrl] }));
      } catch {
        toast({ title: "Error al subir imagen", variant: "destructive" });
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = (idx: number) => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });

  const handleSave = async () => {
    const slug = form.slug || generateSlug(form.name);
    const payload = {
      name: form.name, slug, description: form.description || null,
      price_estimate: Number(form.price_estimate), estimated_days: form.estimated_days || null,
      images: form.images,
    };

    if (editing) {
      const { error } = await supabase.from("custom_products").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Encargue actualizado" });
    } else {
      const { error } = await supabase.from("custom_products").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Encargue creado" });
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este encargue?")) return;
    const { error } = await supabase.from("custom_products").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Encargue eliminado" });
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold">Productos por Encargue</h2>
        <Button onClick={openNew} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4" /> Nuevo encargue
        </Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Cargando...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border border-border rounded-sm overflow-hidden bg-card">
              <div className="aspect-[3/4] bg-secondary">
                {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sin imagen</div>}
              </div>
              <div className="p-3 space-y-2">
                <h3 className="font-medium text-sm truncate">{p.name}</h3>
                <p className="text-xs text-muted-foreground">${p.price_estimate.toLocaleString("es-AR")} est. · {p.estimated_days}</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => openEdit(p)}><Pencil className="h-3 w-3 mr-1" />Editar</Button>
                  <Button variant="outline" size="sm" className="text-destructive text-xs" onClick={() => handleDelete(p.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">{editing ? "Editar encargue" : "Nuevo encargue"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Descripción</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Precio estimado</label>
                <Input type="number" value={form.price_estimate} onChange={(e) => setForm({ ...form, price_estimate: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Días estimados</label>
                <Input value={form.estimated_days} onChange={(e) => setForm({ ...form, estimated_days: e.target.value })} placeholder="ej: 7-15 días" />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Fotos</label>
                <div className="relative">
                  <input type="file" accept="image/*" multiple onChange={handleUploadFile} className="hidden" id="encargue-upload" disabled={uploading} />
                  <label htmlFor="encargue-upload">
                    <Button type="button" variant="outline" size="sm" asChild className="cursor-pointer">
                      <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}{uploading ? "Subiendo..." : "Subir Fotos"}</span>
                    </Button>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-[3/4] border rounded-md overflow-hidden bg-secondary group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={uploading} className="w-full bg-foreground text-background hover:bg-foreground/90 py-6 text-lg">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              {editing ? "Guardar" : "Publicar Encargue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
