import { useSearchParams } from "react-router-dom";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 1. Capturamos todos los filtros de la URL
  const activeCategory = searchParams.get("categoria") || "";
  const searchTerm = searchParams.get("search")?.toLowerCase() || "";
  const activeSize = searchParams.get("talle") || "";
  const activeColor = searchParams.get("color")?.toLowerCase() || "";

  // Traemos los productos (por categoría si existe)
  const { data: products = [], isLoading } = useProducts(activeCategory || undefined);
  const { data: categories = [] } = useCategories();

  // 2. LÓGICA DE FILTRADO DINÁMICO
  // Filtramos el resultado del hook basándonos en los otros parámetros
  const filteredProducts = products.filter((product) => {
    // Filtro por nombre (Buscador)
    const matchesSearch = searchTerm 
      ? product.name.toLowerCase().includes(searchTerm) 
      : true;

    // Filtro por talle (asegurate que tu modelo de producto tenga 'sizes' o 'talles')
    const matchesSize = activeSize 
      ? product.sizes?.includes(activeSize) || product.talles?.includes(activeSize)
      : true;

    // Filtro por color (asegurate que tu modelo tenga 'colors' o 'colores')
    const matchesColor = activeColor 
      ? product.colors?.some((c: string) => c.toLowerCase() === activeColor) || 
        product.colores?.some((c: string) => c.toLowerCase() === activeColor)
      : true;

    return matchesSearch && matchesSize && matchesColor;
  });

  const handleCategory = (slug: string) => {
    if (slug === activeCategory) {
      setSearchParams({});
    } else {
      // Al cambiar categoría, preservamos la búsqueda si existía
      const newParams: any = { categoria: slug };
      if (searchTerm) newParams.search = searchTerm;
      setSearchParams(newParams);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Título dinámico según búsqueda o categoría */}
        <h1 className="font-display text-2xl md:text-4xl font-semibold text-center mb-4 tracking-wide uppercase">
          {searchTerm ? `Resultados para: ${searchTerm}` : 
           activeCategory ? categories.find((c) => c.slug === activeCategory)?.name : 
           "Todos los productos"}
        </h1>

        {/* Indicador de filtros activos (opcional, muy útil para el usuario) */}
        {(activeSize || activeColor) && (
          <div className="flex justify-center gap-2 mb-6">
            {activeSize && (
              <span className="text-[10px] bg-zinc-100 px-2 py-1 rounded-full border border-zinc-200 uppercase font-bold">
                Talle: {activeSize}
              </span>
            )}
            {activeColor && (
              <span className="text-[10px] bg-zinc-100 px-2 py-1 rounded-full border border-zinc-200 uppercase font-bold">
                Color: {activeColor}
              </span>
            )}
          </div>
        )}

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 rounded-sm font-body text-[10px] uppercase tracking-wider border transition-colors ${
              !activeCategory
                ? "bg-black text-white border-black"
                : "border-zinc-200 hover:bg-zinc-50"
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
                  ? "bg-black text-white border-black"
                  : "border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid - Usamos 'filteredProducts' en lugar de 'products' */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
            <p className="text-zinc-500 font-body mb-4">
              No encontramos productos que coincidan con tu búsqueda.
            </p>
            <button 
              onClick={() => setSearchParams({})}
              className="text-xs font-bold uppercase underline"
            >
              Ver toda la colección
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
