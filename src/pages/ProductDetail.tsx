import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { useProductBySlug } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ChevronLeft, ChevronRight, SearchPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || "");
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColorHex, setSelectedColorHex] = useState(""); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setSelectedSize("");
      setSelectedColorHex("");
    }
  }, [product]);

  // Manejador del scroll para actualizar los puntitos tipo Instagram
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setCurrentImageIndex(index);
    }
  };

  if (isLoading) return <Layout><div className="container py-10"><Skeleton className="h-[400px]" /></div></Layout>;
  if (!product) return null;

  const availableSizes = (() => {
    let sizes = product.sizes;
    if (!sizes) return [];
    if (typeof sizes === 'string') {
      try { sizes = JSON.parse(sizes); } catch(e) {}
    }
    let parsedSizes: string[] = [];
    if (Array.isArray(sizes)) {
      parsedSizes = sizes;
    } else if (typeof sizes === 'object') {
      parsedSizes = Object.keys(sizes);
    }
    return parsedSizes.filter(s => String(s) !== "0" && s !== "");
  })();

  const listaColores = (() => {
    let rawColors = product.colores || (product as any).colors;
    if (!rawColors) return [];
    if (typeof rawColors === 'string') {
      try { return JSON.parse(rawColors); } catch (e) { return []; }
    }
    return Array.isArray(rawColors) ? rawColors : [];
  })();

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      toast({ title: "Seleccioná un talle", variant: "destructive" });
      return;
    }
    const colorObj = listaColores.find((c: any) => c.hex === selectedColorHex);
    if (listaColores.length > 0 && !selectedColorHex) {
      toast({ title: "Seleccioná un color", variant: "destructive" });
      return;
    }
    addItem(product, selectedSize, colorObj?.nombre || "");
    toast({
      title: "¡Agregado!",
      description: `${product.name} - Talle ${selectedSize}`,
    });
  };

  return (
    <Layout>
      <div className="container py-6">
        <Link to="/productos" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <ChevronLeft className="h-4 w-4" /> Volver
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          
          {/* GALERÍA ESTILO INSTAGRAM */}
          <div className="relative w-full overflow-hidden rounded-sm bg-secondary group">
            {/* Contenedor con Scroll Snap (Deslizamiento suave) */}
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-[70vh] md:h-auto md:aspect-[3/4]"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {product.images.map((img: string, idx: number) => (
                <div key={idx} className="min-w-full h-full snap-center flex items-center justify-center bg-white relative">
                  <img 
                    src={img} 
                    alt={`${product.name} ${idx + 1}`} 
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110 cursor-zoom-in" 
                  />
                  {/* Icono de zoom visual */}
                  <div className="absolute top-4 right-4 p-2 bg-black/10 rounded-full md:hidden">
                    <SearchPlus className="w-5 h-5 text-white/50" />
                  </div>
                </div>
              ))}
            </div>

            {/* PUNTITOS (Indicadores) abajo - ESTILO INSTAGRAM */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                {product.images.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentImageIndex === idx ? "w-4 bg-black" : "w-1.5 bg-black/20"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Flechas (Solo visibles en PC al pasar el mouse) */}
            {product.images.length > 1 && (
              <div className="hidden md:flex absolute inset-0 items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <button 
                  onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                  className="bg-white/80 p-2 rounded-full shadow-md pointer-events-auto hover:bg-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                  className="bg-white/80 p-2 rounded-full shadow-md pointer-events-auto hover:bg-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>

          {/* INFORMACIÓN */}
          <div className="flex flex-col px-2">
            <h1 className="font-display text-3xl font-semibold mb-2 uppercase italic tracking-tighter">{product.name}</h1>
            <p className="font-body text-2xl font-bold mb-6 text-black/80">{formatPrice(product.price)}</p>

            {/* SELECTOR DE COLORES */}
            {listaColores.length > 0 && (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest font-bold mb-4">
                  Color: <span className="font-normal text-muted-foreground uppercase">{listaColores.find((c: any) => c.hex === selectedColorHex)?.nombre || "—"}</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  {listaColores.map((color: any) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColorHex(color.hex)}
                      className={`w-11 h-11 rounded-full border-2 transition-all p-[2px] ${
                        selectedColorHex === color.hex ? "border-black scale-110" : "border-transparent"
                      }`}
                    >
                      <div className="w-full h-full rounded-full border border-black/5" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SELECTOR DE TALLES */}
            {availableSizes.length > 0 && (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest font-bold mb-4">Elegí tu talle</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[60px] h-12 border transition-all font-body text-sm tracking-widest ${
                        selectedSize === size ? "bg-black text-white border-black" : "bg-white border-gray-200 hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleAddToCart} size="lg" className="w-full bg-black text-white h-16 uppercase tracking-[0.2em] rounded-none hover:bg-black/90 active:scale-95 transition-transform">
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
