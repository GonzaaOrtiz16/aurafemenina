import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative h-[90vh] w-full bg-black overflow-hidden flex items-center justify-center">
      {/* Imagen de fondo completa para evitar el efecto 'partido' */}
      <div className="absolute inset-0">
        <img
          src="/banner-aura.jpg"
          alt="AURA FEMENINA"
          className="h-full w-full object-cover object-center opacity-60"
          loading="eager"
        />
        {/* Capa de oscuridad que sube desde el fondo */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </div>

      {/* Texto Central de Impacto */}
      <div className="relative z-10 container flex flex-col items-center text-center px-4">
        <div className="max-w-4xl animate-fade-in space-y-4">
          <p className="text-white/60 text-[10px] md:text-xs tracking-[0.8em] font-bold uppercase mb-4">
            Aura Femenina Shop — SS26
          </p>
          
          <h1 className="font-display text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">
            ESTILO <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>URBANO</span>
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-12">
            <Link to="/productos" className="w-full md:w-auto">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 transition-all duration-300 font-black tracking-[0.3em] text-[10px] uppercase px-16 py-8 rounded-none w-full shadow-2xl">
                COMPRAR AHORA
              </Button>
            </Link>
            <Link to="/productos?categoria=sale" className="w-full md:w-auto">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white hover:text-black transition-all duration-300 font-black tracking-[0.3em] text-[10px] uppercase px-16 py-8 rounded-none w-full">
                VER REBAJAS
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Detalle decorativo lateral */}
      <div className="absolute bottom-12 left-10 hidden lg:flex items-center gap-4">
        <div className="w-12 h-[1px] bg-white/30"></div>
        <p className="text-[9px] text-white/30 tracking-[0.5em] font-bold uppercase">Summer 2026</p>
      </div>
    </section>
  );
}
