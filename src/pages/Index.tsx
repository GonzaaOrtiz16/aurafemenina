import Layout from "@/components/store/Layout";
import HeroSection from "@/components/store/HeroSection";
import ProductCard from "@/components/store/ProductCard";
import StoreInfo from "@/components/store/StoreInfo";
import EncargueCarousel from "@/components/store/EncargueCarousel";
import { useFeaturedProducts } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Sparkles } from "lucide-react";

export default function Index() {
  const { data: featured = [], isLoading: loadingProducts } = useFeaturedProducts();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation(0.2);
  const { ref: encRef, isVisible: encVisible } = useScrollAnimation(0.15);

  return (
    <Layout>
      <HeroSection />
      <StoreInfo />

      {/* Featured Products */}
      <section className="container py-20 md:py-32 px-6 md:px-12">
        <div
          ref={titleRef}
          className={`text-center transition-all duration-700 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-[9px] tracking-[0.5em] font-bold uppercase text-muted-foreground mb-3">Colección</p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-6 tracking-wide text-foreground">
            Destacados
          </h2>
          <div className="w-16 h-[1px] bg-accent mx-auto mb-16" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
          {loadingProducts
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[3/4] bg-secondary" />
                  <Skeleton className="h-4 w-3/4 bg-secondary" />
                  <Skeleton className="h-4 w-1/2 bg-secondary" />
                </div>
              ))
            : featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <Link
            to="/productos"
            className="group relative inline-block border border-foreground px-14 py-6 font-body text-[10px] font-bold uppercase tracking-[0.35em] text-foreground hover:text-background transition-all duration-700 overflow-hidden"
          >
            <span className="relative z-10">Ver toda la colección</span>
            <div className="absolute inset-0 bg-foreground translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
          </Link>
        </div>
      </section>

      {/* Encargues Section */}
      <section className="bg-secondary/30 py-20 md:py-32 overflow-hidden">
        <div
          ref={encRef}
          className={`container px-6 md:px-12 flex flex-col md:flex-row items-center gap-12 md:gap-20 transition-all duration-1000 ${
            encVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
              <Sparkles className="w-3 h-3 text-accent" />
              <p className="text-[9px] tracking-[0.5em] font-bold uppercase text-accent">
                Exclusivo
              </p>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-light tracking-wide text-foreground mb-6">
              Pedidos por{" "}
              <span className="font-display italic text-accent">Encargue</span>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto md:mx-0 mb-10">
              Prendas exclusivas que no están en stock. Elegí la que más te guste y coordinamos la
              entrega por WhatsApp.
            </p>
            <Link
              to="/encargues"
              className="group relative inline-block border border-accent/40 px-12 py-5 font-body text-[10px] font-bold uppercase tracking-[0.35em] text-foreground hover:text-accent-foreground transition-all duration-700 overflow-hidden"
            >
              <span className="relative z-10">Ver encargues</span>
              <div className="absolute inset-0 bg-accent translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
            </Link>
          </div>
          <div className="flex-1">
            <EncargueCarousel />
          </div>
        </div>
      </section>

      <div className="h-16" />
    </Layout>
  );
}
