import { memo } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useFeaturedProducts } from "@/hooks/useProducts";
import ProductCard from "./ProductCard";

function FeaturedProducts() {
  const { data: featured = [], isLoading } = useFeaturedProducts();
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation(0.2);

  return (
    <section className="container py-20 md:py-32 px-6 md:px-12 content-visibility-auto">
      <div
        ref={titleRef}
        className={`text-center transition-[opacity,transform] duration-700 will-change-[opacity,transform] ${
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
        {isLoading
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
  );
}

export default memo(FeaturedProducts);
