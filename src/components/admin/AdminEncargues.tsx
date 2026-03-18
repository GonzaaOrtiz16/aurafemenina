import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Save, Loader2, Upload, Image as ImageIcon, Tag, Palette, Sparkles, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const GEMINI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-processor`;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44"];

interface ColorVariant {
  nombre: string;
  hex: string;
  sizes: Record<string, number>;
}

interface EncargueCategory {
  id: string;
  name: string;
  slug: string;
}

interface EncargueSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
}

interface CustomProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  price_estimate: number;
  original_price: number | null;
  estimated_days: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  colores?: ColorVariant[];
  sizes: Record<string, number>;
  featured: boolean;
}

export default function AdminEncargues() {
  const { toast } = useToast();
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [categories, setCategories] = useState<EncargueCategory[]>([]);
  const [subcategories, setSubcategories] = useState<EncargueSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CustomProduct | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", description: "", price_estimate: "", original_price: "",
    estimated_days: "7-15 días", images: [] as string[], category_id: "", subcategory_id: "",
    colores: [] as ColorVariant[], featured: false,
  });

  const [catForm, setCatForm] = useState({ name: "", slug: "" });
  const [editingCat, setEditingCat] = useState<EncargueCategory | null>(null);
  const [newSubcatName, setNewSubcatName] = useState("");
  const [subcatParentId, setSubcatParentId] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [prodRes, catRes, subRes] = await Promise.all([
      supabase.from("custom_products").select("*").order("created_at", { ascending: false }),
      supabase.from("encargue_categories").select("*").order("name"),
      supabase.from("encargue_subcategories").select("*").order("name"),
    ]);
    setProducts((prodRes.data as unknown as CustomProduct[]) || []);
    setCategories((catRes.data as EncargueCategory[]) || []);
    setSubcategories((subRes.data as EncargueSubcategory[]) || []);
    setLoading(false);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // ── Product CRUD ──
  const openNew = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", price_estimate: "", original_price: "", estimated_days: "7-15 días", images: [], category_id: "", subcategory_id: "", colores: [], featured: false });
    setDialogOpen(true);
  };

  const openEdit = (p: CustomProduct) => {
    setEditing(p);
    const migratedColores = (p.colores || []).map((c: any) => ({
      nombre: c.nombre || "", hex: c.hex || "#000000",
      sizes: c.sizes && Object.keys(c.sizes).length > 0 ? c.sizes : {},
    }));
    setForm({
      name: p.name, slug: p.slug, description: p.description || "",
      price_estimate: String(p.price_estimate), original_price: p.original_price ? String(p.original_price) : "",
      estimated_days: p.estimated_days || "7-15 días",
      images: p.images || [], category_id: p.category_id || "", subcategory_id: p.subcategory_id || "",
      colores: migratedColores, featured: p.featured,
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

  const handleGenerateDescription = async () => {
    if (!form.name.trim()) { toast({ title: "Escribí el nombre primero", variant: "destructive" }); return; }
    setGeneratingDesc(true);
    try {
      const catName = categories.find(c => c.id === form.category_id)?.name || "";
      const subName = subcategories.find(s => s.id === form.subcategory_id)?.name || "";
      const resp = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ action: "generate-description", payload: { productName: form.name, category: catName, subcategory: subName } }),
      });
      const data = await resp.json();
      if (data.description) { setForm(prev => ({ ...prev, description: data.description })); toast({ title: "Descripción generada ✨" }); }
    } catch { toast({ title: "Error generando descripción", variant: "destructive" }); }
    setGeneratingDesc(false);
  };

  const handleSave = async () => {
    const slug = form.slug || generateSlug(form.name);
    const aggregatedSizes: Record<string, number> = {};
    form.colores.forEach((c) => {
      Object.entries(c.sizes).forEach(([size, stock]) => {
        aggregatedSizes[size] = (aggregatedSizes[size] || 0) + stock;
      });
    });

    const payload: any = {
      name: form.name, slug, description: form.description || null,
      price_estimate: Number(form.price_estimate),
      original_price: form.original_price ? Number(form.original_price) : null,
      estimated_days: form.estimated_days || null,
      images: form.images, category_id: form.category_id || null,
      subcategory_id: form.subcategory_id || null,
      colores: form.colores, sizes: aggregatedSizes, featured: form.featured,
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

  // Color variant management
  const addColor = () => setForm({ ...form, colores: [...form.colores, { nombre: "", hex: "#000000", sizes: {} }] });
  const removeColor = (idx: number) => setForm({ ...form, colores: form.colores.filter((_, i) => i !== idx) });
  const updateColorField = (idx: number, field: "nombre" | "hex", value: string) => {
    const c = [...form.colores]; c[idx] = { ...c[idx], [field]: value }; setForm({ ...form, colores: c });
  };
  const toggleSizeForColor = (colorIdx: number, size: string) => {
    const c = [...form.colores]; const newSizes = { ...c[colorIdx].sizes };
    if (size in newSizes) delete newSizes[size]; else newSizes[size] = 1;
    c[colorIdx] = { ...c[colorIdx], sizes: newSizes }; setForm({ ...form, colores: c });
  };
  const updateStockForColor = (colorIdx: number, size: string, stock: number) => {
    const c = [...form.colores]; c[colorIdx] = { ...c[colorIdx], sizes: { ...c[colorIdx].sizes, [size]: stock } };
    setForm({ ...form, colores: c });
  };

  const filteredSubcategories = subcategories.filter(s => s.category_id === form.category_id);

  // ── Category CRUD ──
  const openNewCat = () => { setEditingCat(null); setCatForm({ name: "", slug: "" }); setCatDialogOpen(true); };
  const openEditCat = (cat: EncargueCategory) => { setEditingCat(cat); setCatForm({ name: cat.name, slug: cat.slug }); setCatDialogOpen(true); };

  const handleSaveCat = async () => {
    const slug = catForm.slug || generateSlug(catForm.name);
    if (editingCat) {
      const { error } = await supabase.from("encargue_categories").update({ name: catForm.name, slug }).eq("id", editingCat.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Categoría actualizada" });
    } else {
      const { error } = await supabase.from("encargue_categories").insert({ name: catForm.name, slug });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Categoría creada" });
    }
    setCatDialogOpen(false); fetchData();
  };

  const handleDeleteCat = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const { error } = await supabase.from("encargue_categories").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Categoría eliminada" }); fetchData();
  };

  const handleAddSubcategory = async () => {
    if (!newSubcatName.trim() || !subcatParentId) return;
    const slug = generateSlug(newSubcatName);
    const { error } = await supabase.from("encargue_subcategories").insert({ name: newSubcatName.trim(), slug, category_id: subcatParentId });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Subcategoría creada" }); setNewSubcatName(""); fetchData();
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("¿Eliminar esta subcategoría?")) return;
    const { error } = await supabase.from("encargue_subcategories").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Subcategoría eliminada" }); fetchData();
  };

  const getCategoryName = (catId: string | null) => categories.find((c) => c.id === catId)?.name || "Sin categoría";
  const getSubcategoryName = (id: string | null) => subcategories.find((s) => s.id === id)?.name || "";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold">Productos por Encargue</h2>
        <div className="flex gap-2">
          <Button onClick={openNewCat} variant="outline" className="gap-2"><Tag className="h-4 w-4" /> Categorías</Button>
          <Button onClick={openNew} className="gap-2 bg-foreground text-background hover:bg-foreground/90"><Plus className="h-4 w-4" /> Nuevo encargue</Button>
        </div>
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => {
            const subs = subcategories.filter(s => s.category_id === cat.id);
            return (
              <div key={cat.id} className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-sm border border-border">
                <span className="text-xs font-medium">{cat.name}</span>
                {subs.length > 0 && <span className="text-[9px] text-muted-foreground">({subs.length} sub)</span>}
                <button onClick={() => openEditCat(cat)} className="text-muted-foreground hover:text-foreground ml-1"><Pencil className="h-3 w-3" /></button>
                <button onClick={() => handleDeleteCat(cat.id)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
              </div>
            );
          })}
        </div>
      )}

      {loading ? <p className="text-sm text-muted-foreground">Cargando...</p> : (
        <div className="border border-border rounded-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left p-3 font-medium">Producto</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Categoría</th>
                <th className="text-right p-3 font-medium">Precio est.</th>
                <th className="text-right p-3 font-medium hidden md:table-cell">Días</th>
                <th className="text-right p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="h-10 w-8 object-cover rounded-sm bg-secondary flex-shrink-0" />}
                      <div>
                        <span className="font-medium truncate max-w-[150px] block">{p.name}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {p.featured && <span className="text-[10px] text-accent font-bold">★</span>}
                          {(p.colores || []).map((c: any, i: number) => (
                            <div key={i} className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: c.hex }} title={c.nombre} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">
                    <span>{getCategoryName(p.category_id)}</span>
                    {p.subcategory_id && <span className="flex items-center gap-0.5 text-[10px]"><ChevronRight className="h-3 w-3" />{getSubcategoryName(p.subcategory_id)}</span>}
                  </td>
                  <td className="p-3 text-right">
                    <span className="font-semibold">${p.price_estimate.toLocaleString("es-AR")}</span>
                    {p.original_price && <span className="block text-xs text-muted-foreground line-through">${Number(p.original_price).toLocaleString("es-AR")}</span>}
                  </td>
                  <td className="p-3 text-right hidden md:table-cell text-muted-foreground text-xs">{p.estimated_days}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Dialog — Full featured like stock products */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] rounded-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">{editing ? "Editar encargue" : "Nuevo encargue"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nombre</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Descripción</label>
                  <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={generatingDesc} className="text-xs gap-1">
                    {generatingDesc ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    Generar con IA
                  </Button>
                </div>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Precio estimado</label>
                  <Input type="number" value={form.price_estimate} onChange={(e) => setForm({ ...form, price_estimate: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Precio original (oferta)</label>
                  <Input type="number" placeholder="Vacío = sin oferta" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Días estimados</label>
                <Input value={form.estimated_days} onChange={(e) => setForm({ ...form, estimated_days: e.target.value })} placeholder="ej: 7-15 días" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Categoría</label>
                <Select value={form.category_id} onValueChange={(val) => setForm({ ...form, category_id: val === "none" ? "" : val, subcategory_id: "" })}>
                  <SelectTrigger><SelectValue placeholder="Sin categoría" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {filteredSubcategories.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Subcategoría</label>
                  <Select value={form.subcategory_id} onValueChange={(v) => setForm({ ...form, subcategory_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Sin subcategoría" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin subcategoría</SelectItem>
                      {filteredSubcategories.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-3 bg-secondary/20 p-3 rounded-md">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <label className="text-sm">Producto destacado</label>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Galería de Fotos</label>
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
                {form.images.length === 0 && !uploading && (
                  <div className="col-span-3 py-6 border-2 border-dashed border-border rounded-md text-center text-xs text-muted-foreground">
                    No hay fotos. Tocá "Subir Fotos" para empezar.
                  </div>
                )}
              </div>
            </div>

            {/* Colors + Sizes + Stock */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2"><Palette className="h-4 w-4" /> Colores, Talles y Stock</label>
                <Button type="button" variant="outline" size="sm" onClick={addColor} className="text-xs gap-1"><Plus className="h-3 w-3" /> Color</Button>
              </div>
              <p className="text-[10px] text-muted-foreground -mt-2">Cada color tiene sus propios talles y disponibilidad.</p>

              {form.colores.length === 0 && (
                <div className="py-4 border-2 border-dashed border-border rounded-md text-center text-xs text-muted-foreground">
                  Agregá colores con sus talles disponibles.
                </div>
              )}

              {form.colores.map((color, cIdx) => (
                <div key={cIdx} className="border border-border rounded-md p-4 bg-card space-y-3">
                  <div className="flex gap-2 items-center">
                    <Input placeholder="Nombre del color" value={color.nombre} onChange={(e) => updateColorField(cIdx, "nombre", e.target.value)} className="h-8 text-xs flex-1" />
                    <Input type="color" value={color.hex} onChange={(e) => updateColorField(cIdx, "hex", e.target.value)} className="w-12 h-8 p-1 cursor-pointer border-none bg-transparent" />
                    <Button variant="ghost" size="icon" onClick={() => removeColor(cIdx)} className="h-8 w-8 text-destructive flex-shrink-0"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Talles para {color.nombre || "este color"}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SIZES.map((s) => (
                        <button key={s} type="button" onClick={() => toggleSizeForColor(cIdx, s)}
                          className={`px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all ${s in color.sizes ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary text-muted-foreground"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {Object.keys(color.sizes).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 bg-secondary/30 p-2 rounded-md">
                      {Object.entries(color.sizes).map(([size, stock]) => (
                        <div key={size} className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold uppercase text-muted-foreground">{size}</span>
                          <Input type="number" min={0} value={stock} onChange={(e) => updateStockForColor(cIdx, size, Number(e.target.value))} className="h-7 text-xs" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={uploading} className="w-full bg-foreground text-background hover:bg-foreground/90 py-6 text-lg rounded-md">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              {editing ? "Guardar" : "Publicar Encargue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Category & Subcategory Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">{editingCat ? "Editar categoría" : "Categorías y Subcategorías"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {editingCat ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Nombre</label>
                  <Input value={catForm.name} onChange={(e) => setCatForm({ name: e.target.value, slug: generateSlug(e.target.value) })} />
                </div>
                <Button onClick={handleSaveCat} className="w-full bg-foreground text-background hover:bg-foreground/90"><Save className="h-4 w-4 mr-2" /> Guardar</Button>
              </>
            ) : (
              <>
                {/* Add category */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Nueva categoría</label>
                  <div className="flex gap-2">
                    <Input value={catForm.name} onChange={(e) => setCatForm({ name: e.target.value, slug: generateSlug(e.target.value) })} placeholder="Ej: Camperas" />
                    <Button onClick={handleSaveCat} className="bg-foreground text-background"><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>

                {/* Add subcategory */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Nueva subcategoría</label>
                  <div className="flex gap-2">
                    <Select value={subcatParentId} onValueChange={setSubcatParentId}>
                      <SelectTrigger className="w-36"><SelectValue placeholder="Categoría" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Ej: Wide Leg" value={newSubcatName} onChange={(e) => setNewSubcatName(e.target.value)} className="flex-1" />
                    <Button onClick={handleAddSubcategory} disabled={!subcatParentId} className="bg-foreground text-background"><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                  {categories.map((cat) => {
                    const subs = subcategories.filter(s => s.category_id === cat.id);
                    return (
                      <div key={cat.id} className="border border-border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{cat.name}</span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditCat(cat)} className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteCat(cat.id)} className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                        {subs.length > 0 && (
                          <div className="mt-2 ml-4 space-y-1">
                            {subs.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between bg-secondary/30 px-2 py-1 rounded-sm">
                                <span className="text-xs flex items-center gap-1"><ChevronRight className="h-3 w-3 text-muted-foreground" />{sub.name}</span>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteSubcategory(sub.id)} className="h-6 w-6 text-destructive"><X className="h-3 w-3" /></Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
