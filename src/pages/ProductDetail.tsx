import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import { useProductBySlug } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shipping";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || "");
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColorHex, setSelectedColorHex] = useState(""); 
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (product) {
      setCurrentImageIndex(0);
      setSelectedSize("");
      setSelectedColorHex("");
    }
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
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  // --- LÓGICA DE RESCATE PARA TALLES (Para que no aparezca "0") ---
  const availableSizes = (() => {
    if (!product.sizes) return [];
    
    // Si es un objeto tipo {"M": 10}, extraemos las letras "M", "L", etc.
    if (typeof product.sizes === 'object' && !Array.isArray(product.sizes)) {
      return Object.keys(product.sizes).filter(key => {
        const stock = product.sizes[key];
        return stock !== 0 && stock !== "0"; // Filtramos si el stock es cero real
      });
    }
    
    // Si ya es una lista ["M", "L"], la usamos directamente
    if (Array.isArray(product.sizes)) return product.sizes;
    
    return [];
  })();

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      toast({ title: "Seleccioná un talle", variant: "destructive" });
      return;
    }
    
    const colorObj = product.colores?.find(c => c.hex === selectedColorHex);
    
    if (product.colores && product.colores.length > 0 && !selectedColorHex) {
      toast({ title: "Seleccioná un color", variant: "destructive" });
      return;
    }

    addItem(product, selectedSize, colorObj?.nombre || "");
    
    toast({
      title: "¡Agregado!",
      description: `${product.name} ${colorObj ? '- ' + colorObj.nombre : ''} - Talle ${selectedSize}`,
    });
  };

  return (
    <Layout>
      <div className="container py-6">
        <Link to="/productos" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-6 hover:text-black transition-colors">
          <ChevronLeft className="h-4 w-4" /> Volver a productos
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* GALERÍA */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary group">
              <img 
                src={product.images[currentImageIndex]} 
                alt={product.name} 
                className="h-full w-full object-cover" 
              />
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? product.images.length - 1 : prev - 1)} 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(prev => prev === product.images.length - 1 ? 0 : prev + 1)} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* INFORMACIÓN */}
          <div className="flex flex-col">
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2 uppercase italic tracking-tighter">
              {product.name}
            </h1>
            <p className="font-body text-2xl font-bold mb-6">
              {formatPrice(product.price)}
            </p>

            {/* SELECTOR DE COLORES CORREGIDO */}
            {product.colores && product.colores.length > 0 ? (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest font-semibold mb-3">
                  Color: <span className="font-normal text-muted-foreground">
                    {product.colores.find(c => c.hex === selectedColorHex)?.nombre || "Seleccioná uno"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-4">
                  {product.colores.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setSelectedColorHex(color.hex)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                        selectedColorHex === color.hex ? "border-black scale-110 shadow-sm" : "border-transparent hover:border-gray-300"
                      }`}
                      style={{ padding: '2px' }}
                    >
                      <div 
                        className="w-full h-full rounded-full border border-black/10" 
                        style={{ backgroundColor: color.hex }} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {/* SELECTOR DE TALLES CORREGIDO (Ignora el "0") */}
            {availableSizes.length > 0 && (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest font-semibold mb-3">Talle</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[54px] h-11 border transition-all font-body text-sm ${
                        selectedSize === size ? "bg-black text-white border-black" : "bg-white hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              onClick={handleAddToCart} 
              className="w-full bg-black text-white hover:bg-black/90 h-14 uppercase tracking-widest rounded-none"
            >
              <ShoppingBag className="h-5 w-5 mr-2" /> Agregar al carrito
            </Button>
            
            <p className="text-[10px] text-center text-muted-foreground mt-6 uppercase tracking-widest">
              Aura Femenina — WhatsApp: 5491134944228
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
