import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative h-[90vh] min-h-[700px] w-full bg-[#121212] overflow-hidden flex items-center">
      {/* Lado Izquierdo: Texto y Contraste */}
      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-12 h-full">
        <div className="flex flex-col items-start text-left animate-fade-in px-4">
          <span className="text-white/50 text-xs tracking-[0.5em] font-bold mb-4 uppercase">
            Aura Femenina — SS25/26
          </span>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-6 italic uppercase">
            ESTILO <br /> 
            <span className="text-transparent border-t border-b border-white px-2">SIN</span> <br /> 
            LIMITES
          </h1>
          <p className="font-body text-sm md:text-base text-gray-400 mb-10 max-w-sm tracking-wide leading-relaxed">
            Prendas diseñadas para mujeres que buscan marcar la diferencia. Calidad premium en cada detalle.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/productos">
              <Button size="lg" className="bg-white text-black hover:bg-black hover:text-white transition-all duration-500 font-bold tracking-[0.2em] text-xs uppercase px-12 py-8 rounded-none border border-white">
                COMPRAR AHORA
              </Button>
            </Link>
            <Link to="/productos?categoria=sale">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white/30 hover:bg-white hover:text-black transition-all duration-500 font-bold tracking-[0.2em] text-xs uppercase px-12 py-8 rounded-none">
                VER SALE
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Lado Derecho: La Imagen con máscara de degradado */}
      <div className="absolute right-0 top-0 w-full lg:w-2/3 h-full overflow-hidden">
        <img
          src="/banner-aura.jpg"
          alt="AURA FEMENINA - Nueva Colección"
          className="h-full w-full object-cover object-[70%_center] opacity-80 lg:opacity-100"
          loading="eager"
        />
        {/* Degradado para fundir la imagen con el fondo oscuro del texto */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/40 to-transparent md:block" />
        <div className="absolute inset-0 bg-black/40 lg:hidden" /> {/* Oscurecedor extra para mobile */}
      </div>

      {/* Decoración Inferior */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
        <div className="flex flex-col gap-2">
            <div className="w-12 h-[1px] bg-white/50"></div>
            <p className="text-[10px] text-white/40 tracking-[0.3em] vertical-text">2026</p>
        </div>
      </div>
    </section>
  );
}
