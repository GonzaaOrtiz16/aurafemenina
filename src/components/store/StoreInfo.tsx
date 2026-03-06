import { Truck, MessageCircle, Tag, Instagram } from "lucide-react";

export default function StoreInfo() {
  return (
    <section className="w-full bg-white py-20 border-t border-zinc-100">
      <div className="container mx-auto px-6">
        {/* Fila de beneficios principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          
          {/* Envíos */}
          <div className="flex items-center justify-center gap-6 group">
            <div className="text-zinc-400 group-hover:text-pink-400 transition-colors duration-500">
              <Truck className="w-9 h-9 stroke-[1px]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold tracking-[0.2em] text-zinc-800 uppercase">ENVÍOS</h3>
              <p className="text-[11px] text-zinc-500 tracking-wide mt-1">¡Hacemos envíos a todo el país!</p>
            </div>
            <div className="hidden md:block h-12 w-px bg-zinc-200 ml-auto" />
          </div>

          {/* Contacto WhatsApp [cite: 2026-02-24] */}
          <div className="flex items-center justify-center gap-6 group">
            <div className="text-zinc-400 group-hover:text-pink-400 transition-colors duration-500">
              <MessageCircle className="w-9 h-9 stroke-[1px]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold tracking-[0.2em] text-zinc-800 uppercase">ESCRIBINOS!</h3>
              <p className="text-[11px] text-zinc-500 tracking-wide mt-1">Por dudas o consultas al 1134944228 [cite: 2026-02-24]</p>
            </div>
            <div className="hidden md:block h-12 w-px bg-zinc-200 ml-auto" />
          </div>

          {/* Compra Mínima Actualizada */}
          <div className="flex items-center justify-center gap-6 group">
            <div className="text-zinc-400 group-hover:text-pink-400 transition-colors duration-500">
              <Tag className="w-9 h-9 stroke-[1px]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold tracking-[0.2em] text-zinc-800 uppercase">MARCA MAYORISTA</h3>
              <p className="text-[11px] text-zinc-500 tracking-wide mt-1">Mínimo de compra para envío $ 100.000</p>
            </div>
          </div>
        </div>

        {/* Sección de Instagram centralizada */}
        <div className="flex flex-col items-center justify-center pt-12 border-t border-zinc-50">
          <a 
            href="https://instagram.com/aurafemenina.oficial" 
            target="_blank" 
            className="flex flex-col items-center gap-4 group transition-transform hover:scale-105"
          >
            <Instagram className="w-12 h-12 text-zinc-800 group-hover:text-pink-400 transition-colors duration-500" />
            <div className="text-center">
              <p className="text-[10px] tracking-[0.5em] text-zinc-400 uppercase font-semibold">Seguinos en Instagram</p>
              <p className="text-xl font-bold tracking-[0.1em] text-zinc-900 mt-1">@aurafemenina.oficial [cite: 2026-02-24]</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
