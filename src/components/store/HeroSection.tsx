import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[90vh] md:h-[85vh] overflow-hidden">
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <img
          src="/banner-aura.jpg"
          alt="Modelo Aura Femenina"
          className="w-full h-full object-cover object-center md:object-top"
          loading="eager"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      {/* Text overlaid on bottom */}
      <div className="relative z-10 h-full w-full flex flex-col justify-end px-6 md:px-24 pb-16 md:pb-20">
        <div className="max-w-lg backdrop-blur-[2px] bg-white/10 p-6 md:p-8 rounded-sm">
          <p className="text-pink-300 text-[10px] md:text-xs tracking-[0.5em] font-black uppercase mb-4">
            Descubrí tu esencia
          </p>

          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.1] mb-6">
            TU AURA <br />
            <span className="font-display italic text-pink-300 font-normal">FEMENINA</span>
          </h1>

          <p className="text-white/80 text-sm md:text-base font-medium max-w-sm leading-relaxed mb-8">
            Prendas pensadas para resaltar tu belleza natural y potenciar tu confianza.
          </p>

          <Link to="/productos">
            <Button
              size="lg"
              className="bg-white text-foreground hover:bg-white/90 transition-all duration-500 font-bold tracking-[0.2em] text-[10px] uppercase px-10 py-6 rounded-none border-none"
            >
              VER COLECCIÓN
            </Button>
          </Link>
        </div>
      </div>

      {/* Decoración vertical */}
      <div className="absolute bottom-10 right-10 hidden md:block opacity-40 z-20">
        <div className="flex flex-col gap-2 items-center">
          <div className="w-px h-12 bg-white"></div>
          <p className="text-[9px] text-white tracking-[0.3em] [writing-mode:vertical-lr]">2026</p>
        </div>
      </div>
    </section>
  );
}
