import { Link } from "react-router-dom";
import { MessageCircle, Clock } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { useState } from "react";

interface CustomProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    images: string[];
    price_estimate: number;
    original_price: number | null;
    estimated_days: string | null;
    colores: any[];
    category_id: string | null;
    subcategory_id: string | null;
  };
  whatsappNumber: string;
}

export default function CustomProductCard({ product, whatsappNumber }: CustomProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const buildWhatsAppUrl = () => {
    const coloresText = (product.colores || [])
      .map((c: any) => c.nombre)
      .filter(Boolean)
      .join(", ");
    
    const msg = encodeURIComponent(
      `¡Hola! Me interesa encargar: *${product.name}*\nPrecio estimado: $${product.price_estimate.toLocaleString("es-AR")}${coloresText ? `\nColores: ${coloresText}` : ""}\n\n¿Podrían darme más info?`
    );
    return `https://wa.me/${whatsappNumber}?text=${msg}`;
  };

  const handleAnalytics = () => {
    void trackAnalyticsEvent({
      eventType: "custom_checkout_intent",
      path: window.location.pathname,
      customProductId: product.id,
      elementKey: `consultar-encargue:${product.slug}`,
      metadata: {
        price_estimate: product.price_estimate,
        category_id: product.category_id,
      },
    });
  };

  return (
    <div className={`group animate-fade-in flex flex-col h-full transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}>
      {/* Link al Detalle: Imagen con efecto Espejo de ProductCard */}
      <Link 
        to={`/encargue/${product.slug}`} 
        className="block cursor-pointer flex-1"
        data-track-key={`encargue:${product.name}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary mb-3">
          {product.images && product.images[0] ? (
            <>
              {/* Imagen Principal: Zoom suave al hacer hover */}
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]" 
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
              />
              
              {/* Segunda Imagen: Aparece en hover (igual que en Destacados) */}
              {product.images[1] && (
                <img 
                  src={product.images[1]} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out" 
                  loading="lazy"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Sin imagen
            </div>
          )}

          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-sm z-10">
            Por encargue
          </span>
        </div>

        <h3 className="font-body text-sm font-medium leading-tight group-hover:text-accent transition-colors">
          {product.name}
        </h3>
      </Link>

      {/* Info de Precio y Colores */}
      <div className="mt-2 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-semibold">
            ${product.price_estimate.toLocaleString("es-AR")}
            <span className="text-[10px] text-muted-foreground font-normal ml-1">est.</span>
          </span>
        </div>

        {product.estimated_days && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" /> {product.estimated_days} días demora
          </span>
        )}
      </div>

      {/* Botón de Consulta */}
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleAnalytics}
        className="flex items-center justify-center gap-2 w-full mt-4 py-3 bg-foreground text-background font-body text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-foreground/90 transition-colors rounded-sm"
      >
        <MessageCircle className="w-4 h-4" /> Consultar
      </a>
    </div>
  );
}
