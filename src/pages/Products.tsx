import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/store/Layout";
import ProductCard from "@/components/store/ProductCard";
import { products, categories } from "@/data/products";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("categoria") || "";

  const filtered = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.categorySlug === activeCategory);
  }, [activeCategory]);

  const handleCategory = (slug: string) => {
    if (slug === activeCategory) {
      setSearchParams({});
    } else {
      setSearchParams({ categoria: slug });
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-center mb-8 tracking-wide">
          {activeCategory
            ? categories.find((c) => c.slug === activeCategory)?.name || "Productos"
            : "Todos los productos"}
        </h1>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 rounded-sm font-body text-xs uppercase tracking-wider border transition-colors ${
              !activeCategory
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-secondary"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategory(cat.slug)}
              className={`px-4 py-2 rounded-sm font-body text-xs uppercase tracking-wider border transition-colors ${
                activeCategory === cat.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground font-body py-12">
            No hay productos en esta categoría.
          </p>
        )}
      </div>
    </Layout>
  );
}
