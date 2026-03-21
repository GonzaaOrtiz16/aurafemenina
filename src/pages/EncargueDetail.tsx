import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { useCustomProductBySlug } from "@/hooks/useCustomProducts";
import { formatPrice } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, ChevronLeft, Clock, Sparkles, ChevronUp, ChevronDown } from "lucide-react";
import { ProductColorVariant } from "@/types/product";
import useEmblaCarousel from "embla-carousel-react";
import ZoomableImage from "@/components/store/ZoomableImage";
import { openAuraStylist } from "@/components/store/AuraStylist";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { motion } from "framer-motion";

interface ContactData { whatsapp: string; }

export default function EncargueDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useCustomProductBySlug(slug || "");
  const { data: contact } = useSiteSetting<ContactData>("contact");
  
  const whatsapp = contact?.whatsapp || "5491134944228";

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

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  if (isLoading) return <Layout><div className="container py-10"><Skeleton className="h-[500px] w-full" /></div></Layout>;
  if (!product) return <Layout><div className="container py-10 text-center font-display uppercase tracking-widest">Producto no encontrado</div></Layout>;

  const getColors = (): ProductColorVariant[] => {
    const raw = product.colores || [];
    return raw.map((c: any) => ({
      nombre: c.nombre || "",
      hex: c.hex || "#000000",
      sizes: c.sizes && typeof c.sizes === "object" ? c.sizes : {},
    }));
  };

  const colors = getColors();
  const availableSizes = Array.isArray(product.sizes)
    ? product.sizes
    : product.sizes && typeof product.sizes === "object"
      ? Object.keys(product.sizes)
      : colors.length > 0
        ? Array.from(new Set(colors.flatMap((color) => Object.keys(color.sizes || {}))))
        : [];

  const handleWhatsAppInquiry = () => {
    const colorName = selectedColorIdx >= 0 ? colors[selectedColorIdx].nombre : "";
    const message = `¡Hola! Me interesa este producto POR ENCARGUE:
    
*Producto:* ${product.name}
*Talle:* ${selectedSize || "A coordinar"}
*Color:* ${colorName || "A coordinar"}
*Link:* ${window.location.href}

¿Me podrías dar más info sobre la demora y el pago?`;

    void trackAnalyticsEvent({
      eventType: "custom_checkout_intent",
      path: window.location.pathname,
      customProductId: product.id,
      elementKey: `detalle-wa-button:${product.slug}`,
      metadata: { selectedSize, selectedColor: colorName }
    });

    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSizeAdvisor = () => {
    openAuraStylist({
      initialMessage: `¡Hola! Estoy viendo "${product.name}" por encargue y necesito ayuda para elegir mi talle. Los talles disponibles exactos son: ${availableSizes.join(", ") || "sin dato"}. ¿Me ayudás?`,
      productContext: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        priceEstimate: product.price_estimate,
        colores: product.colores ?? [],
        sizes: product.sizes ?? [],
        estimatedDays: product.estimated_days ?? null,
        description: product.description ?? null,
        catalogType: "encargue",
      },
    });
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 px-4 md:px-8">
        <Link to="/encargues" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mb-8 uppercase tracking-[0.2em] hover:text-foreground transition-colors font-bold">
          <ChevronLeft className="h-3 w-3" /> Volver a Encargues
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* GALERÍA ESTILO ZARA/AURAFEMENINA */}
          <div className="md:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            
            {/* Miniaturas Laterales (Solo visibles en Desktop) */}
            <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
              <button 
                onClick={scrollPrev}
                className="flex items-center justify-center p-1 hover:bg-secondary rounded-sm transition-colors"
                disabled={currentImageIndex === 0}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[500px]">
                {product.images?.map((img: string, idx: number) => (
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

              <button 
                onClick={scrollNext}
                className="flex items-center justify-center p-1 hover:bg-secondary rounded-sm transition-colors"
                disabled={currentImageIndex === (product.images?.length - 1)}
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Imagen Principal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative flex-1"
            >
              <div className="absolute top-4 left-4 z-20 bg-accent text-accent-foreground px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">
                Pedido por Encargue
              </div>
              <div ref={emblaRef} className="overflow-hidden bg-secondary rounded-sm shadow-sm">
                <div className="flex aspect-[3/4]">
                  {product.images?.map((img: string, idx: number) => (
                    <div key={idx} className="flex-[0_0_100%] min-w-0">
                      <ZoomableImage src={img} alt={`${product.name} ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicadores para Mobile */}
              <div className="flex md:hidden justify-center gap-2 mt-4">
                {product.images?.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${currentImageIndex === idx ? "w-6 bg-accent" : "w-2 bg-muted"}`} 
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* INFORMACIÓN Y PANEL DE COMPRA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-5 flex flex-col"
          >
            <div className="mb-6">
              <h1 className="font-display text-2xl md:text-4xl font-semibold mb-3 tracking-tight uppercase">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <span className="font-body text-2xl font-bold">
                  {formatPrice(product.price_estimate)}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground italic">
                  Precio Estimado
                </span>
              </div>
            </div>

            {/* Demora Box */}
            <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/10 rounded-sm mb-8">
              <Clock className="w-4 h-4 text-accent" />
              <div className="text-xs">
                <p className="font-bold uppercase text-[9px] tracking-widest text-accent">Demora estimada</p>
                <p className="font-medium text-muted-foreground">{product.estimated_days || "7 a 15"} días hábiles</p>
              </div>
            </div>

            {/* Selector de Color */}
            {colors.length > 0 && (
              <div className="mb-8">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                  Color: <span className="text-muted-foreground font-normal">{selectedColorIdx >= 0 ? colors[selectedColorIdx].nombre : "Seleccioná uno"}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColorIdx === idx ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color.hex, padding: '2px', backgroundClip: 'content-box' }}
                      title={color.nombre}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Talles */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Talle:</p>
                <button onClick={handleSizeAdvisor} className="flex items-center gap-1 text-[10px] text-accent font-bold uppercase hover:underline">
                  <Sparkles className="w-3 h-3" /> Guía de talles
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {availableSizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 border transition-all text-xs font-bold uppercase ${
                      selectedSize === size ? "bg-foreground text-background border-foreground" : "bg-background border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleWhatsAppInquiry}
              className="w-full bg-foreground text-background h-14 uppercase tracking-[0.2em] rounded-none hover:bg-foreground/90 transition-all text-[10px] font-bold shadow-lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" /> 
              Consultar por WhatsApp
            </Button>

            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-[9px] uppercase font-bold tracking-[0.2em] mb-2 text-muted-foreground">Sobre esta prenda</h3>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {product.description || "Esta prenda se trabaja exclusivamente por pedido. Coordinamos los detalles de seña y entrega directamente por WhatsApp."}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
