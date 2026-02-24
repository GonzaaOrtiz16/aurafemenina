import Layout from "@/components/store/Layout";
import { ShoppingBag, MessageCircle, CreditCard, Truck } from "lucide-react";

const steps = [
  {
    icon: ShoppingBag,
    title: "1. Elegí tus productos",
    description: "Navegá por nuestro catálogo, seleccioná el talle y agregá al carrito todo lo que te guste.",
  },
  {
    icon: MessageCircle,
    title: "2. Finalizá por WhatsApp",
    description: "Cuando tengas todo listo, hacé clic en 'Finalizar compra por WhatsApp'. Se enviará automáticamente tu pedido con todos los detalles.",
  },
  {
    icon: CreditCard,
    title: "3. Coordiná el pago",
    description: "Te confirmaremos la disponibilidad y coordinaremos el pago por transferencia, Mercado Pago o el medio que prefieras.",
  },
  {
    icon: Truck,
    title: "4. Recibí tu pedido",
    description: "Preparamos tu pedido y lo enviamos por Correo Argentino. Te compartimos el código de seguimiento para que lo rastrees.",
  },
];

export default function HowToBuy() {
  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-center mb-4">
          ¿Cómo comprar?
        </h1>
        <p className="font-body text-center text-muted-foreground mb-12 max-w-lg mx-auto">
          Comprar en AURA FEMENINA es fácil y rápido. Seguí estos simples pasos:
        </p>
        <div className="space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 items-start animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                <step.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
