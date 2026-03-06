import { Truck, MessageCircle, Tag, Instagram } from "lucide-react";

export default function StoreInfo() {
  return (
    <section className="w-full">
      {/* SECCIÓN SUPERIOR: Blanco Puro */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Envíos */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-zinc-400">
                <Truck className="w-8 h-8 stroke-[1px]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-zinc-800 uppercase">ENVÍOS</h3>
                <p className="text-[10px] text-zinc-500 tracking-wide mt-1">¡Hacemos envíos a todo el país!</p>
              </div>
              <div className="hidden md:block h-10 w-px bg-zinc-100 ml-auto" />
            </div>

            {/* Contacto WhatsApp */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-zinc-400">
                <MessageCircle className="w-8 h-8 stroke-[1px]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-zinc-800 uppercase">ESCRIBINOS!</h3>
                <p className="text-[10px] text-zinc-500 tracking-wide mt-1">Dudas o consultas al 1134944228</p>
              </div>
              <div className="hidden md:block h-10 w-px bg-zinc-100 ml-auto" />
            </div>

            {/* Compra Mínima */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-zinc-400">
                <Tag className="w-8 h-8 stroke-[1px]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[11px] font-bold tracking-[0.2em] text-zinc-800 uppercase">MARCA MAYORISTA</h3>
                <p className="text-[10px] text-zinc-500 tracking-wide mt-1">Mínimo de compra para envío $ 100.000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Rosa Bebé con Instagram en Negro */}
      <div className="bg-[#FFF1F2] py-14 border-t border-pink-100/50">
        <div className="container mx-auto px-6 flex justify-center">
          <a 
            href="https://instagram.com/aurafemenina.oficial" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 group transition-transform hover:scale-105"
          >
            <Instagram className="w-12 h-12 text-black stroke-[1.2px]" />
            <div className="text-center">
              <p className="text-[10px] tracking-[0.5em] text-black/60 uppercase font-bold">
                Seguinos en Instagram
              </p>
              <p className="text-xl md:text-2xl font-black tracking-tight text-black mt-1 italic font-display">
                @aurafemenina.oficial
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
