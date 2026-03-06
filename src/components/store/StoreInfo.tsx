import { Truck, MessageCircle, Tag, Instagram } from "lucide-react";

export default function StoreInfo() {
  return (
    <section className="w-full overflow-hidden bg-white">
      {/* SECCIÓN DE BENEFICIOS: Desktop (3 columnas) / Móvil (Carrusel con puntos) */}
      <div className="py-12 md:py-20 border-b border-zinc-100">
        <div className="container mx-auto px-6">
          {/* Grilla para Desktop */}
          <div className="hidden md:grid md:grid-cols-3 gap-16">
            <div className="flex items-start gap-4 relative">
              <Truck className="w-10 h-10 text-black stroke-[1.5px]" />
              <div>
                <h3 className="text-lg font-black text-black uppercase">ENVÍOS</h3>
                <p className="text-[13px] text-black font-bold mt-1">¡Hacemos envíos a todo el país!</p>
              </div>
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 h-12 w-px bg-zinc-200" />
            </div>

            <div className="flex items-start gap-4 relative">
              <MessageCircle className="w-10 h-10 text-black stroke-[1.5px]" />
              <div>
                <h3 className="text-lg font-black text-black uppercase">ESCRIBINOS!</h3>
                <p className="text-[13px] text-black font-bold mt-1">WhatsApp: 1134944228</p>
              </div>
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 h-12 w-px bg-zinc-200" />
            </div>

            <div className="flex items-start gap-4">
              <Tag className="w-10 h-10 text-black stroke-[1.5px]" />
              <div>
                <h3 className="text-lg font-black text-black uppercase leading-tight">MARCA MAYORISTA</h3>
                <p className="text-[13px] text-black font-bold mt-1">Mínimo de compra $ 100.000</p>
              </div>
            </div>
          </div>

          {/* Versión Móvil: Una sola tarjeta visible con puntos abajo */}
          <div className="md:hidden flex flex-col items-center text-center">
            <div className="flex flex-col items-center gap-3">
              <Tag className="w-12 h-12 text-black stroke-[1px]" />
              <h3 className="text-sm font-black text-black uppercase tracking-tighter">MARCA MAYORISTA</h3>
              <p className="text-sm font-medium text-zinc-600">Mínimo de compra $ 100.000</p>
            </div>
            
            {/* Puntos de navegación del slider */}
            <div className="flex gap-2 mt-6">
              <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
              <div className="w-2 h-2 rounded-full bg-zinc-800"></div> {/* El punto activo */}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN INSTAGRAM: Estilo Nissie Denim (Logo + Texto al lado) */}
      <div className="bg-[#F7F7F7] py-10 md:py-16">
        <div className="container mx-auto px-6 flex justify-center">
          <a 
            href="https://instagram.com/aurafemenina.oficial" 
            target="_blank" 
            className="flex items-center gap-4 md:gap-6 group transition-opacity hover:opacity-80"
          >
            <Instagram className="w-12 h-12 md:w-16 md:h-16 text-black" />
            <div className="flex flex-col items-start">
              <p className="text-[10px] md:text-xs tracking-[0.2em] text-zinc-500 font-bold uppercase">SEGUINOS EN INSTAGRAM</p>
              <p className="text-xl md:text-4xl font-black text-black tracking-tighter">@aurafemenina.oficial</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
