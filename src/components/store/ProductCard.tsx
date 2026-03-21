import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/shipping";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  const images = product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"];

  return (
    <div
      className={`transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
    >
      <div className="flex gap-2">
        {/* COLUMNA DE MINIATURAS (Estilo Galería Lateral) */}
        {images.length > 1 && (
          <div className="flex flex-col gap-1.5 w-10 sm:w-12 shrink-0">
            {images.slice(0, 4).map((img, idx) => (
              <div 
                key={idx}
                onMouseEnter={() => setActiveImg(idx)}
                className={`aspect-[3/4] overflow-hidden rounded-sm cursor-pointer border-2 transition-all ${
                  activeImg === idx ? "border-accent" : "border-transparent opacity-60"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`thumb-${idx}`} />
              </div>
            ))}
          </div>
        )}

        {/* IMAGEN PRINCIPAL */}
        <Link
          to={`/producto/${product.slug}`}
          className="group relative flex-1 aspect-[3/4] overflow-hidden bg-secondary rounded-sm"
          data-track-key={`producto:${product.name}`}
          data-product-id={product.id}
        >
          <img
            src={images[activeImg]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
          />
          
          {product.isNew && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-body text-[8px] uppercase tracking-[0.15em] rounded-none px-2 py-0.5">
              Nuevo
            </Badge>
          )}
          
          {product.originalPrice && (
            <Badge className="absolute top-3 right-3 bg-foreground text-background font-body text-[8px] uppercase tracking-[0.15em] rounded-none px-2 py-0.5">
              Oferta
            </Badge>
          )}
        </Link>
      </div>

      {/* INFORMACIÓN DEBAJO */}
      <Link to={`/producto/${product.slug}`} className="mt-4 block space-y-1">
        <h3 className="font-body text-xs font-medium uppercase tracking-wider leading-tight group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-body text-sm font-semibold">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="font-body text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

export default memo(ProductCard);
