import Layout from "@/components/store/Layout";
import HeroSection from "@/components/store/HeroSection";
import ProductCard from "@/components/store/ProductCard";
import StoreInfo from "@/components/store/StoreInfo"; // <--- Importamos el nuevo componente
import { useFeaturedProducts } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data: featured = [], isLoading: loadingProducts } = useFeaturedProducts();

  return (
    <Layout>
      <HeroSection />

      {/* Reemplazamos Categorías por StoreInfo */}
      <StoreInfo /> 

      {/* Featured Products */}
      <section className="container py-16">
        <h2 className="font-display text-3xl md:text-4xl font-light text-center mb-12 tracking-[0.2em] text-zinc-800 uppercase">
          Destacados
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {loadingProducts
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] rounded-none" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            to="/productos"
            className="inline-block border border-pink-200 px-10 py-4 font-body text-[10px] font-bold uppercase tracking-[0.3em] text-pink-400 hover:bg-pink-50 transition-all duration-500"
          >
            Ver toda la colección
          </Link>
        </div>
      </section>

      {/* Eliminamos el Promo banner viejo porque la info ya está en StoreInfo */}
    </Layout>
  );
}
