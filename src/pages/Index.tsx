import Layout from "@/components/store/Layout";
import HeroSection from "@/components/store/HeroSection";
import ProductCard from "@/components/store/ProductCard";
import StoreInfo from "@/components/store/StoreInfo";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sparkles } from "lucide-react";

export default function Index() {
  const { data: featured = [], isLoading: loadingProducts } = useFeaturedProducts();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation(0.2);
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1);
  const { ref: encRef, isVisible: encVisible } = useScrollAnimation(0.15);

  return (
    <Layout>
      <HeroSection />
      <StoreInfo />

      {/* Featured Products */}
      <section className="container py-16 md:py-24 px-4 md:px-8">
        <div
          ref={titleRef}
          className={`text-center transition-all duration-700 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="font-display text-2xl md:text-4xl font-light mb-4 tracking-[0.2em] text-foreground uppercase">
            Destacados
          </h2>
          <div className="w-12 h-[1px] bg-accent mx-auto mb-12" />
        </div>

        <div
          ref={gridRef}
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 transition-all duration-700 delay-200 ${
            gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {loadingProducts
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] rounded-none bg-secondary" />
                  <Skeleton className="h-4 w-3/4 bg-secondary" />
                  <Skeleton className="h-4 w-1/2 bg-secondary" />
                </div>
              ))
            : featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {/* CTA */}
        <div
          className={`mt-20 text-center transition-all duration-700 delay-400 ${
            gridVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link
            to="/productos"
            className="group relative inline-block border border-border px-12 py-5 font-body text-[10px] font-bold uppercase tracking-[0.3em] text-foreground hover:text-primary-foreground transition-all duration-700 overflow-hidden"
          >
            <span className="relative z-10">Ver toda la colección</span>
            <div className="absolute inset-0 bg-foreground translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
          </Link>

          <p className="mt-6 text-[9px] text-muted-foreground uppercase tracking-widest font-medium italic">
            Nuevos ingresos todas las semanas
          </p>
        </div>
      </section>

      {/* Encargues Section */}
      <section className="bg-secondary/40 py-16 md:py-24 overflow-hidden">
        <div
          ref={encRef}
          className={`container px-4 md:px-8 flex flex-col md:flex-row items-center gap-8 md:gap-16 transition-all duration-1000 ${
            encVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
              <Sparkles className="w-3 h-3 text-accent" />
              <p className="text-[10px] tracking-[0.5em] font-bold uppercase text-accent">
                Exclusivo
              </p>
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-light tracking-[0.15em] text-foreground mb-4">
              Pedidos por{" "}
              <span className="font-display italic text-accent">Encargue</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto md:mx-0 mb-8">
              Prendas exclusivas que no están en stock. Elegí la que más te guste y coordinamos la
              entrega por WhatsApp.
            </p>
            <Link
              to="/encargues"
              className="group relative inline-block border border-accent/40 px-10 py-4 font-body text-[10px] font-bold uppercase tracking-[0.3em] text-foreground hover:text-accent-foreground transition-all duration-700 overflow-hidden"
            >
              <span className="relative z-10">Ver encargues</span>
              <div className="absolute inset-0 bg-accent translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
            </Link>
          </div>
          <div className="flex-1 aspect-[4/5] max-w-xs bg-muted/50 border border-border/50 flex items-center justify-center">
            <p className="text-muted-foreground/40 text-[10px] uppercase tracking-widest">
              Próximamente
            </p>
          </div>
        </div>
      </section>

      <div className="h-10" />
    </Layout>
  );
}
