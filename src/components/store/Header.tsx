import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShoppingBag, X, User, ChevronDown } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-pink-100">
      {/* Barra superior delicada */}
      <div className="hidden md:flex bg-pink-50 text-[11px] tracking-[0.3em] h-10 items-center justify-center uppercase font-medium text-pink-400">
        Resaltá tu belleza única — Envíos a todo el país
      </div>

      <div className="container flex h-24 md:h-28 items-center justify-between px-6 md:px-12">
        
        {/* Mobile menu */}
        <div className="flex md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="p-2">
                <Menu className="h-7 w-7 text-pink-900" />
              </SheetTrigger>
              <SheetContent side="left" className="w-full p-0 bg-white">
                <nav className="flex flex-col p-8 gap-8 text-pink-900">
                  <Link to="/" onClick={() => setOpen(false)} className="text-2xl font-light tracking-[0.2em] uppercase">INICIO</Link>
                  {categorias.map((cat) => (
                      <Link key={cat.to} to={cat.to} onClick={() => setOpen(false)} className="text-xl font-medium tracking-widest uppercase border-b border-pink-50 pb-2">
                      {cat.label}
                      </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
        </div>

        {/* LOGO - Más estilizado y femenino */}
        <Link to="/" className="font-display text-2xl md:text-4xl font-light tracking-[0.5em] text-pink-950 uppercase transition-all hover:opacity-70">
          AURA<span className="font-bold italic text-pink-300">FEMENINA</span>
        </Link>

        {/* LINKS CENTRALES - Más grandes y aireados */}
        <nav className="hidden md:flex items-center gap-14 text-pink-950">
          <Link to="/" className="text-[14px] font-medium tracking-[0.2em] hover:text-pink-400 transition-colors uppercase">INICIO</Link>
          
          <div 
            className="relative h-28 flex items-center"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button className="flex items-center gap-2 text-[14px] font-medium tracking-[0.2em] hover:text-pink-400 transition-colors uppercase cursor-pointer outline-none">
              PRODUCTOS <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
                <div className="absolute top-[112px] left-[-20px] w-64 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-white border border-pink-100 p-3 shadow-xl">
                        {categorias.map((cat) => (
                            <Link 
                                key={cat.to} 
                                to={cat.to} 
                                className="block px-6 py-4 text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-pink-50 hover:text-pink-600 transition-colors"
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <Link to="/contacto" className="text-[14px] font-medium tracking-[0.2em] hover:text-pink-400 transition-colors uppercase">CONTACTO</Link>
        </nav>

        {/* ICONOS */}
        <div className="flex items-center gap-6 text-pink-950">
            <Link to="/login" className="hidden md:block hover:text-pink-400 transition-colors">
                <User className="h-6 w-6" />
            </Link>
            <Link to="/carrito" className="relative p-2 hover:bg-pink-50 rounded-full transition-colors">
                <ShoppingBag className="h-6 w-6" />
                {itemCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-pink-300 text-white text-[10px] font-bold">
                        {itemCount}
                    </span>
                )}
            </Link>
        </div>
      </div>
    </header>
  );
}
