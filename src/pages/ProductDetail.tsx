import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { useProductBySlug } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ChevronLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || "");
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState("");

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-[3/4] rounded-sm" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl mb-4">Producto no encontrado</h1>
          <Link to="/productos" className="font-body text-sm text-accent hover:underline">
            Volver a productos
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({ title: "Seleccioná un talle", description: "Elegí tu talle antes de agregar al carrito.", variant: "destructive" });
      return;
    }
    addItem(product, selectedSize);
    toast({
      title: "¡Agregado al carrito!",
      description: `${product.name} - Talle ${selectedSize}`,
    });
  };

  return (
    <Layout>
      <div className="container py-6">
        <Link to="/productos" className="inline-flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" /> Volver a productos
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.isNew && (
              <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-body text-xs uppercase tracking-wider">
                Nuevo
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {product.category}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-body text-2xl font-semibold">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-body text-base text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <p className="font-body text-sm font-medium mb-3">Talle</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`relative min-w-[48px] px-3 py-2 rounded-sm border font-body text-sm transition-colors ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                    {selectedSize === size && (
                      <Check className="absolute -top-1 -right-1 h-3 w-3 bg-accent text-accent-foreground rounded-full p-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              className="w-full font-body text-sm uppercase tracking-wider gap-2"
            >
              <ShoppingBag className="h-4 w-4" /> Agregar al carrito
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
