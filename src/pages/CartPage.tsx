import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import ShippingCalculator from "@/components/store/ShippingCalculator";
import { useCart } from "@/context/CartContext";
import { formatPrice, ZONE_LABELS } from "@/lib/shipping";
import { useShippingRates } from "@/hooks/useShippingRates";
import type { ShippingResult, ShippingZone, DeliveryMethod } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Trash2, MessageCircle, Truck, Store } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { trackAnalyticsEvent } from "@/lib/analytics";

interface ContactData { whatsapp: string; }

const STORE_NAME = "AURA FEMENINA";
const PICKUP_ADDRESS = "Consultar dirección por WhatsApp";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("shipping");
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [zone, setZone] = useState<ShippingZone | null>(null);
  const [address, setAddress] = useState("");
  const { data: contact } = useSiteSetting<ContactData>("contact");
  const { rates } = useShippingRates();
  const whatsappNumber = contact?.whatsapp || "5491134944228";

  const isPickup = deliveryMethod === "pickup";
  const shippingCost = isPickup ? 0 : (shipping?.cost || 0);
  const total = subtotal + shippingCost;
  const minimum = zone && !isPickup ? rates.minimums[zone] : 0;
  const meetsMinimum = minimum === 0 || subtotal >= minimum;

  const buildWhatsAppMessage = () => {
    let msg = `*${STORE_NAME} - Nuevo Pedido* 🛍️\n\n`;
    msg += `📦 *Productos:*\n`;
    items.forEach((item) => {
      const colorText = item.color ? ` - Color: ${item.color}` : "";
      msg += `• ${item.product.name} (Talle: ${item.size}${colorText}) x${item.quantity} - ${formatPrice(item.product.price * item.quantity)}\n`;
    });
    msg += `\n💰 *Subtotal:* ${formatPrice(subtotal)}\n`;
    
    if (isPickup) {
      msg += `🏪 *Método:* Retiro en local\n`;
    } else if (shipping) {
      msg += `🚚 *Envío:* ${formatPrice(shipping.cost)} (${shipping.method})\n`;
      if (address) msg += `📍 *Dirección:* ${address}\n`;
      if (zone) msg += `📌 *Zona:* ${ZONE_LABELS[zone]}\n`;
    }
    
    msg += `💵 *Total:* ${formatPrice(total)}\n`;
    msg += `\n_Instagram: @aurafemenina.oficial_`;
    return encodeURIComponent(msg);
  };

  const handleCheckout = async () => {
    if (!isPickup) {
      if (!shipping || !zone) { alert("Por favor, calculá el envío ingresando tu código postal."); return; }
      if (!meetsMinimum) { alert(`Para envíos a ${ZONE_LABELS[zone]} el mínimo de compra es de ${formatPrice(minimum)}. Te faltan ${formatPrice(minimum - subtotal)}.`); return; }
      if (address.trim() === "") { alert("Por favor, ingresá una dirección para el envío."); return; }
    }

    await trackAnalyticsEvent({
      eventType: "checkout_intent",
      path: "/carrito",
      orderRef: `cart-${Date.now()}`,
      elementKey: "checkout-whatsapp",
      metadata: {
        item_count: items.length,
        subtotal,
        total,
        delivery_method: deliveryMethod,
        zone,
      },
    });

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
              {!isPickup && shipping && <div className="flex justify-between font-body text-sm"><span>Envío ({shipping.method})</span><span className="font-semibold">{formatPrice(shipping.cost)}</span></div>}
              {isPickup && <div className="flex justify-between font-body text-sm"><span>Retiro en local</span><span className="font-semibold text-green-600">Gratis</span></div>}
              <div className="border-t border-border pt-3 flex justify-between font-body"><span className="font-semibold uppercase italic">Total</span><span className="text-lg font-bold">{formatPrice(total)}</span></div>
            </div>

            {/* Delivery Method Selection */}
            <div className="space-y-3">
              <label className="font-body text-sm font-medium">Método de entrega</label>
              <RadioGroup value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as DeliveryMethod)} className="grid grid-cols-2 gap-3">
                <Label
                  htmlFor="shipping"
                  className={`flex flex-col items-center gap-2 p-4 border rounded-sm cursor-pointer transition-colors ${
                    deliveryMethod === "shipping" ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <RadioGroupItem value="shipping" id="shipping" className="sr-only" />
                  <Truck className="h-5 w-5" />
                  <span className="font-body text-xs uppercase tracking-wider">Envío</span>
                </Label>
                <Label
                  htmlFor="pickup"
                  className={`flex flex-col items-center gap-2 p-4 border rounded-sm cursor-pointer transition-colors ${
                    deliveryMethod === "pickup" ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                  <Store className="h-5 w-5" />
                  <span className="font-body text-xs uppercase tracking-wider">Retiro</span>
                </Label>
              </RadioGroup>
            </div>

            {isPickup ? (
              <div className="border border-border rounded-sm p-4 bg-green-50 dark:bg-green-950/20">
                <div className="flex items-start gap-3">
                  <Store className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body text-sm font-medium text-green-700 dark:text-green-400">Retiro en local</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">{PICKUP_ADDRESS}</p>
                    <p className="font-body text-xs text-green-600 dark:text-green-400 mt-2 font-semibold">¡Sin costo de envío!</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <ShippingCalculator onShippingCalculated={setShipping} onZoneDetected={setZone} cartSubtotal={subtotal} />
                <div className="space-y-2">
                  <label className="font-body text-xs uppercase tracking-widest font-medium">Dirección de envío</label>
                  <Input placeholder="Calle, número, localidad" value={address} onChange={(e) => setAddress(e.target.value)}
                    className="font-body rounded-none border-border focus:border-foreground" />
                </div>
              </>
            )}

            <Button size="lg" onClick={handleCheckout} disabled={!isPickup && (!meetsMinimum && zone !== null)}
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
