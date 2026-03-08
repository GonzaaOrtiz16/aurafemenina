import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import ShippingCalculator from "@/components/store/ShippingCalculator";
import { useCart } from "@/context/CartContext";
import { formatPrice, MINIMUM_PURCHASE, ZONE_LABELS } from "@/lib/shipping";
import type { ShippingResult, ShippingZone } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";

interface ContactData { whatsapp: string; }

const STORE_NAME = "AURA FEMENINA";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [zone, setZone] = useState<ShippingZone | null>(null);
  const [address, setAddress] = useState("");
  const { data: contact } = useSiteSetting<ContactData>("contact");
  const whatsappNumber = contact?.whatsapp || "5491134944228";

  const total = subtotal + (shipping?.cost || 0);
  const minimum = zone ? MINIMUM_PURCHASE[zone] : 0;
  const meetsMinimum = minimum === 0 || subtotal >= minimum;

  const buildWhatsAppMessage = () => {
    let msg = `*${STORE_NAME} - Nuevo Pedido* 🛍️\n\n`;
    msg += `📦 *Productos:*\n`;
    items.forEach((item) => {
      const colorText = item.color ? ` - Color: ${item.color}` : "";
      msg += `• ${item.product.name} (Talle: ${item.size}${colorText}) x${item.quantity} - ${formatPrice(item.product.price * item.quantity)}\n`;
    });
    msg += `\n💰 *Subtotal:* ${formatPrice(subtotal)}\n`;
    if (shipping) msg += `🚚 *Envío:* ${formatPrice(shipping.cost)} (${shipping.method})\n`;
    msg += `💵 *Total:* ${formatPrice(total)}\n`;
    if (address) msg += `\n📍 *Dirección:* ${address}\n`;
    if (zone) msg += `📌 *Zona:* ${ZONE_LABELS[zone]}\n`;
    msg += `\n_Instagram: @aurafemenina.oficial_`;
    return encodeURIComponent(msg);
  };

  const handleCheckout = () => {
    if (!shipping || !zone) { alert("Por favor, calculá el envío ingresando tu código postal."); return; }
    if (!meetsMinimum) { alert(`Para envíos a ${ZONE_LABELS[zone]} el mínimo de compra es de ${formatPrice(minimum)}. Te faltan ${formatPrice(minimum - subtotal)}.`); return; }
    if (address.trim() === "") { alert("Por favor, ingresá una dirección para el envío."); return; }
    window.open(`https://wa.me/${whatsappNumber}?text=${buildWhatsAppMessage()}`, "_blank");
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl mb-4 italic uppercase">Tu carrito está vacío</h1>
          <Link to="/productos">
            <Button className="bg-foreground text-background hover:bg-foreground/90 font-body text-xs uppercase tracking-widest px-8">Ver productos</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8 italic uppercase tracking-tighter">Tu carrito</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-4 border border-border rounded-sm p-4 bg-card">
                <img src={item.product.images[0]} alt={item.product.name} className="h-24 w-20 object-cover rounded-sm bg-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm font-medium uppercase truncate italic">{item.product.name}</h3>
                  <p className="font-body text-xs text-muted-foreground mt-0.5 uppercase">Talle: {item.size} {item.color ? `| Color: ${item.color}` : ""}</p>
                  <p className="font-body text-sm font-semibold mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                      className="h-7 w-7 flex items-center justify-center border border-border rounded-sm hover:bg-secondary transition-colors"><Minus className="h-3 w-3" /></button>
                    <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                      className="h-7 w-7 flex items-center justify-center border border-border rounded-sm hover:bg-secondary transition-colors"><Plus className="h-3 w-3" /></button>
                    <button onClick={() => removeItem(item.product.id, item.size, item.color)}
                      className="ml-auto text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="border border-border rounded-sm p-6 space-y-4 bg-secondary/10">
              <h2 className="font-display text-xl font-semibold italic uppercase">Resumen</h2>
              <div className="flex justify-between font-body text-sm"><span>Subtotal</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
              {shipping && <div className="flex justify-between font-body text-sm"><span>Envío ({shipping.method})</span><span className="font-semibold">{formatPrice(shipping.cost)}</span></div>}
              <div className="border-t border-border pt-3 flex justify-between font-body"><span className="font-semibold uppercase italic">Total</span><span className="text-lg font-bold">{formatPrice(total)}</span></div>
            </div>
            <ShippingCalculator onShippingCalculated={setShipping} onZoneDetected={setZone} cartSubtotal={subtotal} />
            <div className="space-y-2">
              <label className="font-body text-xs uppercase tracking-widest font-medium">Dirección de envío</label>
              <Input placeholder="Calle, número, localidad" value={address} onChange={(e) => setAddress(e.target.value)}
                className="font-body rounded-none border-border focus:border-foreground" />
            </div>
            <Button size="lg" onClick={handleCheckout} disabled={!meetsMinimum && zone !== null}
              className="w-full gap-2 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 font-body text-xs uppercase tracking-widest h-14 disabled:opacity-50">
              <MessageCircle className="h-5 w-5" /> Finalizar por WhatsApp
            </Button>
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-tighter">AURA FEMENINA — {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
