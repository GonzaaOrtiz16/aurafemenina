import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full h-[95vh] md:h-[90vh] overflow-hidden">
      {/* Full-bleed background image with zoom animation */}
      <div className="absolute inset-0">
        <img
          src="/banner-aura.jpg"
          alt="Modelo Aura Femenina"
          className={`w-full h-full object-cover object-center md:object-top transition-transform duration-[2000ms] ease-out ${
            loaded ? "scale-100" : "scale-110"
          }`}
          loading="eager"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
      </div>

      {/* Animated text overlaid on bottom */}
      <div className="relative z-10 h-full w-full flex flex-col justify-end px-6 md:px-24 pb-16 md:pb-24">
        <div
          className={`max-w-xl transition-all duration-1000 ease-out ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="backdrop-blur-sm bg-white/5 p-6 md:p-10 border border-white/10">
            <p
              className={`text-accent text-[10px] md:text-xs tracking-[0.5em] font-black uppercase mb-4 transition-all duration-700 delay-300 ${
                loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
              Descubrí tu esencia
            </p>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.1] mb-6">
              <span
                className={`block transition-all duration-700 delay-500 ${
                  loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                TU AURA
              </span>
              <span
                className={`block font-display italic text-accent font-normal transition-all duration-700 delay-700 ${
                  loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                FEMENINA
              </span>
            </h1>

            <p
              className={`text-white/80 text-sm md:text-base font-medium max-w-sm leading-relaxed mb-8 transition-all duration-700 delay-[900ms] ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            >
              Prendas pensadas para resaltar tu belleza natural y potenciar tu confianza.
            </p>

            <div
              className={`transition-all duration-700 delay-[1100ms] ${
                loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Link to="/productos">
                <Button
                  size="lg"
                  className="bg-white text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-500 font-bold tracking-[0.2em] text-[10px] uppercase px-10 py-6 rounded-none border-none"
                >
                  VER COLECCIÓN
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 transition-all duration-700 delay-[1400ms] ${
          loaded ? "opacity-60" : "opacity-0"
        }`}
      >
        <div className="w-px h-8 bg-white animate-pulse" />
        <p className="text-[8px] text-white tracking-[0.3em] uppercase font-bold">Scroll</p>
      </div>

      {/* Year badge */}
      <div className="absolute bottom-10 right-10 hidden md:block opacity-30 z-20">
        <div className="flex flex-col gap-2 items-center">
          <div className="w-px h-12 bg-white" />
          <p className="text-[9px] text-white tracking-[0.3em] [writing-mode:vertical-lr]">2026</p>
        </div>
      </div>
    </section>
  );
}
