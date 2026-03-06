import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[90vh] md:h-[85vh] overflow-hidden bg-white">
      
      {/* 1. IMAGEN DE FONDO: Ahora ocupa todo el ancho y alto */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/banner-aura.jpg" 
          alt="Modelo Aura Femenina"
          className="w-full h-full object-cover object-center md:object-top"
          loading="eager"
        />
        {/* Capa sutil de oscurecimiento para mejorar la lectura del texto */}
        <div className="absolute inset-0 bg-black/5 md:bg-transparent" />
      </div>

      {/* 2. CONTENIDO SOBREPUESTO: Posicionado absolutamente sobre la imagen */}
      <div className="relative z-10 h-full w-full flex flex-col justify-end md:justify-center items-center md:items-start px-6 md:px-24 pb-16 md:pb-0">
        
        {/* Caja de texto con efecto glassmorphism (opcional, igual a la imagen) */}
        <div className="max-w-md text-center md:text-left bg-white/30 backdrop-blur-md md:bg-transparent p-6 md:p-0 rounded-sm">
          <p className="text-pink-500 md:text-pink-400 text-[10px] md:text-xs tracking-[0.5em] font-black uppercase mb-4 drop-shadow-sm">
            Descubrí tu esencia
          </p>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-zinc-900 md:text-zinc-800 tracking-tight leading-[1.1] mb-6">
            TU AURA <br />
            <span className="font-serif italic text-pink-500 md:text-pink-400 font-normal">FEMENINA</span>
          </h1>

          <p className="text-zinc-800 md:text-zinc-500 text-sm md:text-base font-medium max-w-sm leading-relaxed mb-8 mx-auto md:mx-0">
            Prendas pensadas para resaltar tu belleza natural y potenciar tu confianza. 
            Conecta con tu feminidad de la manera más elegante.
          </p>

          <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
            <Link to="/productos" className="w-full sm:w-auto">
              <Button size="lg" className="bg-black text-white hover:bg-zinc-800 transition-all duration-500 font-bold tracking-[0.2em] text-[10px] uppercase px-10 py-6 rounded-none w-full border-none">
                VER COLECCIÓN
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decoración 2026 vertical */}
      <div className="absolute bottom-10 left-10 hidden md:block opacity-30 z-20">
        <div className="flex flex-col gap-2 items-center">
            <div className="w-px h-12 bg-zinc-800"></div>
            <p className="text-[9px] text-zinc-800 tracking-[0.3em] [writing-mode:vertical-lr]">2026</p>
        </div>
      </div>
    </section>
  );
}
