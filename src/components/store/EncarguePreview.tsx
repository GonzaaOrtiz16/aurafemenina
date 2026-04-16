import { memo } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import EncargueCarousel from "./EncargueCarousel";

function EncarguePreview() {
  const { ref, isVisible } = useScrollAnimation(0.15);

  return (
    <section className="bg-secondary/30 py-20 md:py-32 overflow-hidden content-visibility-auto">
      <div
        ref={ref}
        className={`container px-6 md:px-12 flex flex-col md:flex-row items-center gap-12 md:gap-20 transition-[opacity,transform] duration-1000 will-change-[opacity,transform] ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
            <Sparkles className="w-3 h-3 text-accent" />
            <p className="text-[9px] tracking-[0.5em] font-bold uppercase text-accent">
              Exclusivo
            </p>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-light tracking-wide text-foreground mb-6">
            Pedidos por{" "}
            <span className="font-display italic text-accent">Encargue</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto md:mx-0 mb-10">
            Prendas exclusivas que no están en stock. Elegí la que más te guste y coordinamos la
            entrega por WhatsApp.
          </p>
          <Link
            to="/encargues"
            className="group relative inline-block border border-accent/40 px-12 py-5 font-body text-[10px] font-bold uppercase tracking-[0.35em] text-foreground hover:text-accent-foreground transition-all duration-700 overflow-hidden"
          >
            <span className="relative z-10">Ver encargues</span>
            <div className="absolute inset-0 bg-accent translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
          </Link>
        </div>
        <div className="flex-1">
          <EncargueCarousel />
        </div>
      </div>
    </section>
  );
}

export default memo(EncarguePreview);
