// src/pages/Index.tsx
import Layout from "@/components/store/Layout";
import HeroSection from "@/components/store/HeroSection";
import ProductCard from "@/components/store/ProductCard";
import StoreInfo from "@/components/store/StoreInfo"; 
import { useFeaturedProducts } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  // Obtenemos los productos destacados desde tu base de datos/hook
  const { data: featured = [], isLoading: loadingProducts } = useFeaturedProducts();

  return (
    <Layout>
      {/* Sección de Video o Imagen Principal */}
      <HeroSection />

      {/* Información de la tienda (Envíos, pagos, etc.) */}
      <StoreInfo /> 

      {/* Featured Products */}
      <section className="container py-16 px-4 md:px-8">
        <h2 className="font-display text-2xl md:text-4xl font-light text-center mb-4 tracking-[0.2em] text-zinc-800 uppercase">
          Destacados
        </h2>
        <div className="w-12 h-[1px] bg-pink-300 mx-auto mb-12"></div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {loadingProducts
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] rounded-none bg-zinc-100" />
                  <Skeleton className="h-4 w-3/4 bg-zinc-100" />
                  <Skeleton className="h-4 w-1/2 bg-zinc-100" />
                </div>
              ))
            : featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {/* Botón de Llamada a la Acción (CTA) */}
        <div className="mt-20 text-center">
          <Link
            to="/productos"
            className="group relative inline-block border border-zinc-200 px-12 py-5 font-body text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-800 hover:text-white transition-all duration-700 overflow-hidden"
          >
            <span className="relative z-10">Ver toda la colección</span>
            <div className="absolute inset-0 bg-black translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out"></div>
          </Link>
          
          <p className="mt-6 text-[9px] text-zinc-400 uppercase tracking-widest font-medium italic">
            Nuevos ingresos todas las semanas
          </p>
        </div>
      </section>

      {/* Sección Encargues */}
      <section className="bg-secondary/40 py-16 md:py-24">
        <div className="container px-4 md:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <p className="text-[10px] tracking-[0.5em] font-bold uppercase text-pink-400 mb-3">
              Exclusivo
            </p>
            <h2 className="font-display text-2xl md:text-4xl font-light tracking-[0.15em] text-foreground mb-4">
              Pedidos por{" "}
              <span className="font-serif italic text-pink-400">Encargue</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto md:mx-0 mb-8">
              Prendas exclusivas que no están en stock. Elegí la que más te guste y coordinamos la entrega por WhatsApp.
            </p>
            <Link
              to="/encargues"
              className="group relative inline-block border border-pink-300 px-10 py-4 font-body text-[10px] font-bold uppercase tracking-[0.3em] text-foreground hover:text-white transition-all duration-700 overflow-hidden"
            >
              <span className="relative z-10">Ver encargues</span>
              <div className="absolute inset-0 bg-pink-400 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
            </Link>
          </div>
          <div className="flex-1 aspect-[4/5] max-w-xs bg-muted/50 border border-border/50 flex items-center justify-center">
            <p className="text-muted-foreground/40 text-[10px] uppercase tracking-widest">Próximamente</p>
          </div>
        </div>
      </section>

      <div className="h-10"></div>
    </Layout>
  );
}
