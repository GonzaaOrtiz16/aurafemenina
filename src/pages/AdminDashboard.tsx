import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/shipping";
import { Plus, Pencil, Trash2, LogOut, X, Save, Palette, Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  sizes: Record<string, number>;
  images: string[];
  colores?: { nombre: string; hex: string }[];
  featured: boolean;
}

interface DbCategory {
  id: string;
  name: string;
  slug: string;
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42", "44"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DbProduct | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    category_id: "",
    featured: false,
    images: [""],
    colores: [] as { nombre: string; hex: string }[],
    sizes: {} as Record<string, number>,
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin/login"); return; }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
    if (!roles || roles.length === 0) { navigate("/admin/login"); }
  };

  const fetchData = async () => {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("*").order("name"),
    ]);
    setProducts((prods as DbProduct[]) || []);
    setCategories((cats as DbCategory[]) || []);
    setLoading(false);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", price: "", category_id: "", featured: false, images: [""], colores: [], sizes: {} });
    setDialogOpen(true);
  };

  const openEdit = (p: DbProduct) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      price: String(p.price),
      category_id: p.category_id || "",
      featured: p.featured,
      images: p.images && p.images.length > 0 ? p.images : [""],
      colores: p.colores || [],
      sizes: p.sizes || {},
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const slug = form.slug || generateSlug(form.name);
    const payload = {
      name: form.name,
      slug,
      description: form.description || null,
      price: Number(form.price),
      category_id: form.category_id || null,
      featured: form.featured,
      images: form.images.filter(img => img.trim() !== ""),
      colores: form.colores,
      sizes: form.sizes,
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

  const addImageField = () => setForm({ ...form, images: [...form.images, ""] });
  
  const removeImageField = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    setForm({ ...form, images: newImages.length > 0 ? newImages : [""] });
  };

  const addColorField = () => setForm({ ...form, colores: [...form.colores, { nombre: "", hex: "#000000" }] });

  const removeColorField = (index: number) => {
    setForm({ ...form, colores: form.colores.filter((_, i) => i !== index) });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Producto eliminado" });
    fetchData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const toggleSize = (size: string) => {
    setForm((prev) => {
      const newSizes = { ...prev.sizes };
      if (size in newSizes) {
        delete newSizes[size];
      } else {
        newSizes[size] = 10;
      }
      return { ...prev, sizes: newSizes };
    });
  };

  const updateStock = (size: string, stock: number) => {
    setForm((prev) => ({
      ...prev,
      sizes: { ...prev.sizes, [size]: stock },
    }));
  };

  const getCategoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name || "-";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <h1 className="font-display text-xl font-semibold tracking-wider">AURA FEMENINA — Admin</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 font-body text-xs">
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        </div>
      </header>

      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold">Productos</h2>
          <Button onClick={openNew} className="gap-2 font-body text-sm">
            <Plus className="h-4 w-4" /> Nuevo producto
          </Button>
        </div>

        {loading ? (
          <p className="font-body text-sm text-muted-foreground">Cargando...</p>
        ) : (
          <div className="border border-border rounded-sm overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="text-left p-3 font-medium">Producto</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Categoría</th>
                  <th className="text-right p-3 font-medium">Precio</th>
                  <th className="text-center p-3 font-medium hidden sm:table-cell">Destacado</th>
                  <th className="text-right p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {p.images && p.images[0] && (
                          <img src={p.images[0]} alt="" className="h-10 w-8 object-cover rounded-sm bg-secondary flex-shrink-0" />
                        )}
                        <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">{getCategoryName(p.category_id)}</td>
                    <td className="p-3 text-right font-semibold">{formatPrice(Number(p.price))}</td>
                    <td className="p-3 text-center hidden sm:table-cell">{p.featured ? "⭐" : "-"}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editing ? "Editar producto" : "Nuevo producto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium">Nombre</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} className="font-body" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm font-medium">Precio</label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="font-body" />
                </div>
                <div>
                  <label className="font-body text-sm font-medium">Categoría</label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger className="font-body"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="font-body">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
                <label className="font-body text-sm">Producto destacado</label>
              </div>
            </div>

            {/* SECCIÓN DE IMÁGENES */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="font-body text-sm font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Imágenes (URLs)
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addImageField}>+ Añadir</Button>
              </div>
              {form.images.map((img, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input 
                    value={img} 
                    onChange={(e) => {
                      const newImgs = [...form.images];
                      newImgs[idx] = e.target.value;
                      setForm({ ...form, images: newImgs });
                    }} 
                    placeholder="https://..." 
                    className="font-body flex-1" 
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeImageField(idx)} className="text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* SECCIÓN DE COLORES */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="font-body text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Variantes de Color
                </label>
                <Button type="button" variant="outline" size="sm" onClick={addColorField}>+ Añadir</Button>
              </div>
              {form.colores.map((color, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-secondary/30 p-2 rounded-sm">
                  <Input 
                    placeholder="Nombre (Blanco)" 
                    value={color.nombre}
                    onChange={(e) => {
                      const newCols = [...form.colores];
                      newCols[idx].nombre = e.target.value;
                      setForm({ ...form, colores: newCols });
                    }}
                    className="h-8 text-xs"
                  />
                  <Input 
                    type="color" 
                    value={color.hex}
                    onChange={(e) => {
                      const newCols = [...form.colores];
                      newCols[idx].hex = e.target.value;
                      setForm({ ...form, colores: newCols });
                    }}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeColorField(idx)} className="h-8 w-8 text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div>
              <label className="font-body text-sm font-medium mb-2 block">Talles y stock</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`px-3 py-1 rounded-sm border text-xs font-body transition-colors ${
                      s in form.sizes ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {Object.keys(form.sizes).length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(form.sizes).map(([size, stock]) => (
                    <div key={size} className="flex items-center gap-2">
                      <span className="font-body text-xs font-medium w-8">{size}</span>
                      <Input
                        type="number"
                        min={0}
                        value={stock}
                        onChange={(e) => updateStock(size, Number(e.target.value))}
                        className="font-body h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleSave} className="w-full gap-2 font-body bg-black hover:bg-black/90 text-white">
              <Save className="h-4 w-4" /> {editing ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
