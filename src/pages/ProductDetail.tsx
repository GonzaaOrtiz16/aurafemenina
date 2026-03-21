import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { useProductBySlug, useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ChevronLeft, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductColorVariant } from "@/types/product";
import useEmblaCarousel from "embla-carousel-react";
import ZoomableImage from "@/components/store/ZoomableImage";
import CompletaElLook from "@/components/store/CompletaElLook";
import { openAuraStylist } from "@/components/store/AuraStylist";
import { motion } from "framer-motion";
import { trackAnalyticsEvent } from "@/lib/analytics";

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

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setSelectedSize("");
      const colors = getColors();
      setSelectedColorIdx(colors.length === 1 ? 0 : -1);
      emblaApi?.scrollTo(0, true);
    }
  }, [product, emblaApi]);

  // Funciones de navegación de galería
  const scrollTo = (idx: number) => emblaApi?.scrollTo(idx);
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  useEffect(() => {
    if (!product) return;
    void trackAnalyticsEvent({
      eventType: "product_view",
      path: `/producto/${product.slug}`,
      productId: product.id,
      elementKey: `product-view:${product.slug}`,
      metadata: {
        category: product.category,
        subcategory: product.subcategory || null,
        price: product.price,
      },
    });
  }, [product]);

  if (isLoading) return <Layout><div className="container py-10"><Skeleton className="h-[500px]" /></div></Layout>;
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
      toast({ title: "Iniciá sesión", description: "Tenés que iniciar sesión para agregar al carrito", variant: "destructive" });
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
    addItem(product, selectedSize, selectedColorIdx >= 0 ? colors[selectedColorIdx].nombre : "");
    toast({ title: "¡Agregado al carrito!" });
  };

  const getStockForSize = (size: string): number => {
    if (hasVariants && selectedColorIdx >= 0) return colors[selectedColorIdx].sizes[size] || 0;
    return 1;
  };

  const handleSizeAdvisor = () => {
    openAuraStylist({
      initialMessage: `Estoy viendo ${product.name} y necesito ayuda real con el talle. Los talles disponibles exactos son: ${availableSizes.join(", ") || "sin dato"}.`,
      productContext: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        colores: product.colores ?? [],
        sizes: product.sizes ?? [],
        description: product.description ?? null,
        catalogType: "stock",
      },
    });
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 px-4 md:px-8">
        <Link to="/productos" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mb-8 uppercase tracking-[0.2em] hover:text-foreground transition-colors font-bold">
          <ChevronLeft className="h-3 w-3" /> Volver a Tienda
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* GALERÍA CON MINIATURAS IZQUIERDA */}
          <div className="md:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            
            {/* Columna Miniaturas Desktop */}
            <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
              <button onClick={scrollPrev} className="flex justify-center p-1 hover:bg-secondary rounded-sm transition-colors disabled:opacity-30" disabled={currentImageIndex === 0}>
                <ChevronUp className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[500px]">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => scrollTo(idx)}
                    className={`relative aspect-[3/4] overflow-hidden rounded-sm border-2 transition-all ${
                      currentImageIndex === idx ? "border-accent shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <button onClick={scrollNext} className="flex justify-center p-1 hover:bg-secondary rounded-sm transition-colors disabled:opacity-30" disabled={currentImageIndex === product.images.length - 1}>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Imagen Principal */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative flex-1 group">
              <div ref={emblaRef} className="overflow-hidden bg-secondary rounded-sm shadow-sm h-full">
                <div className="flex aspect-[3/4] h-full">
                  {product.images.map((img: string, idx: number) => (
                    <div key={idx} className="flex-[0_0_100%] min-w-0 bg-white">
                      <ZoomableImage 
                        src={img} 
                        alt={product.name} 
                        onZoomChange={(zoomed) => emblaApi?.reInit({ watchDrag: !zoomed })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicadores Mobile */}
              <div className="flex md:hidden justify-center gap-2 mt-4">
                {product.images.map((_, idx) => (
                  <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${currentImageIndex === idx ? "w-6 bg-accent" : "w-2 bg-muted"}`} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* PANEL DE INFORMACIÓN */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-5 flex flex-col">
            <div className="mb-8">
              <h1 className="font-display text-2xl md:text-4xl font-semibold mb-4 tracking-tight uppercase leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="font-body text-2xl font-bold">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through italic">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>

            {/* Selectores (Color y Talle) */}
            <div className="space-y-8 mb-10">
              {colors.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4">
                    Color: <span className="text-muted-foreground font-normal">{selectedColorIdx >= 0 ? colors[selectedColorIdx].nombre : "Seleccioná"}</span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleColorSelect(idx)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColorIdx === idx ? "border-foreground scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: color.hex, padding: '2px', backgroundClip: 'content-box' }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {availableSizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Talle:</p>
                    <button onClick={handleSizeAdvisor} className="flex items-center gap-1 text-[10px] text-accent font-bold uppercase hover:underline">
                      <Sparkles className="w-3 h-3" /> Guía de talles
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSizes.map((size) => {
                      const stock = getStockForSize(size);
                      return (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          disabled={stock <= 0}
                          className={`h-12 border transition-all text-xs font-bold uppercase ${
                            selectedSize === size ? "bg-foreground text-background border-foreground" : "bg-background border-border hover:border-foreground disabled:opacity-20"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleAddToCart} className="w-full bg-foreground text-background h-16 uppercase tracking-[0.2em] rounded-none hover:bg-foreground/90 transition-all text-[11px] font-bold shadow-xl">
              <ShoppingBag className="h-4 w-4 mr-3" /> Agregar al carrito
            </Button>

            {product.description && (
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] mb-3 text-muted-foreground">Descripción</h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">{product.description}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recomendados AI */}
        {allProducts.length > 2 && (
          <div className="mt-20">
            <CompletaElLook product={product} allProducts={allProducts} />
          </div>
        )}
      </div>
    </Layout>
  );
}
