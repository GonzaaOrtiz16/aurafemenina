import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { useProductBySlug } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || "");
  const { addItem } = useCart();
  const { toast } = useToast();
  
  // Estados para la selección
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Resetear estados si cambia el producto
  useEffect(() => {
    setCurrentImageIndex(0);
    setSelectedSize("");
    setSelectedColor("");
  }, [product]);

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
    // Si el producto tiene colores definidos, obligamos a elegir uno
    if (product.colores && product.colores.length > 0 && !selectedColor) {
      toast({ title: "Seleccioná un color", description: "Elegí un color antes de agregar al carrito.", variant: "destructive" });
      return;
    }

    // Aquí pasamos el color seleccionado al carrito
    addItem(product, selectedSize, selectedColor);
    toast({
      title: "¡Agregado al carrito!",
      description: `${product.name} - ${selectedColor ? colorSelectedName() + ' - ' : ''} Talle ${selectedSize}`,
    });
  };

  const colorSelectedName = () => {
    return product.colores?.find(c => c.hex === selectedColor)?.nombre || "";
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  return (
    <Layout>
      <div className="container py-6">
        <Link to="/productos" className="inline-flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" /> Volver a productos
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* GALERÍA DE IMÁGENES */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary group">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="h-full w-full object-cover transition-all duration-500"
              />
              
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {product.isNew && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-body text-xs uppercase tracking-wider">
                  Nuevo
                </Badge>
              )}
            </div>

            {/* Miniaturas */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 aspect-[3/4] flex-shrink-0 rounded-sm overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx ? "border-primary" : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={img} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFO DEL PRODUCTO */}
          <div className="flex flex-col">
            <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {product.category}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4 italic uppercase tracking-tighter">
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

            {/* Selector de Colores (NUEVO) */}
            {product.colores && product.colores.length > 0 && (
              <div className="mb-8">
                <p className="font-body text-sm font-medium mb-3 flex justify-between">
                  Color: <span className="font-normal text-muted-foreground">{colorSelectedName()}</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  {product.colores.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(color.hex)}
                      className={`group relative flex items-center justify-center`}
                      title={color.nombre}
                    >
                      <div 
                        className={`w-9 h-9 rounded-full border-2 transition-all duration-300 ${
                          selectedColor === color.hex ? "border-black scale-110" : "border-transparent hover:border-gray-300"
                        }`}
                        style={{ padding: '2px' }}
                      >
                        <div 
                          className="w-full h-full rounded-full border border-black/5" 
                          style={{ backgroundColor: color.hex }}
                        />
                      </div>
                      {selectedColor === color.hex && (
                         <div className="absolute -bottom-1 w-1 h-1 bg-black rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Talles */}
            <div className="mb-8">
              <p className="font-body text-sm font-medium mb-3">Talle</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`relative min-w-[54px] h-11 flex items-center justify-center rounded-sm border font-body text-sm transition-all ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-border hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              className="w-full font-body text-sm uppercase tracking-widest gap-2 bg-black hover:bg-black/90 h-14"
            >
              <ShoppingBag className="h-5 w-5" /> Agregar al carrito
            </Button>
            
            <p className="text-[10px] text-center text-muted-foreground mt-4 font-body uppercase tracking-widest">
              Aura Femenina — Envíos a todo el país
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
