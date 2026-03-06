import { Truck, MessageCircle, Tag, Instagram } from "lucide-react";

export default function StoreInfo() {
  return (
    <section className="w-full">
      {/* SECCIÓN SUPERIOR: Texto Grande y Negro */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            
            {/* Envíos */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-black">
                <Truck className="w-10 h-10 stroke-[1.5px]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-black tracking-tight text-black uppercase leading-none">
                  ENVÍOS
                </h3>
                <p className="text-sm text-black font-bold mt-1">
                  ¡Hacemos envíos a todo el país!
                </p>
              </div>
              <div className="hidden md:block h-16 w-[2px] bg-black/10 ml-auto" />
            </div>

            {/* Contacto WhatsApp */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-black">
                <MessageCircle className="w-10 h-10 stroke-[1.5px]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-black tracking-tight text-black uppercase leading-none">
                  ESCRIBINOS!
                </h3>
                <p className="text-sm text-black font-bold mt-1">
                  WhatsApp: 1134944228
                </p>
              </div>
              <div className="hidden md:block h-16 w-[2px] bg-black/10 ml-auto" />
            </div>

            {/* Compra Mínima */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-black">
                <Tag className="w-10 h-10 stroke-[1.5px]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-black tracking-tight text-black uppercase leading-none">
                  MARCA MAYORISTA
                </h3>
                <p className="text-sm text-black font-bold mt-1">
                  Mínimo de compra $ 100.000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Rosa Bebé con Instagram Resaltado */}
      <div className="bg-[#FFF1F2] py-16 border-t border-pink-100/50">
        <div className="container mx-auto px-6 flex justify-center">
          <a 
            href="https://instagram.com/aurafemenina.oficial" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-4 group transition-transform hover:scale-105"
          >
            <Instagram className="w-14 h-14 text-black stroke-[1.5px]" />
            <div className="text-center">
              <p className="text-xs tracking-[0.5em] text-black/70 uppercase font-black">
                Seguinos en Instagram
              </p>
              <p className="text-2xl md:text-4xl font-black tracking-tighter text-black mt-2 italic font-display">
                @aurafemenina.oficial
              </p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
