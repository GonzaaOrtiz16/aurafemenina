import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { useCustomProductBySlug } from "@/hooks/useCustomProducts";
import { formatPrice } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, ChevronLeft, Clock, Sparkles } from "lucide-react";
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
  
  // WhatsApp dinámico
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
  const availableSizes = product.sizes || [];

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
    openAuraStylist(
      `¡Hola! Estoy viendo "${product.name}" por encargue y necesito ayuda para elegir mi talle. Los talles disponibles son: ${availableSizes.join(", ")}. ¿Me ayudás?`
    );
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 px-6 md:px-12">
        <Link to="/encargues" className="inline-flex items-center gap-1 text-[10px] text-muted-foreground mb-8 uppercase tracking-[0.2em] hover:text-foreground transition-colors font-bold">
          <ChevronLeft className="h-3 w-3" /> Volver a Encargues
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
          {/* Galería con Animación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full"
          >
            <div className="absolute top-4 left-4 z-20 bg-accent text-accent-foreground px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
              Pedido por Encargue
            </div>
            <div ref={emblaRef} className="overflow-hidden bg-secondary rounded-sm">
              <div className="flex aspect-[3/4]">
                {product.images?.map((img: string, idx: number) => (
                  <div key={idx} className="flex-[0_0_100%] min-w-0 h-full">
                    <ZoomableImage src={img} alt={`${product.name} ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Indicadores de imagen */}
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {product.images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 transition-all duration-300 ${currentImageIndex === idx ? "w-8 bg-foreground" : "w-4 bg-muted"}`} 
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Información y Selección */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <h1 className="font-display text-3xl md:text-5xl font-semibold mb-4 tracking-tight uppercase leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="font-body text-3xl font-bold">
                  {formatPrice(product.price_estimate)}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-1">
                  Precio Estimado
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/10 mb-10">
              <Clock className="w-5 h-5 text-accent" />
              <div className="text-sm">
                <p className="font-bold uppercase text-[10px] tracking-widest text-accent">Demora de confección</p>
                <p className="font-medium text-muted-foreground">{product.estimated_days || "7 a 15"} días hábiles</p>
              </div>
            </div>

            {/* Selector de Color */}
            {colors.length > 0 && (
              <div className="mb-10">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                  Color: <span className="text-muted-foreground font-normal">{selectedColorIdx >= 0 ? colors[selectedColorIdx].nombre : "Seleccioná uno"}</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 ${
                        selectedColorIdx === idx ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      title={color.nombre}
                    >
                      <div className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Talles */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Talle a encargar:</p>
                <button 
                  onClick={handleSizeAdvisor}
                  className="flex items-center gap-1.5 text-[10px] text-accent font-bold uppercase hover:underline"
                >
                  <Sparkles className="w-3 h-3" /> Ayuda con el talle
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[55px] h-12 border transition-all text-xs font-bold ${
                      selectedSize === size 
                        ? "bg-foreground text-background border-foreground shadow-lg" 
                        : "bg-background border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón Principal */}
            <Button
              onClick={handleWhatsAppInquiry}
              className="w-full bg-foreground text-background h-16 uppercase tracking-[0.3em] rounded-none hover:bg-foreground/90 transition-all text-[11px] font-bold shadow-2xl group"
            >
              <MessageCircle className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" /> 
              Consultar Disponibilidad
            </Button>

            {/* Info Extra */}
            <div className="mt-12 space-y-6 pt-8 border-t border-border">
              <div className="space-y-2">
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em]">Descripción y Detalles</h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  {product.description || "Esta prenda exclusiva se trabaja únicamente por pedido. Una vez confirmada la seña por WhatsApp, iniciamos el proceso de reserva o confección para asegurar tu unidad."}
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-4 opacity-50 grayscale pt-4">
                <div className="h-[1px] flex-1 bg-border" />
                <span className="text-[9px] uppercase tracking-[0.4em]">Aura Femenina</span>
                <div className="h-[1px] flex-1 bg-border" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
