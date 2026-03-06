// src/components/store/HeroSection.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative h-[90vh] min-h-[700px] w-full bg-white overflow-hidden flex items-center justify-center">
      
      {/* DIFUMINADO ROSA DE FONDO (reemplazando el difuminado oscuro de image_11.png) */}
      <div className="absolute inset-0">
        {/* Imagen de fondo completa (la de la modelo) */}
        <img
          src="/banner-aura.jpg"
          alt="Tu Aura Femenina"
          className="h-full w-full object-cover object-center"
          loading="eager"
        />
        {/* Capa de difuminado rosa suave (Gradient) desde la izquierda */}
        {/* Un gradiente de blanco difuso a rosa suave que se fusiona con la imagen de la modelo */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-50/95 via-pink-50/50 to-transparent" />
        {/* Un gradiente sutil desde abajo para suavizar la base de la imagen con la base de la sección */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
      </div>

      {/* CONTENIDO TEXTUAL (Diseño anterior preferido, a la izquierda) */}
      {/* Usamos grid para estructurar la sección de texto a la izquierda y la imagen a la derecha */}
      <div className="relative z-10 container grid grid-cols-1 md:grid-cols-12 items-center h-full">
        {/* Columna de texto a la izquierda */}
        <div className="md:col-span-6 flex flex-col items-start text-left animate-fade-in px-8 md:px-20 py-20 bg-white/20 backdrop-blur-sm rounded-none">
          
          <p className="text-pink-900/70 text-sm md:text-base tracking-[0.5em] font-medium uppercase mb-6 drop-shadow-sm">
            Descubrí tu esencia
          </p>
          
          {/* Título: "TU AURA" y abajo "FEMENINA" */}
          {/* Aumentar el tamaño de fuente como se solicitó */}
          <h1 className="font-display text-7xl md:text-8xl lg:text-9xl font-light text-pink-950 tracking-tight leading-[1] mb-2 drop-shadow-lg">
            TU AURA <br />
            {/* FEMENINA en itálico y negrita rosa (como antes, pero en rosa suave) */}
            <span className="font-bold italic text-pink-400">FEMENINA</span>
          </h1>

          <p className="text-zinc-600 text-lg md:text-xl font-light max-w-lg mt-8 leading-relaxed drop-shadow-sm">
            Prendas pensadas para resaltar tu belleza natural y potenciar tu confianza. Conecta con tu feminidad de la manera más elegante y auténtica.
          </p>

          <div className="flex flex-col md:flex-row items-start gap-6 pt-12">
            <Link to="/productos" className="w-full md:w-auto">
              {/* Botón sólido recto de image_10.png pero en rosa */}
              <Button size="lg" className="bg-pink-400 text-white hover:bg-pink-500 transition-all duration-500 font-bold tracking-[0.3em] text-xs uppercase px-16 py-8 rounded-none w-full shadow-lg shadow-pink-100 border-none">
                VER COLECCIÓN
              </Button>
            </Link>
            <Link to="/como-comprar" className="w-full md:w-auto">
              {/* Botón con contorno recto de image_10.png pero en rosa */}
              <Button size="lg" variant="outline" className="bg-transparent text-pink-600 border-pink-300 hover:bg-pink-50 transition-all duration-500 font-bold tracking-[0.3em] text-xs uppercase px-16 py-8 rounded-none w-full">
                CÓMO COMPRAR
              </Button>
            </Link>
          </div>
        </div>

        {/* Columna de imagen a la derecha (50%) */}
        <div className="md:col-span-6 h-full w-full">
          {/* No hay contenido de imagen aquí, ya que la imagen de fondo de ancho completo sirve como panel derecho */}
          {/* El degradado rosa de la capa de fondo se encarga de difuminar el borde izquierdo de la imagen */}
        </div>
      </div>

      {/* Detalle flotante elegante (mantenido, en rosa pálido) */}
      <div className="absolute bottom-16 right-16 hidden lg:block animate-pulse">
        <p className="text-pink-100 text-[80px] font-display italic opacity-50 select-none">Be unique</p>
      </div>

      {/* Decoración vertical (como image_10.png, en rosa pálido) */}
      <div className="absolute bottom-10 left-10 hidden md:block">
        <div className="flex flex-col gap-2 items-center">
            <div className="w-px h-16 bg-pink-100"></div>
            <p className="text-[10px] text-pink-100 tracking-[0.3em] vertical-text">2026</p>
        </div>
      </div>

    </section>
  );
}
