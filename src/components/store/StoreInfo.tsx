import { Truck, MessageCircle, Tag, Instagram } from "lucide-react";

export default function StoreInfo() {
  return (
    // CAMBIO CLAVE: Cambiamos bg-white por bg-pink-50 (Rosa Bebé)
    <section className="w-full bg-[#FFF1F2] py-20 border-t border-pink-100/50">
      <div className="container mx-auto px-6 md:px-10">
        
        {/* Fila de beneficios principales */}
        {/* CAMBIO CLAVE: Usamos border-pink-100 para los divisores suaves */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 border-b border-pink-100/50 pb-20">
          
          {/* Envíos */}
          <div className="flex items-center justify-center gap-6 group">
            {/* CAMBIO CLAVE: Iconos en Negro Resaltado */}
            <div className="text-black group-hover:text-pink-600 transition-colors duration-500">
              <Truck className="w-10 h-10 stroke-[1.5px]" />
            </div>
            <div className="flex flex-col">
              {/* CAMBIO CLAVE: Títulos y Textos en Negro */}
              <h3 className="text-sm font-bold tracking-[0.25em] text-black uppercase">
                ENVÍOS
              </h3>
              <p className="text-[11px] text-zinc-900 tracking-wide mt-1 font-medium">
                ¡Hacemos envíos a todo el país!
              </p>
            </div>
            {/* CAMBIO CLAVE: Divisor en Rosa Suave */}
            <div className="hidden md:block h-12 w-px bg-pink-100/70 ml-auto" />
          </div>

          {/* Contacto WhatsApp [cite: 2026-02-24] */}
          <div className="flex items-center justify-center gap-6 group">
            {/* CAMBIO CLAVE: Iconos en Negro Resaltado */}
            <div className="text-black group-hover:text-pink-600 transition-colors duration-500">
              <MessageCircle className="w-10 h-10 stroke-[1.5px]" />
            </div>
            <div className="flex flex-col">
              {/* CAMBIO CLAVE: Títulos y Textos en Negro */}
              <h3 className="text-sm font-bold tracking-[0.25em] text-black uppercase">
                ESCRIBINOS!
              </h3>
              <p className="text-[11px] text-zinc-900 tracking-wide mt-1 font-medium">
                Dudas o consultas al 1134944228 [cite: 2026-02-24]
              </p>
            </div>
            {/* CAMBIO CLAVE: Divisor en Rosa Suave */}
            <div className="hidden md:block h-12 w-px bg-pink-100/70 ml-auto" />
          </div>

          {/* Compra Mínima Actualizada */}
          <div className="flex items-center justify-center gap-6 group">
            {/* CAMBIO CLAVE: Iconos en Negro Resaltado */}
            <div className="text-black group-hover:text-pink-600 transition-colors duration-500">
              <Tag className="w-10 h-10 stroke-[1.5px]" />
            </div>
            <div className="flex flex-col">
              {/* CAMBIO CLAVE: Títulos y Textos en Negro */}
              <h3 className="text-sm font-bold tracking-[0.25em] text-black uppercase">
                MARCA MAYORISTA
              </h3>
              <p className="text-[11px] text-zinc-900 tracking-wide mt-1 font-medium">
                Mínimo de compra para envío $ 100.000
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Instagram centralizada */}
        <div className="flex flex-col items-center justify-center pt-10">
          <a 
            href="https://instagram.com/aurafemenina.oficial" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 group transition-transform hover:scale-105"
          >
            {/* CAMBIO CLAVE: Icono Instagram Negro */}
            <Instagram className="w-14 h-14 text-black group-hover:text-pink-600 transition-colors duration-500 stroke-[1.5px]" />
            <div className="text-center">
              {/* CAMBIO CLAVE: Textos Instagram Negros */}
              <p className="text-[10px] tracking-[0.6em] text-zinc-900 uppercase font-semibold">
                Seguinos en Instagram
              </p>
              <p className="text-2xl font-black tracking-[0.1em] text-black mt-2 italic font-display">
                @aurafemenina.oficial [cite: 2026-02-24]
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
