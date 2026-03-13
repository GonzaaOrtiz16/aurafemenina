import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/shipping";
import { Plus, Pencil, Trash2, X, Save, Palette, Image as ImageIcon, Loader2, Upload, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const GEMINI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-processor`;

interface ColorVariant {
  nombre: string;
  hex: string;
  sizes: Record<string, number>;
}

interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  sizes: Record<string, number>;
  images: string[];
  colores?: ColorVariant[];
  featured: boolean;
}

interface DbCategory {
  id: string;
  name: string;
  slug: string;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44"];

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DbProduct | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: "", original_price: "",
    category_id: "", featured: false, images: [] as string[],
    colores: [] as ColorVariant[],
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setProducts((prods as unknown as DbProduct[]) || []);
    setCategories((cats as DbCategory[]) || []);
    setLoading(false);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", price: "", original_price: "", category_id: "", featured: false, images: [], colores: [] });
    setDialogOpen(true);
  };

  const openEdit = (p: DbProduct) => {
    setEditing(p);
    // Migrate old format: if colores don't have sizes, merge from product.sizes
    const migratedColores = (p.colores || []).map((c: any) => ({
      nombre: c.nombre || "",
      hex: c.hex || "#000000",
      sizes: c.sizes && Object.keys(c.sizes).length > 0 ? c.sizes : { ...p.sizes },
    }));
    setForm({
      name: p.name, slug: p.slug, description: p.description || "",
      price: String(p.price), original_price: p.original_price ? String(p.original_price) : "",
      category_id: p.category_id || "", featured: p.featured,
      images: p.images || [], colores: migratedColores,
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
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        setForm((prev) => ({ ...prev, images: [...prev.images, urlData.publicUrl] }));
      } catch (error: any) {
        toast({ title: "Error", description: `No se pudo subir ${file.name}`, variant: "destructive" });
      }
    }
    setUploading(false);
    toast({ title: "Imágenes subidas" });
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const handleGenerateDescription = async () => {
    if (!form.name.trim()) {
      toast({ title: "Escribí el nombre del producto primero", variant: "destructive" });
      return;
    }
    setGeneratingDesc(true);
    try {
      const catName = categories.find(c => c.id === form.category_id)?.name || "";
      const resp = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "generate-description", payload: { productName: form.name, category: catName } }),
      });
      const data = await resp.json();
      if (data.description) {
        setForm(prev => ({ ...prev, description: data.description }));
        toast({ title: "Descripción generada ✨" });
      }
    } catch {
      toast({ title: "Error generando descripción", variant: "destructive" });
    }
    setGeneratingDesc(false);
  };

  const handleGenerateSeo = async () => {
    if (!form.name.trim()) return;
    setGeneratingSeo(true);
    try {
      const catName = categories.find(c => c.id === form.category_id)?.name || "";
      const resp = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "generate-seo", payload: { productName: form.name, description: form.description, category: catName } }),
      });
      const data = await resp.json();
      if (data.metaTitle || data.metaDescription) {
        toast({ title: "SEO generado ✨", description: `Título: ${data.metaTitle || "-"}\nDesc: ${data.metaDescription || "-"}` });
      }
    } catch {
      toast({ title: "Error generando SEO", variant: "destructive" });
    }
    setGeneratingSeo(false);
  };

  const handleSave = async () => {
    const slug = form.slug || generateSlug(form.name);
    // Build aggregated sizes from all color variants
    const aggregatedSizes: Record<string, number> = {};
    form.colores.forEach((c) => {
      Object.entries(c.sizes).forEach(([size, stock]) => {
        aggregatedSizes[size] = (aggregatedSizes[size] || 0) + stock;
      });
    });

    const payload: any = {
      name: form.name, slug, description: form.description || null,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      category_id: form.category_id || null, featured: form.featured,
      images: form.images, colores: form.colores, sizes: aggregatedSizes,
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Producto actualizado" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Producto creado" });
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Producto eliminado" });
    fetchData();
  };

  // Color variant management
  const addColor = () => setForm({ ...form, colores: [...form.colores, { nombre: "", hex: "#000000", sizes: {} }] });
  const removeColor = (idx: number) => setForm({ ...form, colores: form.colores.filter((_, i) => i !== idx) });
  const updateColorField = (idx: number, field: "nombre" | "hex", value: string) => {
    const c = [...form.colores];
    c[idx] = { ...c[idx], [field]: value };
    setForm({ ...form, colores: c });
  };
  const toggleSizeForColor = (colorIdx: number, size: string) => {
    const c = [...form.colores];
    const newSizes = { ...c[colorIdx].sizes };
    if (size in newSizes) delete newSizes[size]; else newSizes[size] = 1;
    c[colorIdx] = { ...c[colorIdx], sizes: newSizes };
    setForm({ ...form, colores: c });
  };
  const updateStockForColor = (colorIdx: number, size: string, stock: number) => {
    const c = [...form.colores];
    c[colorIdx] = { ...c[colorIdx], sizes: { ...c[colorIdx].sizes, [size]: stock } };
    setForm({ ...form, colores: c });
  };

  const getCategoryName = (id: string | null) => categories.find((c) => c.id === id)?.name || "-";
  const getTotalStock = (p: DbProduct) => {
    if (p.colores && p.colores.length > 0) {
      return p.colores.reduce((sum, c: any) => {
        if (!c.sizes) return sum;
        return sum + Object.values(c.sizes as Record<string, number>).reduce((a, b) => a + b, 0);
      }, 0);
    }
    return p.sizes ? Object.values(p.sizes).reduce((a, b) => a + b, 0) : 0;
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    const slug = generateSlug(newCatName);
    const { error } = await supabase.from("categories").insert({ name: newCatName.trim(), slug });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Categoría creada" });
    setNewCatName("");
    setCatDialogOpen(false);
    fetchData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Categoría eliminada" });
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-semibold">Productos</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCatDialogOpen(true)}>Categorías</Button>
          <Button onClick={openNew} className="gap-2 bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <div className="border border-border rounded-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary">
                <th className="text-left p-3 font-medium">Producto</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Categoría</th>
                <th className="text-right p-3 font-medium hidden md:table-cell">Stock</th>
                <th className="text-right p-3 font-medium">Precio</th>
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
                          {p.featured && <span className="text-[10px] text-accent font-bold">★ Destacado</span>}
                          {(p.colores || []).map((c: any, i: number) => (
                            <div key={i} className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: c.hex }} title={c.nombre} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">{getCategoryName(p.category_id)}</td>
                  <td className="p-3 text-right hidden md:table-cell text-muted-foreground">{getTotalStock(p)} u.</td>
                  <td className="p-3 text-right">
                    <div>
                      <span className="font-semibold">{formatPrice(Number(p.price))}</span>
                      {p.original_price && (
                        <span className="block text-xs text-muted-foreground line-through">{formatPrice(Number(p.original_price))}</span>
                      )}
                    </div>
                  </td>
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

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto w-[95vw] rounded-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-center">
              {editing ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-4">
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
                  <label className="text-sm font-medium mb-1 block">Precio actual</label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Precio original (oferta)</label>
                  <Input type="number" placeholder="Dejá vacío si no hay oferta" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
                  <p className="text-[10px] text-muted-foreground mt-1">Si ponés un precio original, se muestra tachado como oferta</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Categoría</label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 bg-secondary/20 p-3 rounded-md">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <label className="text-sm">Producto destacado (aparece en inicio)</label>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Galería de Fotos</label>
                <div className="relative">
                  <input type="file" accept="image/*" multiple onChange={handleUploadFile} className="hidden" id="product-upload" disabled={uploading} />
                  <label htmlFor="product-upload">
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
              <p className="text-[10px] text-muted-foreground -mt-2">Cada color tiene sus propios talles y stock. Al elegir un color en la tienda, solo se muestran los talles disponibles para ese color.</p>

              {form.colores.length === 0 && (
                <div className="py-4 border-2 border-dashed border-border rounded-md text-center text-xs text-muted-foreground">
                  Agregá al menos un color con sus talles y stock.
                </div>
              )}

              {form.colores.map((color, cIdx) => (
                <div key={cIdx} className="border border-border rounded-md p-4 bg-card space-y-3">
                  {/* Color header */}
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Nombre del color (ej: Rojo)"
                      value={color.nombre}
                      onChange={(e) => updateColorField(cIdx, "nombre", e.target.value)}
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      type="color"
                      value={color.hex}
                      onChange={(e) => updateColorField(cIdx, "hex", e.target.value)}
                      className="w-12 h-8 p-1 cursor-pointer border-none bg-transparent"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeColor(cIdx)} className="h-8 w-8 text-destructive flex-shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Size toggles for this color */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Talles para {color.nombre || "este color"}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SIZES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSizeForColor(cIdx, s)}
                          className={`px-2.5 py-1 rounded-md border text-[10px] font-bold transition-all ${
                            s in color.sizes
                              ? "bg-foreground text-background border-foreground"
                              : "border-border hover:bg-secondary text-muted-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stock per size for this color */}
                  {Object.keys(color.sizes).length > 0 && (
                    <div className="grid grid-cols-3 gap-2 bg-secondary/30 p-2 rounded-md">
                      {Object.entries(color.sizes).map(([size, stock]) => (
                        <div key={size} className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold uppercase text-muted-foreground">{size}</span>
                          <Input
                            type="number"
                            min={0}
                            value={stock}
                            onChange={(e) => updateStockForColor(cIdx, size, Number(e.target.value))}
                            className="h-7 text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={uploading} className="w-full bg-foreground text-background hover:bg-foreground/90 py-6 text-lg rounded-md">
              {uploading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              {editing ? "Guardar Cambios" : "Publicar Producto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="max-w-sm w-[95vw]">
          <DialogHeader><DialogTitle className="font-display text-xl">Categorías</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="flex gap-2">
              <Input placeholder="Nueva categoría" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
              <Button onClick={handleAddCategory} className="bg-foreground text-background"><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-1">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-md">
                  <span className="text-sm">{c.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(c.id)} className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
