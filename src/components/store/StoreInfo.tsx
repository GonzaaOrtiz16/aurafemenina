import { Truck, MessageCircle, Tag, Instagram } from "lucide-react";

export default function StoreInfo() {
  const infoItems = [
    {
      icon: <Truck className="w-8 h-8 stroke-1" />,
      title: "ENVÍOS",
      description: "¡Hacemos envíos a todo el país!",
    },
    {
      icon: <MessageCircle className="w-8 h-8 stroke-1" />,
      title: "ESCRIBINOS!",
      description: "Por dudas o consultas comunicate al 1134944228",
    },
    {
      icon: <Tag className="w-8 h-8 stroke-1" />,
      title: "COMPRA MÍNIMA",
      description: "Mínimo de compra para envío $ 100.000",
    },
  ];

  return (
    <section className="w-full bg-white py-16 border-t border-zinc-100">
      <div className="container mx-auto px-6">
        {/* Fila de información superior */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center justify-center gap-6 group">
              <div className="text-zinc-400 group-hover:text-pink-400 transition-colors duration-300">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold tracking-[0.2em] text-zinc-800 uppercase">
                  {item.title}
                </h3>
                <p className="text-[11px] text-zinc-500 tracking-wide mt-1">
                  {item.description}
                </p>
              </div>
              {/* Divisor vertical estilo Nissie (solo en desktop y no en el último item) */}
              {index < infoItems.length - 1 && (
                <div className="hidden md:block h-12 w-px bg-zinc-200 ml-auto" />
              )}
            </div>
          ))}
        </div>

        {/* Sección de Instagram */}
        <div className="flex flex-col items-center justify-center pt-10 border-t border-zinc-50">
          <a 
            href="https://instagram.com/aurafemenina.oficial" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 group transition-transform hover:scale-105"
          >
            <Instagram className="w-10 h-10 text-zinc-800 group-hover:text-pink-400 transition-colors" />
            <div className="text-center">
              <p className="text-[10px] tracking-[0.4em] text-zinc-400 uppercase font-medium">Seguinos en Instagram</p>
              <p className="text-lg font-bold tracking-[0.1em] text-zinc-900">@aurafemenina.oficial</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
