import { Truck, MessageCircle, Tag, Instagram } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useEffect, useState, useCallback } from "react";

const benefits = [
  { icon: Truck, title: "ENVÍOS", subtitle: "¡Hacemos envíos a todo el país!" },
  { icon: MessageCircle, title: "ESCRIBINOS!", subtitle: "WhatsApp: 1134944228" },
  { icon: Tag, title: "COMPRA MÍNIMA", subtitle: "$100.000 para GBA e Interior. Sin mínimo en CABA y Zona Sur." },
];

function BenefitsCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % benefits.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 3000);
    return () => clearInterval(interval);
  }, [next]);

  const { icon: Icon, title, subtitle } = benefits[current];

  return (
    <div className="flex flex-col items-center text-center gap-3 min-h-[140px] justify-center">
      <div
        key={current}
        className="flex flex-col items-center text-center gap-3 animate-fade-in"
      >
        <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center">
          <Icon className="w-7 h-7 text-foreground stroke-[1.2px]" />
        </div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">{title}</h3>
        <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-2">
        {benefits.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-foreground scale-110" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

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
      <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center">
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
      <div className="py-12 md:py-20 border-b border-border">
        <div className="container mx-auto px-6">
          {/* Desktop: 3 columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-16">
            <AnimatedCard icon={Truck} title="ENVÍOS" subtitle="¡Hacemos envíos a todo el país!" delay={0} />
            <AnimatedCard icon={MessageCircle} title="ESCRIBINOS!" subtitle="WhatsApp: 1134944228" delay={150} />
            <AnimatedCard icon={Tag} title="COMPRA MÍNIMA" subtitle="$100.000 para GBA e Interior. Sin mínimo en CABA y Zona Sur." delay={300} />
          </div>

          {/* Mobile: auto carousel */}
          <div className="md:hidden">
            <BenefitsCarousel />
          </div>
        </div>
      </div>

      {/* Instagram */}
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
