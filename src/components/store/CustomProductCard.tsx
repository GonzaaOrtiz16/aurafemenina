import { Link } from "react-router-dom";
import { MessageCircle, Clock } from "lucide-react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { useState } from "react";

interface CustomProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    price_estimate: number;
    estimated_days: string | null;
  };
  whatsappNumber: string;
}

export default function CustomProductCard({ product, whatsappNumber }: CustomProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className={`group animate-fade-in flex flex-col h-full transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}>
      <Link to={`/encargue/${product.slug}`} className="block cursor-pointer flex-1">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary mb-3">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" 
            onLoad={() => setImgLoaded(true)}
          />
          {product.images[1] && (
            <img 
              src={product.images[1]} 
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
            />
          )}
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-sm">
            Por encargue
          </span>
        </div>
        <h3 className="font-body text-sm font-medium leading-tight group-hover:text-accent transition-colors">
          {product.name}
        </h3>
      </Link>
      <div className="mt-2 flex flex-col gap-1">
        <span className="font-body text-sm font-semibold">
          ${product.price_estimate.toLocaleString("es-AR")}
        </span>
      </div>
    </div>
  );
}
