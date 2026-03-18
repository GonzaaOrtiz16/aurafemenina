import { useSearchParams } from "react-router-dom";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import FilterPanel from "@/components/store/filters/FilterPanel";
import { useProducts, useCategories, useSubcategories } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Camera } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Product } from "@/types/product";

const GEMINI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini-processor`;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("categoria") || "";
  const activeSubcategory = searchParams.get("subcategoria") || "";
  const searchTerm = searchParams.get("search")?.toLowerCase() || "";

  const [activeSize, setActiveSize] = useState("");
  const [activeColor, setActiveColor] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResultIds, setAiResultIds] = useState<string[] | null>(null);
  const [visualSearching, setVisualSearching] = useState(false);

  const { data: products = [], isLoading } = useProducts(activeCategory || undefined);
  const { data: categories = [] } = useCategories();
  const { data: subcategories = [] } = useSubcategories();

  // Smart search with AI
  const doAiSearch = useCallback(async (query: string) => {
    if (!query || query.length < 4) { setAiResultIds(null); return; }
    setAiSearching(true);
    try {
      const resp = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ action: "smart-search", payload: { query } }),
      });
      const data = await resp.json();
      setAiResultIds(data.ids || []);
    } catch { setAiResultIds(null); }
    setAiSearching(false);
  }, []);

  useEffect(() => {
    if (!searchTerm) { setAiResultIds(null); return; }
    const timer = setTimeout(() => doAiSearch(searchTerm), 800);
    return () => clearTimeout(timer);
  }, [searchTerm, doAiSearch]);

  // Visual search
  useEffect(() => {
    const isVisual = searchParams.get("visual");
    if (!isVisual) return;
    const imageBase64 = sessionStorage.getItem("visual-search-image");
    if (!imageBase64) return;
    sessionStorage.removeItem("visual-search-image");
    setVisualSearching(true);
    fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      body: JSON.stringify({ action: "visual-search", payload: { imageBase64 } }),
    })
      .then((r) => r.json())
      .then((data) => setAiResultIds(data.ids || []))
      .catch(() => setAiResultIds(null))
      .finally(() => setVisualSearching(false));
  }, [searchParams]);

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>();
    products.forEach((p) => {
      const colores = (p.colores || []) as Array<{ nombre?: string; hex?: string }>;
      colores.forEach((c) => {
        if (c.nombre && c.hex && !colorMap.has(c.nombre)) colorMap.set(c.nombre, c.hex);
      });
    });
    return Array.from(colorMap.entries()).map(([nombre, hex]) => ({ nombre, hex }));
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = searchTerm ? product.name.toLowerCase().includes(searchTerm) : true;
      const matchesSize = activeSize ? product.sizes?.some((s: string) => s.toUpperCase() === activeSize.toUpperCase()) : true;
      const matchesPrice = product.price <= maxPrice;
      const matchesColor = activeColor ? ((product.colores || []) as Array<{ nombre?: string }>).some((c) => c.nombre?.toLowerCase() === activeColor.toLowerCase()) : true;
      const matchesSubcategory = activeSubcategory ? product.subcategorySlug === activeSubcategory : true;
      return matchesSearch && matchesSize && matchesPrice && matchesColor && matchesSubcategory;
    });

    if (aiResultIds && aiResultIds.length > 0 && searchTerm) {
      const idSet = new Set(aiResultIds);
      const aiMatches = aiResultIds.map((id) => result.find((p) => p.id === id)).filter(Boolean) as Product[];
      const rest = result.filter((p) => !idSet.has(p.id));
      result = [...aiMatches, ...rest];
    }

    return result;
  }, [products, searchTerm, activeSize, maxPrice, activeColor, aiResultIds, activeSubcategory]);

  const handleCategory = useCallback((slug: string) => {
    const newParams: Record<string, string> = {};
    if (slug && slug !== activeCategory) newParams.categoria = slug;
    if (searchTerm) newParams.search = searchTerm;
    setSearchParams(newParams);
  }, [activeCategory, searchTerm, setSearchParams]);

  const handleSubcategory = useCallback((slug: string) => {
    const newParams: Record<string, string> = {};
    if (activeCategory) newParams.categoria = activeCategory;
    if (slug) newParams.subcategoria = slug;
    if (searchTerm) newParams.search = searchTerm;
    setSearchParams(newParams);
  }, [activeCategory, searchTerm, setSearchParams]);

  const clearFilters = useCallback(() => {
    setActiveSize("");
    setActiveColor("");
    setMaxPrice(priceRange.max);
    setSearchParams({});
  }, [priceRange.max, setSearchParams]);

  const hasActiveFilters = !!(activeSize || activeColor || maxPrice < priceRange.max || activeCategory || activeSubcategory || searchTerm);

  // Enrich categories with id for subcategory filtering
  const categoriesWithId = categories.map(c => ({ id: c.id, slug: c.slug, name: c.name }));

  return (
    <Layout>
      <div className="container py-10 md:py-16 px-6 md:px-12">
        <h1 className="font-display text-2xl md:text-4xl font-semibold text-center mb-2 tracking-wide uppercase">
          {searchTerm
            ? `Resultados para: "${searchTerm}"`
            : activeSubcategory
            ? subcategories.find(s => s.slug === activeSubcategory)?.name
            : activeCategory
            ? categories.find((c) => c.slug === activeCategory)?.name
            : "Todos los productos"}
        </h1>
        {aiSearching && searchTerm && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Buscando con inteligencia artificial...</span>
          </div>
        )}
        {visualSearching && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <Camera className="h-3.5 w-3.5 text-accent animate-pulse" />
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Analizando imagen...</span>
          </div>
        )}
        {aiResultIds && aiResultIds.length > 0 && !aiSearching && !visualSearching && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Resultados mejorados con IA</span>
          </div>
        )}
        <div className="w-16 h-[1px] bg-accent/30 mx-auto mb-12" />

        {/* Active filter badges (mobile) */}
        {(activeSize || activeColor || maxPrice < priceRange.max || activeSubcategory) && (
          <div className="flex flex-wrap justify-center gap-2 mb-6 md:hidden">
            {activeSubcategory && (
              <span className="text-[10px] bg-secondary px-3 py-1 rounded-full border border-border uppercase font-bold">
                {subcategories.find(s => s.slug === activeSubcategory)?.name}
              </span>
            )}
            {activeSize && (
              <span className="text-[10px] bg-secondary px-3 py-1 rounded-full border border-border uppercase font-bold">
                Talle: {activeSize}
              </span>
            )}
            {activeColor && (
              <span className="text-[10px] bg-secondary px-3 py-1 rounded-full border border-border uppercase font-bold capitalize">
                Color: {activeColor}
              </span>
            )}
            {maxPrice < priceRange.max && (
              <span className="text-[10px] bg-secondary px-3 py-1 rounded-full border border-border uppercase font-bold">
                Hasta ${maxPrice.toLocaleString("es-AR")}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-10">
          <aside className="hidden md:block w-56 shrink-0 sticky top-32 self-start">
            <FilterPanel
              categories={categoriesWithId}
              subcategories={subcategories}
              activeCategory={activeCategory}
              activeSubcategory={activeSubcategory}
              activeSize={activeSize}
              activeColor={activeColor}
              maxPrice={maxPrice}
              priceRange={priceRange}
              availableColors={availableColors}
              hasActiveFilters={hasActiveFilters}
              onCategoryChange={handleCategory}
              onSubcategoryChange={handleSubcategory}
              onSizeChange={setActiveSize}
              onColorChange={setActiveColor}
              onMaxPriceChange={setMaxPrice}
              onClearFilters={clearFilters}
            />
          </aside>

          <div className="flex-1">
            {/* Mobile: horizontal category pills */}
            <div className="flex flex-wrap gap-2 mb-6 md:hidden">
              <button
                onClick={() => setSearchParams({})}
                className={`px-4 py-2 rounded-sm font-body text-[10px] uppercase tracking-wider border transition-colors ${
                  !activeCategory ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategory(cat.slug)}
                  className={`px-4 py-2 rounded-sm font-body text-[10px] uppercase tracking-wider border transition-colors ${
                    activeCategory === cat.slug ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Mobile: subcategory pills when category selected */}
            {activeCategory && (() => {
              const activeCat = categories.find(c => c.slug === activeCategory);
              const subs = activeCat ? subcategories.filter(s => s.category_id === activeCat.id) : [];
              if (subs.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-2 mb-6 md:hidden">
                  <button onClick={() => handleSubcategory("")}
                    className={`px-3 py-1.5 rounded-sm font-body text-[9px] uppercase tracking-wider border transition-colors ${!activeSubcategory ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}>
                    Todas
                  </button>
                  {subs.map((sub) => (
                    <button key={sub.slug} onClick={() => handleSubcategory(sub.slug)}
                      className={`px-3 py-1.5 rounded-sm font-body text-[9px] uppercase tracking-wider border transition-colors ${activeSubcategory === sub.slug ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary"}`}>
                      {sub.name}
                    </button>
                  ))}
                </div>
              );
            })()}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[3/4] rounded-sm" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                : filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>

            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-body mb-4">
                  No encontramos productos que coincidan con tu búsqueda.
                </p>
                <button onClick={clearFilters} className="text-xs font-bold uppercase underline">
                  Ver toda la colección
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
