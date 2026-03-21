import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { memo } from "react";
import CustomProductCard from "./CustomProductCard"; // Importamos tu nueva tarjeta

function useEncarguePreview() {
  return useQuery({
    queryKey: ["custom_products", "preview"],
    queryFn: async () => {
      // Actualizamos el select para traer todos los campos que pide la tarjeta
      const { data, error } = await supabase
        .from("custom_products")
        .select("*") 
        .order("created_at", { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

function EncargueCarousel() {
  const { data: products = [], isLoading } = useEncarguePreview();
  // Usamos el número de contacto de Aura Femenina guardado
  const whatsappNumber = "5491134944228"; 

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
        {products.map((product: any) => (
          <CarouselItem key={product.id} className="pl-3 basis-1/2 md:basis-2/5">
            {/* Reemplazamos el div anterior por el nuevo componente con efecto zoom */}
            <CustomProductCard 
              product={product} 
              whatsappNumber={whatsappNumber} 
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}

export default memo(EncargueCarousel);
