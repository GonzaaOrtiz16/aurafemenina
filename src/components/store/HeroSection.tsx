import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen md:h-[85vh] md:min-h-[600px] flex flex-col md:flex-row bg-white overflow-hidden">
      
      {/* COLUMNA DE IMAGEN: En móvil va primero y es más alta */}
      <div className="w-full md:w-1/2 h-[60vh] md:h-full order-1 md:order-2 relative">
        <img
          src="/banner-aura.jpg" 
          alt="Modelo Aura Femenina"
          className="w-full h-full object-cover object-center md:object-top"
          loading="eager"
        />
        {/* Degradado para fundir con el texto en desktop */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FFF5F7] to-transparent hidden md:block" />
      </div>

      {/* COLUMNA DE TEXTO: Fondo rosa pálido */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#FFF5F7] px-6 md:px-16 py-12 md:py-20 order-2 md:order-1 relative z-10">
        <div className="max-w-md animate-fade-in text-center md:text-left">
          <p className="text-pink-400 text-[10px] md:text-xs tracking-[0.5em] font-black uppercase mb-4">
            Descubrí tu esencia
          </p>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-zinc-800 tracking-tight leading-[1.1] mb-6">
            TU AURA <br />
            <span className="font-serif italic text-pink-400 font-normal">FEMENINA</span>
          </h1>

          <p className="text-zinc-500 text-sm md:text-base font-medium max-w-sm leading-relaxed mb-8 mx-auto md:mx-0">
            Prendas pensadas para resaltar tu belleza natural y potenciar tu confianza. 
            Conecta con tu feminidad de la manera más elegante.
          </p>

          <div className="flex flex-col sm:flex-row items-center md:items-start gap-4">
            <Link to="/productos" className="w-full sm:w-auto">
              <Button size="lg" className="bg-black text-white hover:bg-zinc-800 transition-all duration-500 font-bold tracking-[0.2em] text-[10px] uppercase px-10 py-6 rounded-none w-full border-none">
                VER COLECCIÓN
              </Button>
            </Link>
            <Link to="/como-comprar" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="bg-transparent text-zinc-900 border-zinc-900 hover:bg-white transition-all duration-500 font-bold tracking-[0.2em] text-[10px] uppercase px-10 py-6 rounded-none w-full">
                CÓMO COMPRAR
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decoración 2026 vertical */}
      <div className="absolute bottom-10 left-10 hidden md:block opacity-30">
        <div className="flex flex-col gap-2 items-center">
            <div className="w-px h-12 bg-zinc-400"></div>
            <p className="text-[9px] text-zinc-500 tracking-[0.3em] [writing-mode:vertical-lr]">2026</p>
        </div>
      </div>
    </section>
  );
}
