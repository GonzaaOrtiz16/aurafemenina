import { useSearchParams } from "react-router-dom";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "34", "36", "38", "40", "42", "44"];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("categoria") || "";
  const searchTerm = searchParams.get("search")?.toLowerCase() || "";

  const [activeSize, setActiveSize] = useState("");
  const [activeColor, setActiveColor] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);

  const { data: products = [], isLoading } = useProducts(activeCategory || undefined);
  const { data: categories = [] } = useCategories();

  // Derive price range from products
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 100000 };
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  // Extract unique colors from all products
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, string>(); // nombre -> hex
    products.forEach((p) => {
      const colores = (p.colores || []) as Array<{ nombre?: string; hex?: string }>;
      colores.forEach((c) => {
        if (c.nombre && c.hex && !colorMap.has(c.nombre)) {
          colorMap.set(c.nombre, c.hex);
        }
      });
    });
    return Array.from(colorMap.entries()).map(([nombre, hex]) => ({ nombre, hex }));
  }, [products]);

  // Filtering
  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm)
      : true;

    const matchesSize = activeSize
      ? product.sizes?.some((s: string) => s.toUpperCase() === activeSize.toUpperCase())
      : true;

    const matchesPrice = product.price <= maxPrice;

    const matchesColor = activeColor
      ? ((product.colores || []) as Array<{ nombre?: string }>).some(
          (c) => c.nombre?.toLowerCase() === activeColor.toLowerCase()
        )
      : true;

    return matchesSearch && matchesSize && matchesPrice && matchesColor;
  });

  const handleCategory = (slug: string) => {
    if (slug === activeCategory) {
      setSearchParams({});
    } else {
      const newParams: Record<string, string> = { categoria: slug };
      if (searchTerm) newParams.search = searchTerm;
      setSearchParams(newParams);
    }
  };

  const clearFilters = () => {
    setActiveSize("");
    setMaxPrice(priceRange.max);
    setSearchParams({});
  };

  const hasActiveFilters = activeSize || maxPrice < priceRange.max || activeCategory || searchTerm;

  // Sidebar filter panel (shared between mobile & desktop)
  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Categorías
        </h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setSearchParams({})}
            className={`text-left px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors rounded-sm ${
              !activeCategory
                ? "bg-foreground text-background font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategory(cat.slug)}
              className={`text-left px-3 py-2 font-body text-[11px] uppercase tracking-wider transition-colors rounded-sm ${
                activeCategory === cat.slug
                  ? "bg-foreground text-background font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Talle
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setActiveSize(activeSize === size ? "" : size)}
              className={`aspect-square flex items-center justify-center border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 rounded-sm ${
                activeSize === size
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Precio máximo
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-muted-foreground">$</span>
          <Input
            type="number"
            value={maxPrice === priceRange.max ? "" : maxPrice}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                setMaxPrice(priceRange.max);
              } else {
                setMaxPrice(Math.max(0, Number(val)));
              }
            }}
            placeholder={priceRange.max.toLocaleString("es-AR")}
            className="font-body text-sm h-10"
          />
        </div>
        {maxPrice < priceRange.max && (
          <p className="font-body text-xs text-muted-foreground mt-2">
            Hasta <span className="font-bold text-foreground">${maxPrice.toLocaleString("es-AR")}</span>
          </p>
        )}
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-wider text-accent hover:underline"
        >
          <X className="w-3 h-3" /> Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container py-8">
        {/* Title */}
        <h1 className="font-display text-2xl md:text-4xl font-semibold text-center mb-4 tracking-wide uppercase">
          {searchTerm
            ? `Resultados para: "${searchTerm}"`
            : activeCategory
            ? categories.find((c) => c.slug === activeCategory)?.name
            : "Todos los productos"}
        </h1>
        <div className="w-12 h-[1px] bg-accent/40 mx-auto mb-10"></div>

        {/* Active filter badges (mobile) */}
        {(activeSize || maxPrice < priceRange.max) && (
          <div className="flex flex-wrap justify-center gap-2 mb-6 md:hidden">
            {activeSize && (
              <span className="text-[10px] bg-secondary px-3 py-1 rounded-full border border-border uppercase font-bold">
                Talle: {activeSize}
              </span>
            )}
            {maxPrice < priceRange.max && (
              <span className="text-[10px] bg-secondary px-3 py-1 rounded-full border border-border uppercase font-bold">
                Hasta ${maxPrice.toLocaleString("es-AR")}
              </span>
            )}
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-56 shrink-0 sticky top-32 self-start">
            <FilterPanel />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Mobile: horizontal category pills */}
            <div className="flex flex-wrap gap-2 mb-6 md:hidden">
              <button
                onClick={() => setSearchParams({})}
                className={`px-4 py-2 rounded-sm font-body text-[10px] uppercase tracking-wider border transition-colors ${
                  !activeCategory
                    ? "bg-foreground text-background border-foreground"
                    : "border-border hover:bg-secondary"
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategory(cat.slug)}
                  className={`px-4 py-2 rounded-sm font-body text-[10px] uppercase tracking-wider border transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

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
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold uppercase underline"
                >
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
