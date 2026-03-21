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
  const [activeImg, setActiveImg] = useState(0);

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

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"];

  return (
    <div className={`group animate-fade-in flex flex-col h-full transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}>
      
      {/* Contenedor Superior: Galería lateral + Imagen Principal */}
      <div className="flex gap-2 mb-3 h-full">
        
        {/* MINIATURAS A LA IZQUIERDA (Solo si hay más de una foto) */}
        {images.length > 1 && (
          <div className="flex flex-col gap-1.5 w-10 sm:w-12 shrink-0">
            {images.slice(0, 4).map((img, idx) => (
              <div 
                key={idx}
                onMouseEnter={() => setActiveImg(idx)}
                className={`aspect-[3/4] overflow-hidden rounded-sm cursor-pointer border transition-all ${activeImg === idx ? "border-accent ring-1 ring-accent" : "border-transparent opacity-70"}`}
              >
                <img 
                  src={img} 
                  className="w-full h-full object-cover" 
                  alt={`thumb-${idx}`} 
                />
              </div>
            ))}
          </div>
        )}

        {/* IMAGEN PRINCIPAL */}
        <Link 
          to={`/encargue/${product.slug}`} 
          className="relative flex-1 aspect-[3/4] overflow-hidden rounded-sm bg-secondary"
          data-track-key={`encargue:${product.name}`}
        >
          <img 
            src={images[activeImg]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]" 
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
          
          <span className="absolute top-2 left-2 bg-accent text-accent-foreground text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm z-10 shadow-sm">
            Encargue
          </span>
        </Link>
      </div>

      {/* INFORMACIÓN INFERIOR */}
      <div className="flex flex-col flex-1">
        <Link to={`/encargue/${product.slug}`}>
          <h3 className="font-body text-xs font-medium uppercase tracking-wider leading-tight group-hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-semibold">
              ${product.price_estimate.toLocaleString("es-AR")}
              <span className="text-[10px] text-muted-foreground font-normal ml-1 italic">est.</span>
            </span>
          </div>

          {product.estimated_days && (
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-tight">
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
          className="flex items-center justify-center gap-2 w-full mt-4 py-2.5 bg-foreground text-background font-body text-[9px] font-bold uppercase tracking-[0.15em] hover:bg-foreground/90 transition-colors rounded-sm"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Consultar
        </a>
      </div>
    </div>
  );
}
