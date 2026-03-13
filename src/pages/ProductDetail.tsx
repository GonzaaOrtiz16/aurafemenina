import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { useProductBySlug, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductColorVariant } from "@/types/product";
import useEmblaCarousel from "embla-carousel-react";
import ZoomableImage from "@/components/store/ZoomableImage";
import CompletaElLook from "@/components/store/CompletaElLook";
import { openAuraStylist } from "@/components/store/AuraStylist";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || "");
  const { data: allProducts = [] } = useProducts();
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
      emblaApi?.scrollTo(0, true);
    }
  }, [product]);

  if (isLoading) return <Layout><div className="container py-10"><Skeleton className="h-[400px]" /></div></Layout>;
  if (!product) return null;

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
    if (!newSizes.includes(selectedSize)) setSelectedSize("");
  };

  const { isAuthenticated } = useCart();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({ title: "Iniciá sesión", description: "Tenés que iniciar sesión para agregar productos al carrito", variant: "destructive" });
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
      toast({ title: "Error", description: error instanceof Error ? error.message : "No se pudo agregar al carrito", variant: "destructive" });
    }
  };

  const getStockForSize = (size: string): number => {
    if (hasVariants && selectedColorIdx >= 0) return colors[selectedColorIdx].sizes[size] || 0;
    return 1;
  };

  const handleSizeAdvisor = () => {
    openAuraStylist(
      `Hola! Estoy viendo "${product.name}" y necesito ayuda para elegir mi talle ideal. Los talles disponibles son: ${availableSizes.join(", ")}. ¿Me podés ayudar?`
    );
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 px-6 md:px-12">
        <Link to="/productos" className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-8 uppercase tracking-wider hover:text-foreground transition-colors">
          <ChevronLeft className="h-3 w-3" /> Volver
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full overflow-hidden bg-secondary group"
          >
            <div ref={emblaRef} className="overflow-hidden h-[70vh] md:h-auto md:aspect-[3/4]">
              <div className="flex h-full">
                {product.images.map((img: string, idx: number) => (
                  <div key={idx} className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center bg-white">
                    <ZoomableImage
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      onZoomChange={(zoomed) => {
                        if (emblaApi) {
                          emblaApi.reInit({ watchDrag: !zoomed });
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {product.images.map((_: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => scrollTo(idx)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      currentImageIndex === idx ? "w-6 bg-foreground" : "w-1.5 bg-foreground/20"
                    }`}
                  />
                ))}
              </div>
            )}

            {product.images.length > 1 && (
              <div className="hidden md:flex absolute inset-0 items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button onClick={scrollPrev} className="bg-background/80 p-2 pointer-events-auto hover:bg-background transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={scrollNext} className="bg-background/80 p-2 pointer-events-auto hover:bg-background transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col px-2"
          >
            <h1 className="font-display text-3xl md:text-4xl font-medium mb-3 tracking-wide">{product.name}</h1>
            <div className="flex items-center gap-3 mb-8">
              <span className="font-body text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="font-body text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="mb-10">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4">
                  Color: <span className="font-normal text-muted-foreground">{selectedColorIdx >= 0 ? colors[selectedColorIdx].nombre : "—"}</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleColorSelect(idx)}
                      className={`w-12 h-12 rounded-full border-2 transition-all p-[2px] ${
                        selectedColorIdx === idx ? "border-foreground scale-110" : "border-transparent hover:border-border"
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
              <div className="mb-10">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Elegí un color para ver los talles</p>
              </div>
            ) : availableSizes.length > 0 ? (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Elegí tu talle</p>
                  <button
                    onClick={handleSizeAdvisor}
                    className="flex items-center gap-1.5 text-[10px] text-accent hover:text-accent/80 transition-colors uppercase tracking-wider font-bold"
                  >
                    <Sparkles className="w-3 h-3" />
                    ¿Cuál es mi talle?
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size: string) => {
                    const stock = getStockForSize(size);
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        disabled={stock <= 0}
                        className={`min-w-[64px] h-12 border transition-all font-body text-xs tracking-widest relative ${
                          selectedSize === size
                            ? "bg-foreground text-background border-foreground"
                            : stock <= 0
                            ? "bg-muted border-border text-muted-foreground/40 cursor-not-allowed"
                            : "bg-background border-border hover:border-foreground"
                        }`}
                      >
                        {size}
                        {hasVariants && stock > 0 && stock <= 3 && (
                          <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[7px] font-bold px-1">
                            {stock}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full bg-foreground text-background h-16 uppercase tracking-[0.25em] rounded-none hover:bg-foreground/90 active:scale-[0.98] transition-all duration-300 text-[11px] font-bold"
            >
              <ShoppingBag className="h-4 w-4 mr-3" /> Agregar al carrito
            </Button>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-10">
                {product.description}
              </p>
            )}

            <p className="text-[9px] text-center text-muted-foreground mt-12 uppercase tracking-[0.35em] font-medium">
              Aura Femenina — Envíos a todo el país
            </p>
          </motion.div>
        </div>

        {/* Completá el Look AI */}
        {allProducts.length > 2 && (
          <CompletaElLook product={product} allProducts={allProducts} />
        )}
      </div>
    </Layout>
  );
}
