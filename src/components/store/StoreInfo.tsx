import { Truck, MessageCircle, Tag, Instagram } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

function AnimatedCard({
  icon: Icon,
  title,
  subtitle,
  delay,
}: {
  icon: typeof Truck;
  title: string;
  subtitle: string;
  delay: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.2);
  return (
    <div
      ref={ref}
      className={`flex flex-col items-center text-center gap-3 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center group-hover:border-accent transition-colors">
        <Icon className="w-7 h-7 text-foreground stroke-[1.2px]" />
      </div>
      <h3 className="text-sm font-black text-foreground uppercase tracking-wider">{title}</h3>
      <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
    </div>
  );
}

export default function StoreInfo() {
  const { ref: igRef, isVisible: igVisible } = useScrollAnimation(0.2);

  return (
    <section className="w-full overflow-hidden bg-card">
      {/* Benefits grid */}
      <div className="py-16 md:py-20 border-b border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            <AnimatedCard icon={Truck} title="ENVÍOS" subtitle="¡Hacemos envíos a todo el país!" delay={0} />
            <AnimatedCard icon={MessageCircle} title="ESCRIBINOS!" subtitle="WhatsApp: 1134944228" delay={150} />
            <AnimatedCard icon={Tag} title="MARCA MAYORISTA" subtitle="Mínimo de compra $ 100.000" delay={300} />
          </div>
        </div>
      </div>

      {/* Instagram section */}
      <div className="bg-secondary py-12 md:py-16">
        <div
          ref={igRef}
          className={`container mx-auto px-6 flex justify-center transition-all duration-700 ${
            igVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <a
            href="https://instagram.com/aurafemenina.oficial"
            target="_blank"
            className="flex items-center gap-4 md:gap-6 group transition-all hover:opacity-80 hover:scale-[1.02] duration-500"
          >
            <Instagram className="w-12 h-12 md:w-16 md:h-16 text-foreground group-hover:text-accent transition-colors duration-500" />
            <div className="flex flex-col items-start">
              <p className="text-[10px] md:text-xs tracking-[0.2em] text-muted-foreground font-bold uppercase">
                SEGUINOS EN INSTAGRAM
              </p>
              <p className="text-xl md:text-4xl font-black text-foreground tracking-tighter">
                @aurafemenina.oficial
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
