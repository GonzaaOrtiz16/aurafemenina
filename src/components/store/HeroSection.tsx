import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] flex flex-col md:flex-row bg-white overflow-hidden">
      
      {/* COLUMNA IZQUIERDA: TEXTO (Fondo rosa pálido sólido para máxima limpieza) */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-[#FFF5F7] px-8 md:px-16 py-20 relative z-10">
        <div className="max-w-md animate-fade-in">
          <p className="text-pink-300 text-[10px] md:text-xs tracking-[0.6em] font-bold uppercase mb-4">
            Descubrí tu esencia
          </p>
          
          {/* Título más chico y delicado */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-light text-zinc-800 tracking-tight leading-[1.1] mb-6">
            TU AURA <br />
            <span className="font-serif italic text-pink-400 font-normal">FEMENINA</span>
          </h1>

          <p className="text-zinc-500 text-sm md:text-base font-light max-w-sm leading-relaxed mb-10">
            Prendas pensadas para resaltar tu belleza natural y potenciar tu confianza. 
            Conecta con tu feminidad de la manera más elegante.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Link to="/productos" className="w-full sm:w-auto">
              <Button size="lg" className="bg-pink-400 text-white hover:bg-pink-500 transition-all duration-500 font-bold tracking-[0.2em] text-[10px] uppercase px-10 py-6 rounded-none w-full border-none">
                VER COLECCIÓN
              </Button>
            </Link>
            <Link to="/como-comprar" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="bg-transparent text-zinc-400 border-zinc-200 hover:bg-white transition-all duration-500 font-bold tracking-[0.2em] text-[10px] uppercase px-10 py-6 rounded-none w-full">
                CÓMO COMPRAR
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: IMAGEN (Totalmente despejada) */}
      <div className="w-full md:w-1/2 h-[450px] md:h-full relative">
        <img
          src="/banner-aura.jpg" 
          alt="Modelo Aura Femenina"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Un pequeño degradado que "muere" antes de tocar a la modelo para dar suavidad al centro */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#FFF5F7] to-transparent hidden md:block" />
      </div>

      {/* Decoración 2026 vertical (estilo delicado) */}
      <div className="absolute bottom-10 left-10 hidden md:block opacity-30">
        <div className="flex flex-col gap-2 items-center">
            <div className="w-px h-12 bg-zinc-400"></div>
            <p className="text-[9px] text-zinc-500 tracking-[0.3em] [writing-mode:vertical-lr]">2026</p>
        </div>
      </div>
    </section>
  );
}
