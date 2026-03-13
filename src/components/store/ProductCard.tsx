import { Link } from "react-router-dom";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/shipping";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to={`/producto/${product.slug}`}
        className="group block"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          {/* Primary image */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
          {/* Second image on hover (crossfade) */}
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={product.name}
              className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"
              loading="lazy"
            />
          )}
          {product.isNew && (
            <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-body text-[9px] uppercase tracking-[0.15em] rounded-none px-3 py-1">
              Nuevo
            </Badge>
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
    </motion.div>
  );
}
