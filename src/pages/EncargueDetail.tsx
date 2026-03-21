
import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { useCustomProductBySlug } from "@/hooks/useCustomProducts"; // Asegurate de tener este hook
import { formatPrice } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, ChevronLeft, ChevronRight, Sparkles, Clock } from "lucide-react";
import { ProductColorVariant } from "@/types/product";
import useEmblaCarousel from "embla-carousel-react";
import ZoomableImage from "@/components/store/ZoomableImage";
import { openAuraStylist } from "@/components/store/AuraStylist";
import { motion } from "framer-motion";

export default function EncargueDetail() {
  const { slug } = useParams<{ slug: string }>();
  // Hook específico para la tabla custom_products
  const { data: product, isLoading } = useCustomProductBySlug(slug || "");

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
  }, [product]);

  if (isLoading) return <Layout><div className="container py-10"><Skeleton className="h-[400px]" /></div></Layout>;
  if (!product) return <Layout><div className="container py-10 text-center">Producto no encontrado</div></Layout>;

  const getColors = (): ProductColorVariant[] => {
    const raw = product.colores || [];
    return raw.map((c: any) => ({
      nombre: c.nombre || "",
      hex: c.hex || "#000000",
      sizes: c.sizes && typeof c.sizes === "object" ? c.sizes : {},
    }));
  };

  const colors = getColors();
  
  // En encargues, solemos mostrar todos los talles posibles (36-58 y XS-XXL)
  const availableSizes = product.sizes || [];

  const handleWhatsAppInquiry = () => {
    const colorName = selectedColorIdx >= 0 ? colors[selectedColorIdx].nombre : "";
    const message = `¡Hola! Me interesa este producto POR ENCARGUE:
    
*Producto:* ${product.name}
*Talle:* ${selectedSize || "A coordinar"}
*Color:* ${colorName || "A coordinar"}
*Link:* ${window.location.href}

¿Me podrías dar más info sobre la demora y el pago?`;

    // Número de WhatsApp de GO'S MOTOS / Aura Femenina
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5491134944228?text=${encodedMessage}`, "_blank");
  };

  const handleSizeAdvisor = () => {
    openAuraStylist(
      `Hola! Estoy viendo "${product.name}" por encargue y necesito ayuda para elegir mi talle. Los talles que suelen trabajar son del 36 al 58 y de XS a XXL. ¿Me ayudás?`
    );
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 px-6 md:px-12">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-8 uppercase tracking-wider hover:text-foreground transition-colors">
          <ChevronLeft className="h-3 w-3" /> Volver al inicio
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full overflow-hidden bg-secondary"
          >
             <div className="absolute top-4 left-4 z-20 bg-accent text-accent-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                Exclusivo por Encargue
             </div>
            <div ref={emblaRef} className="overflow-hidden h-[70vh] md:h-auto md:aspect-[3/4]">
              <div className="flex h-full">
                {product.images?.map((img: string, idx: number) => (
                  <div key={idx} className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center bg-white">
                    <ZoomableImage src={img} alt={`${product.name} ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col px-2"
          >
            <h1 className="font-display text-3xl md:text-4xl font-medium mb-3 tracking-wide">{product.name}</h1>
            
            <div className="flex flex-col gap-2 mb-8">
              <span className="font-body text-2xl font-bold text-foreground">{formatPrice(product.price_estimate)} <small className="text-xs font-normal text-muted-foreground">est.</small></span>
              <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-tighter">
                <Clock className="w-3 h-3" />
                Demora estimada: {product.estimated_days || "7-15"} días
              </div>
            </div>

            {/* Color selector */}
            {colors.length > 0 && (
              <div className="mb-10">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4">Color:</p>
                <div className="flex flex-wrap gap-4">
                  {colors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
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
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold">Elegí tu talle (36 al 58 / XS al XXL)</p>
                <button onClick={handleSizeAdvisor} className="flex items-center gap-1.5 text-[10px] text-accent font-bold uppercase">
                  <Sparkles className="w-3 h-3" /> Guía de talles
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[50px] h-10 border transition-all text-xs ${
                      selectedSize === size ? "bg-foreground text-background" : "bg-background hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleWhatsAppInquiry}
              size="lg"
              className="w-full bg-[#25D366] text-white h-16 uppercase tracking-[0.25em] rounded-none hover:bg-[#20ba5a] transition-all text-[11px] font-bold"
            >
              <MessageCircle className="h-4 w-4 mr-3" /> Consultar por WhatsApp
            </Button>

            <div className="mt-10 p-6 bg-secondary/30 border border-border/50">
                <h3 className="text-[10px] uppercase font-bold tracking-widest mb-3">¿Cómo funcionan los encargues?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                    {product.description || "Estas prendas se confeccionan o solicitan especialmente para vos. Una vez que coordinamos por WhatsApp, el pedido ingresa a producción."}
                </p>
            </div>

            <p className="text-[9px] text-center text-muted-foreground mt-12 uppercase tracking-[0.35em]">
              Aura Femenina — Diseños Exclusivos
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
