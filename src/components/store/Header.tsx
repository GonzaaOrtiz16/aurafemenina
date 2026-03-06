// src/components/store/Header.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ShoppingBag, User, ChevronDown, Search, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Barra superior: Estilo Nissie Denim para móvil */}
      <div className="bg-white border-b border-zinc-50 py-2 px-4 text-center md:bg-pink-50 md:py-3">
        <p className="text-[10px] md:text-[11px] tracking-tight md:tracking-[0.3em] font-medium text-zinc-500 md:text-pink-400 uppercase">
          ¡Seguinos en Instagram para enterarte de todas las novedades!
        </p>
      </div>

      {/* Contenedor principal */}
      <div className="container flex h-16 md:h-28 items-center justify-between px-4 md:px-12 relative">
        
        {/* Mobile menu - Estilo Referencia */}
        <div className="flex md:hidden flex-1 items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex items-center gap-2 outline-none">
              <Menu className="h-6 w-6 text-black" />
              <span className="text-[10px] font-bold tracking-tighter text-black">MENÚ</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] p-0 bg-white flex flex-col border-none">
              <div className="flex justify-end p-4">
                <button onClick={() => setOpen(false)}><X className="w-6 h-6 text-zinc-400" /></button>
              </div>
              <nav className="flex flex-col text-zinc-800">
                <Link to="/" onClick={() => setOpen(false)} className="p-5 border-b border-zinc-50 text-sm font-medium">Inicio</Link>
                <div className="p-5 border-b border-zinc-50 text-sm font-medium flex justify-between items-center">
                  Productos <ChevronDown className="w-4 h-4" />
                </div>
                <Link to="/contacto" onClick={() => setOpen(false)} className="p-5 border-b border-zinc-50 text-sm font-medium">Contacto</Link>
                <Link to="/preguntas" onClick={() => setOpen(false)} className="p-5 border-b border-zinc-50 text-sm font-medium">Preguntas Frecuentes</Link>
              </nav>
              {/* Botón de Cuenta abajo */}
              <div className="mt-auto p-4 bg-zinc-50">
                <Link to="/login" className="flex items-center justify-center gap-2 w-full bg-[#E84C3D] text-white py-4 text-[11px] font-bold uppercase tracking-wider">
                  <User className="w-4 h-4" /> Crear cuenta | Iniciar sesión
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* LOGO: Centrado en móvil */}
        <div className="flex-[2] md:flex-none text-center">
          <Link to="/" className="font-display text-xl md:text-4xl font-light tracking-[0.2em] md:tracking-[0.5em] text-black uppercase">
            AURA<span className="font-bold italic text-pink-300">FEMENINA</span>
          </Link>
        </div>

        {/* LINKS CENTRALES: Desktop */}
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
              <div className="absolute top-[100px] left-[-20px] w-64 animate-in fade-in slide-in-from-top-2">
                <div className="bg-white border border-pink-100 p-3 shadow-xl">
                  {categorias.map((cat) => (
                    <Link key={cat.to} to={cat.to} className="block px-6 py-4 text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-pink-50 hover:text-pink-600">
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link to="/contacto" className="text-[14px] font-medium tracking-[0.2em] hover:text-pink-400 transition-colors uppercase">CONTACTO</Link>
        </nav>

        {/* ICONOS DERECHA */}
        <div className="flex flex-1 md:flex-none items-center justify-end gap-2 md:gap-6 text-black">
          <Link to="/carrito" className="relative p-2">
            <ShoppingBag className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-black text-white text-[8px] md:text-[10px] font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA MÓVIL: Replicando Nissie */}
      <div className="flex md:hidden border-t border-zinc-100 h-12">
        <div className="flex-1 flex items-center justify-center border-r border-zinc-100">
          <Search className="w-5 h-5 text-zinc-400" />
        </div>
        <div className="flex-[3] flex items-center justify-between px-6 text-[10px] font-bold uppercase tracking-tighter text-black">
          PRODUCTOS <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
