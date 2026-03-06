// src/components/store/Header.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShoppingBag, User, ChevronDown } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-pink-100">
      {/* Barra superior: Ajustamos el texto para que no se corte en móvil */}
      <div className="bg-pink-50 text-[9px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] h-8 md:h-10 flex items-center justify-center uppercase font-medium text-pink-400 px-4 text-center">
        Resaltá tu belleza única — Envíos a todo el país
      </div>

      {/* Contenedor principal: Altura ajustable */}
      <div className="container flex h-16 md:h-28 items-center justify-between px-4 md:px-12">
        
        {/* Mobile menu - Izquierda */}
        <div className="flex md:hidden flex-1">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="p-2 -ml-2">
                <Menu className="h-6 w-6 text-pink-900" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 bg-white">
                <nav className="flex flex-col p-8 gap-6 text-pink-900">
                  <Link to="/" onClick={() => setOpen(false)} className="text-xl font-light tracking-[0.2em] uppercase">INICIO</Link>
                  <div className="h-px bg-pink-50 w-full" />
                  {categorias.map((cat) => (
                      <Link key={cat.to} to={cat.to} onClick={() => setOpen(false)} className="text-lg font-medium tracking-widest uppercase hover:text-pink-400 transition-colors">
                      {cat.label}
                      </Link>
                  ))}
                  <div className="h-px bg-pink-50 w-full" />
                  <Link to="/contacto" onClick={() => setOpen(false)} className="text-lg font-medium tracking-widest uppercase">CONTACTO</Link>
                </nav>
              </SheetContent>
            </Sheet>
        </div>

        {/* LOGO: Centrado en móvil, izquierda en desktop */}
        <div className="flex-[2] md:flex-none text-center">
          <Link to="/" className="font-display text-lg md:text-4xl font-light tracking-[0.3em] md:tracking-[0.5em] text-pink-950 uppercase transition-all">
            AURA<span className="font-bold italic text-pink-300">FEMENINA</span>
          </Link>
        </div>

        {/* LINKS CENTRALES: Solo Desktop */}
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
                <div className="absolute top-[100px] left-[-20px] w-64 animate-in fade-in slide-in-from-top-2 duration-300">
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

        {/* ICONOS - Derecha */}
        <div className="flex flex-1 md:flex-none items-center justify-end gap-2 md:gap-6 text-pink-950">
            <Link to="/login" className="hidden md:block hover:text-pink-400 transition-colors">
                <User className="h-6 w-6" />
            </Link>
            <Link to="/carrito" className="relative p-2 hover:bg-pink-50 rounded-full transition-colors">
                <ShoppingBag className="h-5 w-5 md:h-6 md:w-6" />
                {itemCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-pink-300 text-white text-[8px] md:text-[10px] font-bold">
                        {itemCount}
                    </span>
                )}
            </Link>
        </div>
      </div>
    </header>
  );
}
