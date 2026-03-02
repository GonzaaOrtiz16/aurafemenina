import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
      <img
        src="/banner-aura.jpg"
        alt="AURA FEMENINA - Nueva Colección"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
      />
      {/* Capa oscura para que el texto resalte más */}
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative flex h-full items-center justify-center text-center px-4">
        <div className="container animate-fade-in">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-white tracking-wider mb-4 drop-shadow-lg">
            NUEVA COLECCIÓN
          </h1>
          <p className="font-body text-base md:text-lg text-white/90 mb-8 max-w-md mx-auto drop-shadow-md">
            Descubrí las últimas tendencias en moda femenina
          </p>
          <Link to="/productos">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 font-body tracking-wider text-sm uppercase px-10 py-6 border-none">
              Ver productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

