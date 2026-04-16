import { memo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/shipping";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const onLoad = useCallback(() => setImgLoaded(true), []);

  return (
    <div className={`transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}>
      <Link
        to={`/producto/${product.slug}`}
        className="group block"
        data-track-key={`producto:${product.name}`}
        data-product-id={product.id}
        onMouseEnter={() => setHovered(true)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary rounded-sm">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
            onLoad={onLoad}
          />
          {/* Only mount hover image after first hover to save bandwidth */}
          {hovered && product.images[1] && (
            <img
              src={product.images[1]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"
              loading="eager"
              decoding="async"
            />
          )}
          {product.originalPrice && (
            <Badge className="absolute top-4 right-4 bg-foreground text-background font-body text-[9px] uppercase tracking-[0.15em] rounded-none px-3 py-1">
              Oferta
            </Badge>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-body text-xs font-medium uppercase tracking-wider leading-tight">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-body text-sm font-semibold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="font-body text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default memo(ProductCard);
