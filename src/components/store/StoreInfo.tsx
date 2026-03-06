import { Truck, MessageCircle, Tag, Instagram } from "lucide-react";

export default function StoreInfo() {
  return (
    <section className="w-full overflow-hidden">
      {/* SECCIÓN BLANCA: Beneficios apilables en móvil */}
      <div className="bg-white py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:grid md:grid-cols-3 gap-12 md:gap-16">
            
            {/* Ítem 1 */}
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 relative">
              <Truck className="w-12 h-12 md:w-10 md:h-10 text-black stroke-[1.5px]" />
              <div>
                <h3 className="text-xl md:text-lg font-black text-black uppercase">ENVÍOS</h3>
                <p className="text-sm md:text-[13px] text-black font-bold mt-1">¡Hacemos envíos a todo el país!</p>
              </div>
              <div className="hidden md:block absolute -right-8 top-1/2 -translate-y-1/2 h-12 w-px bg-zinc-200" />
            </div>

            {/* Ítem 2 [cite: 2026-02-24] */}
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 relative">
              <MessageCircle className="w-12 h-12 md:w-10 md:h-10 text-black stroke-[1.5px]" />
              <div>
                <h3 className="text-xl md:text-lg font-black text-black uppercase">ESCRIBINOS!</h3>
                <p className="text-sm md:text-[13px] text-black font-bold mt-1">WhatsApp: 1134944228</p>
              </div>
              <div className="hidden md:block absolute -right-8 top-1/2 -translate-y-1/2 h-12 w-px bg-zinc-200" />
            </div>

            {/* Ítem 3 */}
            <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
              <Tag className="w-12 h-12 md:w-10 md:h-10 text-black stroke-[1.5px]" />
              <div>
                <h3 className="text-xl md:text-lg font-black text-black uppercase leading-tight">MARCA MAYORISTA</h3>
                <p className="text-sm md:text-[13px] text-black font-bold mt-1">Mínimo de compra $ 100.000</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* SECCIÓN ROSA: Instagram con letras Gigantes */}
      <div className="bg-[#FFF1F2] py-14 border-t border-pink-100">
        <div className="container mx-auto px-6 flex justify-center text-center">
          <a href="https://instagram.com/aurafemenina.oficial" target="_blank" className="group">
            <Instagram className="w-14 h-14 text-black mx-auto mb-4" />
            <p className="text-[10px] md:text-xs tracking-[0.5em] text-black font-black uppercase opacity-70">SEGUINOS EN INSTAGRAM</p>
            <p className="text-2xl md:text-4xl font-black text-black mt-2 italic">@aurafemenina.oficial</p>
          </a>
        </div>
      </div>
    </section>
  );
}
