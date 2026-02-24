import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/store/Layout";
import ShippingCalculator from "@/components/store/ShippingCalculator";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/shipping";
import { ShippingResult } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "5491134944228";
const STORE_NAME = "AURA FEMENINA";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const [shipping, setShipping] = useState<ShippingResult | null>(null);
  const [address, setAddress] = useState("");

  const total = subtotal + (shipping?.cost || 0);

  const buildWhatsAppMessage = () => {
    let msg = `*${STORE_NAME} - Nuevo Pedido* 🛍️\n\n`;
    msg += `📦 *Productos:*\n`;
    items.forEach((item) => {
      msg += `• ${item.product.name} (Talle: ${item.size}) x${item.quantity} - ${formatPrice(item.product.price * item.quantity)}\n`;
    });
    msg += `\n💰 *Subtotal:* ${formatPrice(subtotal)}\n`;
    if (shipping) {
      msg += `🚚 *Envío:* ${formatPrice(shipping.cost)} (${shipping.method})\n`;
    }
    msg += `💵 *Total:* ${formatPrice(total)}\n`;
    if (address) {
      msg += `\n📍 *Dirección:* ${address}\n`;
    }
    return encodeURIComponent(msg);
  };

  const handleCheckout = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMessage()}`;
    window.open(url, "_blank");
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl mb-4">Tu carrito está vacío</h1>
          <p className="font-body text-muted-foreground mb-6">
            Agregá productos para comenzar tu compra.
          </p>
          <Link
            to="/productos"
            className="inline-block border border-primary px-8 py-3 font-body text-sm font-medium uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-8">
          Tu carrito
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.size}`}
                className="flex gap-4 border border-border rounded-sm p-4"
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-24 w-20 object-cover rounded-sm bg-secondary flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-body text-sm font-medium truncate">
                    {item.product.name}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">
                    Talle: {item.size}
                  </p>
                  <p className="font-body text-sm font-semibold mt-1">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      className="h-7 w-7 flex items-center justify-center border border-border rounded-sm hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="font-body text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      className="h-7 w-7 flex items-center justify-center border border-border rounded-sm hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <div className="border border-border rounded-sm p-6 space-y-4">
              <h2 className="font-display text-xl font-semibold">Resumen</h2>
              <div className="flex justify-between font-body text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              {shipping && (
                <div className="flex justify-between font-body text-sm">
                  <span>Envío</span>
                  <span className="font-semibold">{formatPrice(shipping.cost)}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-body">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">{formatPrice(total)}</span>
              </div>
            </div>

            <ShippingCalculator onShippingCalculated={setShipping} />

            <div className="space-y-2">
              <label className="font-body text-sm font-medium">Dirección de envío</label>
              <Input
                placeholder="Ingresá tu dirección completa"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="font-body"
              />
            </div>

            <Button
              size="lg"
              onClick={handleCheckout}
              className="w-full gap-2 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90 font-body text-sm uppercase tracking-wider"
            >
              <MessageCircle className="h-4 w-4" /> Finalizar compra por WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
