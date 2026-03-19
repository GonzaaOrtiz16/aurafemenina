import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { memo } from "react";

interface CustomProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
}

function useEncarguePreview() {
  return useQuery({
    queryKey: ["custom_products", "preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_products")
        .select("id, name, slug, images")
        .order("created_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as unknown as CustomProduct[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

function EncargueCarousel() {
  const { data: products = [], isLoading } = useEncarguePreview();

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-40 shrink-0 bg-secondary" />
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <Carousel
      opts={{ align: "start", loop: true, dragFree: true }}
      className="w-full max-w-sm md:max-w-md"
    >
      <CarouselContent className="-ml-3">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-3 basis-1/2 md:basis-2/5">
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary group">
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 pt-8">
                <p className="text-white text-[10px] font-bold uppercase tracking-[0.15em] leading-tight">
                  {product.name}
                </p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export default memo(EncargueCarousel);
