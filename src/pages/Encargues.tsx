import Layout from "@/components/store/Layout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, MessageCircle } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";

interface CustomProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  price_estimate: number;
  estimated_days: string | null;
}

interface ContactData { whatsapp: string; }

function useCustomProducts() {
  return useQuery({
    queryKey: ["custom_products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as CustomProduct[];
    },
  });
}

export default function Encargues() {
  const { data: products = [], isLoading } = useCustomProducts();
  const { data: contact } = useSiteSetting<ContactData>("contact");
  const whatsapp = contact?.whatsapp || "5491134944228";

  const buildWhatsAppUrl = (product: CustomProduct) => {
    const msg = encodeURIComponent(
      `¡Hola! Me interesa encargar: *${product.name}*\nPrecio estimado: $${product.price_estimate.toLocaleString("es-AR")}\n\n¿Podrían darme más info sobre disponibilidad y tiempos?`
    );
    return `https://wa.me/${whatsapp}?text=${msg}`;
  };

  return (
    <Layout>
      <div className="container py-12 px-4">
        <div className="text-center mb-12">
          <p className="text-accent text-[10px] tracking-[0.5em] font-black uppercase mb-3">Exclusivo</p>
          <h1 className="font-display text-3xl md:text-5xl tracking-wide mb-4">
            Pedidos por <span className="font-display italic text-accent">Encargue</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            Estas prendas no están en stock. Hacé tu pedido y coordinamos la fecha de entrega por WhatsApp.
          </p>
          <div className="w-12 h-[1px] bg-accent/40 mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3"><Skeleton className="aspect-[3/4] rounded-sm" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
              ))
            : products.map((product) => (
                <div key={product.id} className="group">
                  <div className="aspect-[3/4] overflow-hidden bg-secondary mb-4 relative">
                    {product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Sin imagen</div>
                    )}
                    <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[9px] font-bold uppercase tracking-wider px-3 py-1">Por encargue</span>
                  </div>
                  <h3 className="font-body text-sm font-bold uppercase tracking-wider mb-1">{product.name}</h3>
                  {product.description && <p className="text-muted-foreground text-xs leading-relaxed mb-2 line-clamp-2">{product.description}</p>}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-body text-sm font-bold">
                      ${product.price_estimate.toLocaleString("es-AR")}
                      <span className="text-[10px] text-muted-foreground font-normal ml-1">est.</span>
                    </span>
                    {product.estimated_days && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" />{product.estimated_days}</span>
                    )}
                  </div>
                  <a href={buildWhatsAppUrl(product)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-foreground text-background font-body text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors">
                    <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
                  </a>
                </div>
              ))}
        </div>

        {!isLoading && products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body text-sm mb-2">Todavía no hay productos por encargue disponibles.</p>
            <p className="text-muted-foreground/60 text-xs">¡Volvé pronto!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
