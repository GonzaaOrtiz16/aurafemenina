import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/store/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Clock, MessageCircle, X } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";

interface EncargueCategory {
  id: string;
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
  estimated_days: string | null;
  category_id: string | null;
}

function useEncargueCategories() {
  return useQuery({
    queryKey: ["encargue_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("encargue_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as EncargueCategory[];
    },
  });
}

function useCustomProducts() {
  return useQuery({
    queryKey: ["custom_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CustomProduct[];
    },
  });
}

interface ContactData {
  whatsapp: string;
}

export default function Encargues() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categoria") || "";
  const searchTerm = searchParams.get("search")?.toLowerCase() || "";

  const [maxPrice, setMaxPrice] = useState(999999);

  const { data: products = [], isLoading } = useCustomProducts();
  const { data: categories = [] } = useEncargueCategories();
  const { data: contact } = useSiteSetting<ContactData>("contact");
  const whatsapp = contact?.whatsapp || "5491134944228";

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 999999 };
    const prices = products.map((p) => p.price_estimate);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm
      ? product.name.toLowerCase().includes(searchTerm)
      : true;
    const matchesCategory = activeCategory
      ? categories.find((c) => c.slug === activeCategory)?.id === product.category_id
      : true;
    const matchesPrice = product.price_estimate <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleCategory = (slug: string) => {
    if (slug === activeCategory) {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: slug });
    }
  };

  const clearFilters = () => {
    setMaxPrice(priceRange.max);
    setSearchParams({});
  };

  const hasActiveFilters = activeCategory || searchTerm || maxPrice < priceRange.max;

  const buildWhatsAppUrl = (product: CustomProduct) => {
    const msg = encodeURIComponent(
      `¡Hola! Me interesa encargar: *${product.name}*\nPrecio estimado: $${product.price_estimate.toLocaleString("es-AR")}\n\n¿Podrían darme más info sobre disponibilidad y tiempos?`
    );
    return `https://wa.me/${whatsapp}?text=${msg}`;
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Buscar
        </h3>
        <Input
          type="text"
          value={searchParams.get("search") || ""}
          onChange={(e) => {
            const val = e.target.value;
            const newParams: Record<string, string> = {};
            if (activeCategory) newParams.categoria = activeCategory;
            if (val) newParams.search = val;
            setSearchParams(newParams);
          }}
          placeholder="Buscar encargues..."
          className="font-body text-sm h-10"
        />
      </div>

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

      {/* Price Range */}
      <div>
        <h3 className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Precio máximo
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm text-muted-foreground">$</span>
          <Input
            type="number"
            value={maxPrice >= priceRange.max ? "" : maxPrice}
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
            ? categories.find((c) => c.slug === activeCategory)?.name || "Encargues"
            : "Pedidos por Encargue"}
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto text-center leading-relaxed mb-2">
          Estas prendas no están en stock. Hacé tu pedido y coordinamos la fecha de entrega por WhatsApp.
        </p>
        <div className="w-12 h-[1px] bg-accent/40 mx-auto mb-10" />

        {/* Active filter badges (mobile) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap justify-center gap-2 mb-6 md:hidden">
            {activeCategory && (
              <span className="text-[10px] bg-secondary px-3 py-1 rounded-full border border-border uppercase font-bold">
                {categories.find((c) => c.slug === activeCategory)?.name}
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
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-[3/4] rounded-sm" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))
                : filteredProducts.map((product) => (
                    <div key={product.id} className="group animate-fade-in">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary mb-3">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            Sin imagen
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-sm">
                          Por encargue
                        </span>
                      </div>
                      <h3 className="font-body text-sm font-medium leading-tight">{product.name}</h3>
                      {product.description && (
                        <p className="text-muted-foreground text-xs leading-relaxed mt-1 line-clamp-2">{product.description}</p>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-body text-sm font-semibold">
                          ${product.price_estimate.toLocaleString("es-AR")}
                          <span className="text-[10px] text-muted-foreground font-normal ml-1">est.</span>
                        </span>
                        {product.estimated_days && (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="w-3 h-3" />{product.estimated_days}
                          </span>
                        )}
                      </div>
                      <a
                        href={buildWhatsAppUrl(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full mt-3 py-3 bg-foreground text-background font-body text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors rounded-sm"
                      >
                        <MessageCircle className="w-4 h-4" /> Consultar
                      </a>
                    </div>
                  ))}
            </div>

            {!isLoading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground font-body text-sm mb-4">
                  No encontramos encargues que coincidan con tu búsqueda.
                </p>
                <button onClick={clearFilters} className="text-xs font-bold uppercase underline">
                  Ver todos los encargues
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
