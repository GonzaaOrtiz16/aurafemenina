import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";

export default function HeroSection() {
  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      <img
        src={heroBanner}
        alt="AURELIA - Moda Femenina"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-foreground/30" />
      <div className="relative flex h-full items-center justify-center text-center">
        <div className="container animate-fade-in">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-primary-foreground tracking-wider mb-4">
            NUEVA COLECCIÓN
          </h1>
          <p className="font-body text-base md:text-lg text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Descubrí las últimas tendencias en moda femenina
          </p>
          <Link to="/productos">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-body tracking-wider text-sm uppercase px-8">
              Ver productos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
