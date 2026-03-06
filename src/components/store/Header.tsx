import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShoppingBag, X, User, ChevronDown, Search } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const categorias = [
  { label: "JEANS", to: "/productos?categoria=jeans" },
  { label: "REMERAS", to: "/productos?categoria=remeras" },
  { label: "VESTIDOS", to: "/productos?categoria=vestidos" },
  { label: "ACCESORIOS", to: "/productos?categoria=accesorios" },
  { label: "SALE", to: "/productos?categoria=sale" },
];

export default function Header() {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white border-b border-white/10">
      {/* Barra superior más legible */}
      <div className="hidden md:flex bg-zinc-900 text-[11px] tracking-[0.5em] h-10 items-center justify-center border-b border-white/5 uppercase font-bold text-zinc-300">
        Envíos a todo el país — 3 y 6 cuotas sin interés
      </div>

      {/* Contenedor principal - Aumentamos h-20 a h-28 para que sea más ancho */}
      <div className="container flex h-24 md:h-28 items-center justify-between px-6 md:px-12">
        
        {/* Menu Mobile */}
        <div className="flex md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="p-2">
                <Menu className="h-7 w-7" />
              </SheetTrigger>
              <SheetContent side="left" className="w-full p-0 bg-black text-white border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 px-8 py-8">
                  <span className="font-display text-2xl font-black tracking-[0.3em]">AURA</span>
                  <button onClick={() => setOpen(false)}><X className="h-8 w-8" /></button>
                </div>
                <nav className="flex flex-col p-8 gap-8">
                  <Link to="/" onClick={() => setOpen(false)} className="text-2xl font-black tracking-[0.2em] uppercase italic">INICIO</Link>
                  <div className="flex flex-col gap-6">
                    <p className="text-xs tracking-[0.3em] text-zinc-500 font-bold">CATEGORÍAS</p>
                    {categorias.map((cat) => (
                        <Link key={cat.to} to={cat.to} onClick={() => setOpen(false)} className="text-xl font-bold tracking-widest uppercase">
                        {cat.label}
                        </Link>
                    ))}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
        </div>

        {/* LOGO - Aumentamos el tamaño de text-2xl a text-3xl */}
        <Link to="/" className="font-display text-2xl md:text-4xl font-black tracking-[0.4em] uppercase transition-transform hover:scale-105">
          AURA<span className="font-light italic ml-2 text-zinc-400">FEMENINA</span>
        </Link>

        {/* LINKS CENTRALES - Aumentamos text-[11px] a text-[13px] y gap-10 a gap-14 */}
        <nav className="hidden md:flex items-center gap-14">
          <Link to="/" className="text-[13px] font-black tracking-[0.25em] hover:text-zinc-400 transition-colors uppercase">INICIO</Link>
          
          <div 
            className="relative h-28 flex items-center"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button className="flex items-center gap-2 text-[13px] font-black tracking-[0.25em] hover:text-zinc-400 transition-colors uppercase cursor-pointer">
              PRODUCTOS <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
                <div className="absolute top-[112px] left-[-20px] w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-black border border-white/10 p-3 shadow-2xl">
                        {categorias.map((cat) => (
                            <Link 
                                key={cat.to} 
                                to={cat.to} 
                                className="block px-6 py-4 text-[11px] font-bold tracking-[0.3em] uppercase hover:bg-white hover:text-black transition-colors"
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <Link to="/como-comprar" className="text-[13px] font-black tracking-[0.25em] hover:text-zinc-400 transition-colors uppercase">CÓMO COMPRAR</Link>
          <Link to="/contacto" className="text-[13px] font-black tracking-[0.25em] hover:text-zinc-400 transition-colors uppercase">CONTACTO</Link>
        </nav>

        {/* ICONOS DERECHA */}
        <div className="flex items-center gap-6">
            <Link to="/login" className="hidden md:block hover:text-zinc-400 transition-colors">
                <User className="h-6 w-6" />
            </Link>
            <Link to="/carrito" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                <ShoppingBag className="h-6 w-6" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-black text-[10px] font-black shadow-lg">
                        {itemCount}
                    </span>
                )}
            </Link>
        </div>
      </div>
    </header>
  );
}
