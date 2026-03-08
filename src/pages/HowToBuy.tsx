import Layout from "@/components/store/Layout";
import { ShoppingBag, MessageCircle, CreditCard, Truck } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

interface Step {
  title: string;
  description: string;
}

const icons = [ShoppingBag, MessageCircle, CreditCard, Truck];

export default function HowToBuy() {
  const { data: steps, isLoading } = useSiteSetting<Step[]>("how_to_buy");

  const items = steps || [
    { title: "1. Elegí tus productos", description: "Navegá por nuestro catálogo, seleccioná el talle y agregá al carrito todo lo que te guste." },
    { title: "2. Finalizá por WhatsApp", description: "Cuando tengas todo listo, hacé clic en 'Finalizar compra por WhatsApp'." },
    { title: "3. Coordiná el pago", description: "Te confirmaremos la disponibilidad y coordinaremos el pago." },
    { title: "4. Recibí tu pedido", description: "Preparamos tu pedido y lo enviamos por Correo Argentino." },
  ];

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-center mb-4">¿Cómo comprar?</h1>
        <p className="font-body text-center text-muted-foreground mb-12 max-w-lg mx-auto">
          Comprar en AURA FEMENINA es fácil y rápido. Seguí estos simples pasos:
        </p>
        {isLoading ? (
          <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : (
          <div className="space-y-8">
            {items.map((step, i) => {
              const Icon = icons[i % icons.length];
              return (
                <div key={i} className="flex gap-6 items-start animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
