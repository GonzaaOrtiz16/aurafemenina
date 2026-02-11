import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/shipping";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/producto/${product.slug}`}
      className="group block animate-fade-in"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.isNew && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-body text-[10px] uppercase tracking-wider">
            Nuevo
          </Badge>
        )}
        {product.originalPrice && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground font-body text-[10px] uppercase tracking-wider">
            Oferta
          </Badge>
        )}
      </div>
      <div className="mt-3">
        <h3 className="font-body text-sm font-medium leading-tight">{product.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-body text-sm font-semibold">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="font-body text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
