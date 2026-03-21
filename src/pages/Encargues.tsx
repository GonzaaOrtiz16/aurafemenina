import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { X, ChevronRight } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { useCustomProducts, useEncargueCategories, useEncargueSubcategories } from "@/hooks/useCustomProducts";
import CustomProductCard from "@/components/store/CustomProductCard";

interface ContactData { whatsapp: string; }

export default function Encargues() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categoria") || "";
  const activeSubcategory = searchParams.get("subcategoria") || "";
  const searchTerm = searchParams.get("search")?.toLowerCase() || "";

  const [maxPrice, setMaxPrice] = useState(999999);

  const { data: products = [], isLoading } = useCustomProducts();
  const { data: categories = [] } = useEncargueCategories();
  const { data: subcategories = [] } = useEncargueSubcategories();
  const { data: contact } = useSiteSetting<ContactData>("contact");
  const whatsapp = contact?.whatsapp || "5491134944228";

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 999999 };
    const prices = products.map((p) => p.price_estimate);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm ? product.name.toLowerCase().includes(searchTerm) : true;
    const matchesCategory = activeCategory
      ? categories.find((c) => c.slug === activeCategory)?.id === product.category_id
      : true;
    const matchesSubcategory = activeSubcategory
      ? subcategories.find((s) => s.slug === activeSubcategory)?.id === product.subcategory_id
      : true;
    const matchesPrice = product.price_estimate <= maxPrice;
    return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice;
  });

  const handleCategory = (slug: string) => {
    const newParams: Record<string, string> = {};
    if (searchTerm) newParams.search = searchTerm;
    if (slug !== activeCategory) newParams.categoria = slug;
    setSearchParams(newParams);
  };

  const handleSubcategory = (slug: string) => {
    const newParams: Record<string, string> = {};
    if (activeCategory) newParams.categoria = activeCategory;
    if (slug) newParams.subcategoria = slug;
    if (searchTerm) newParams.search = searchTerm;
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setMaxPrice(priceRange.max);
    setSearchParams({});
  };

  const hasActiveFilters = activeCategory || activeSubcategory || searchTerm || maxPrice < priceRange.max;

  const activeCat = categories.find(c => c.slug === activeCategory);
  const filteredSubs = activeCat ? subcategories.filter(s => s.category_id === activeCat.id) : [];

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Buscar</h3>
        <Input
          type="text"
          value={searchParams.get("search") || ""}
          onChange={(e) => {
            const val = e.target.value;
            const newParams: Record<string, string> = {};
            if (activeCategory) newParams.categoria = activeCategory;
            if (activeSubcategory) newParams.subcategoria = activeSubcategory;
            if (val) newParams.search = val;
            setSearchParams(newParams);
          }}
          placeholder="Buscar encargues..."
          className="font-body text-sm h-10"
        />
      </div>

      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Categorías</h3>
        <div className="flex flex-col gap-1">
          <button onClick={() => setSearchParams({})} className={`text-left px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors rounded-sm ${!activeCategory ? "bg-foreground text-background font-bold" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
            Todos
          </button>
          {categories.map((cat) => (
            <button key={cat.slug} onClick={() => handleCategory(cat.slug)} className={`text-left px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors rounded-sm ${activeCategory === cat.slug ? "bg-foreground text-background font-bold" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {filteredSubs.length > 0 && (
        <div>
          <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-1">
            <ChevronRight className="h-3 w-3" /> Subcategorías
          </h3>
          <div className="flex flex-col gap-1">
            <button onClick={() => handleSubcategory("")} className={`text-left px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors rounded-sm ${!activeSubcategory ? "bg-foreground text-background font-bold" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              Todas
            </button>
            {filteredSubs.map((sub) => (
              <button key={sub.slug} onClick={() => handleSubcategory(sub.slug)} className={`text-left px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors rounded-sm ${activeSubcategory === sub.slug ? "bg-foreground text-background font-bold" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Precio máximo</h3>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-muted-foreground">$</span>
          <Input
            type="number"
            value={maxPrice >= priceRange.max ? "" : maxPrice}
            onChange={(e) => {
              const val = e.target.value;
              setMaxPrice(val === "" ? priceRange.max : Math.max(0, Number(val)));
            }}
            placeholder={priceRange.max.toLocaleString("es-AR")}
            className="font-body text-sm h-10"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-wider text-accent hover:underline">
          <X className="w-3 h-3" /> Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-2xl md:text-4xl font-semibold text-center mb-4 tracking-wide uppercase">
          {searchTerm
            ? `Resultados para: "${searchTerm}"`
            : activeSubcategory
            ? subcategories.find(s => s.slug === activeSubcategory)?.name || "Encargues"
            : activeCategory
            ? categories.find((c) => c.slug === activeCategory)?.name || "Encargues"
            : "Pedidos por Encargue"}
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto text-center leading-relaxed mb-2">
          Estas prendas no están en stock. Hacé tu pedido y coordinamos la fecha de entrega por WhatsApp.
        </p>
        <div className="w-12 h-[1px] bg-accent/40 mx-auto mb-10" />

        <div className="flex gap-10">
          <aside className="hidden md:block w-56 shrink-0 sticky top-32 self-start">
            <FilterSidebar />
          </aside>

          <div className="flex-1">
            {/* Listado de Productos */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[3/4] rounded-sm" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                : filteredProducts.map((product) => (
                    <CustomProductCard 
                      key={product.id} 
                      product={product} 
                      whatsappNumber={whatsapp} 
                    />
                  ))}
            </div>

            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-body text-sm mb-4">No encontramos encargues que coincidan con tu búsqueda.</p>
                <button onClick={clearFilters} className="text-xs font-bold uppercase underline">Ver todos los encargues</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
