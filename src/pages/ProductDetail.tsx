import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { useProductBySlug } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductColorVariant } from "@/types/product";
import useEmblaCarousel from "embla-carousel-react";
import ZoomableImage from "@/components/store/ZoomableImage";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || "");
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(-1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    containScroll: "trimSnaps",
    skipSnaps: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentImageIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const scrollTo = useCallback((idx: number) => emblaApi?.scrollTo(idx), [emblaApi]);

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setSelectedSize("");
      const colors = getColors();
      setSelectedColorIdx(colors.length === 1 ? 0 : -1);
      // Reset carousel to first slide
      emblaApi?.scrollTo(0, true);
    }
  }, [product]);

  if (isLoading) return <Layout><div className="container py-10"><Skeleton className="h-[400px]" /></div></Layout>;
  if (!product) return null;

  // Get color variants
  const getColors = (): ProductColorVariant[] => {
    const raw = product.colores || [];
    return raw.map((c: any) => ({
      nombre: c.nombre || "",
      hex: c.hex || "#000000",
      sizes: c.sizes && typeof c.sizes === "object" ? c.sizes : {},
    }));
  };

  const colors = getColors();
  const hasVariants = colors.some((c) => Object.keys(c.sizes).length > 0);

  const getAvailableSizes = (): string[] => {
    if (hasVariants) {
      if (selectedColorIdx >= 0 && colors[selectedColorIdx]) {
        return Object.entries(colors[selectedColorIdx].sizes)
          .filter(([_, stock]) => stock > 0)
          .map(([size]) => size);
      }
      return [];
    }
    return product.sizes || [];
  };

  const availableSizes = getAvailableSizes();

  const handleColorSelect = (idx: number) => {
    setSelectedColorIdx(idx);
    const newSizes = Object.entries(colors[idx].sizes)
      .filter(([_, stock]) => stock > 0)
      .map(([size]) => size);
    if (!newSizes.includes(selectedSize)) {
      setSelectedSize("");
    }
  };

  const { isAuthenticated } = useCart();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({ 
        title: "Iniciá sesión", 
        description: "Tenés que iniciar sesión para agregar productos al carrito",
        variant: "destructive" 
      });
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    if (hasVariants && colors.length > 1 && selectedColorIdx < 0) {
      toast({ title: "Seleccioná un color", variant: "destructive" });
      return;
    }
    if (availableSizes.length > 0 && !selectedSize) {
      toast({ title: "Seleccioná un talle", variant: "destructive" });
      return;
    }
    
    try {
      const colorName = selectedColorIdx >= 0 ? colors[selectedColorIdx].nombre : "";
      addItem(product, selectedSize, colorName);
      toast({
        title: "¡Agregado!",
        description: `${product.name}${colorName ? ` - ${colorName}` : ""}${selectedSize ? ` - Talle ${selectedSize}` : ""}`,
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "No se pudo agregar al carrito",
        variant: "destructive" 
      });
    }
  };

  const getStockForSize = (size: string): number => {
    if (hasVariants && selectedColorIdx >= 0) {
      return colors[selectedColorIdx].sizes[size] || 0;
    }
    return 1;
  };

  return (
    <Layout>
      <div className="container py-6">
        <Link to="/productos" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Volver
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery - Embla Carousel */}
          <div className="relative w-full overflow-hidden rounded-sm bg-secondary group">
            <div ref={emblaRef} className="overflow-hidden h-[70vh] md:h-auto md:aspect-[3/4]">
              <div className="flex h-full">
                {product.images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center bg-white"
                  >
                    <ZoomableImage
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      onZoomChange={(zoomed) => {
                        if (emblaApi) {
                          // Disable carousel drag when zoomed in
                          if (zoomed) {
                            emblaApi.reInit({ watchDrag: false });
                          } else {
                            emblaApi.reInit({ watchDrag: true });
                          }
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                {product.images.map((_: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => scrollTo(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentImageIndex === idx ? "w-4 bg-foreground" : "w-1.5 bg-foreground/20"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Desktop arrows */}
            {product.images.length > 1 && (
              <div className="hidden md:flex absolute inset-0 items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button onClick={scrollPrev} className="bg-background/80 p-2 rounded-full shadow-md pointer-events-auto hover:bg-background">
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button onClick={scrollNext} className="bg-background/80 p-2 rounded-full shadow-md pointer-events-auto hover:bg-background">
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col px-2">
            <h1 className="font-display text-3xl font-semibold mb-2 uppercase italic tracking-tighter">{product.name}</h1>
            <div className="flex items-center gap-3 mb-6">
              <span className="font-body text-2xl font-bold text-foreground/80">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="font-body text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest font-bold mb-4">
                  Color: <span className="font-normal text-muted-foreground uppercase">{selectedColorIdx >= 0 ? colors[selectedColorIdx].nombre : "—"}</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleColorSelect(idx)}
                      className={`w-11 h-11 rounded-full border-2 transition-all p-[2px] ${
                        selectedColorIdx === idx ? "border-foreground scale-110" : "border-transparent"
                      }`}
                    >
                      <div className="w-full h-full rounded-full border border-border/30" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {hasVariants && selectedColorIdx < 0 && colors.length > 1 ? (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest font-bold mb-4 text-muted-foreground">Elegí un color para ver los talles disponibles</p>
              </div>
            ) : availableSizes.length > 0 ? (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest font-bold mb-4">Elegí tu talle</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size: string) => {
                    const stock = getStockForSize(size);
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={stock <= 0}
                        className={`min-w-[60px] h-12 border transition-all font-body text-sm tracking-widest relative ${
                          selectedSize === size
                            ? "bg-foreground text-background border-foreground"
                            : stock <= 0
                            ? "bg-muted border-border text-muted-foreground/40 cursor-not-allowed"
                            : "bg-background border-border hover:border-foreground"
                        }`}
                      >
                        {size}
                        {hasVariants && stock > 0 && stock <= 3 && (
                          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[8px] font-bold px-1 rounded-full">
                            {stock}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <Button onClick={handleAddToCart} size="lg" className="w-full bg-foreground text-background h-16 uppercase tracking-[0.2em] rounded-none hover:bg-foreground/90 active:scale-95 transition-transform">
              <ShoppingBag className="h-5 w-5 mr-2" /> Agregar al carrito
            </Button>

            <p className="text-[10px] text-center text-muted-foreground mt-8 uppercase tracking-[0.3em] font-medium">
              AURA FEMENINA — ENVIOS A TODO EL PAIS
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
