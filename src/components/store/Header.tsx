// src/components/store/Header.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, Search, ChevronDown, X } from "lucide-react";
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
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de UI
  const [openMenu, setOpenMenu] = useState(false);
  const [showProductMobileMenu, setShowProductMobileMenu] = useState(false);
  const [showDesktopSearch, setShowDesktopSearch] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Único estado de búsqueda necesario aquí
  const [searchTerm, setSearchTerm] = useState("");

  // Limpiar buscador si salimos de productos
  useEffect(() => {
    if (!location.pathname.includes("/productos")) {
      setSearchTerm("");
    }
  }, [location]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?search=${searchTerm.trim()}`);
      if (showDesktopSearch) setShowDesktopSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* 1. BARRA SUPERIOR (Promociones) */}
      <div className="bg-white border-b border-zinc-100 py-2 px-4 text-center">
        <p className="text-[10px] tracking-[0.2em] font-bold text-zinc-400 uppercase">
          Envíos a todo el país — Aura Femenina
        </p>
      </div>

      {/* 2. NAVEGACIÓN PRINCIPAL (Logo y Carrito) */}
      <div className="container mx-auto px-4 h-16 md:h-24 flex items-center justify-between relative border-b md:border-none border-zinc-100">
        
        {/* MOBILE: Menú hamburguesa */}
        <div className="flex md:hidden items-center flex-1">
          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger className="flex items-center gap-2 outline-none">
              <Menu className="h-6 w-6 text-black" />
              <span className="text-[10px] font-bold text-black tracking-widest">MENÚ</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] p-0 flex flex-col">
              <nav className="flex flex-col mt-10">
                <Link to="/" onClick={() => setOpenMenu(false)} className="p-6 border-b border-zinc-50 font-bold uppercase text-xs tracking-widest">Inicio</Link>
                <Link to="/productos" onClick={() => setOpenMenu(false)} className="p-6 border-b border-zinc-50 font-bold uppercase text-xs tracking-widest text-pink-500">Colección Completa</Link>
                <Link to="/contacto" onClick={() => setOpenMenu(false)} className="p-6 border-b border-zinc-50 font-bold uppercase text-xs tracking-widest">Contacto</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* LOGO CENTRAL */}
        <div className="flex-[2] md:flex-none text-center">
          <Link to="/" className="text-xl md:text-3xl font-black italic tracking-tighter text-black uppercase">
            AURA<span className="text-pink-400 font-bold italic">FEMENINA</span>
          </Link>
        </div>

        {/* ICONOS DERECHA (Buscador Desktop y Carrito) */}
        <div className="flex flex-1 md:flex-none items-center justify-end gap-2 md:gap-5">
          <button className="hidden md:block p-2" onClick={() => setShowDesktopSearch(true)}>
            <Search className="h-5 w-5" />
          </button>
          <Link to="/carrito" className="relative p-2">
            <ShoppingBag className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-black text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* BUSCADOR DESKTOP OVERLAY */}
        {showDesktopSearch && (
          <div className="absolute inset-0 bg-white z-[60] flex items-center px-12 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleSearch} className="w-full flex items-center gap-4">
              <Search className="w-6 h-6 text-zinc-400" />
              <input 
                autoFocus 
                type="text" 
                placeholder="¿Qué estás buscando?" 
                className="w-full text-2xl font-light outline-none" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <button type="button" onClick={() => setShowDesktopSearch(false)}>
                <X className="w-8 h-8 text-zinc-400" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. BARRA MÓVIL SOBREPUESTA (SOLO BUSCADOR Y PRODUCTOS) */}
      {/* Eliminamos la fila de Talle y Color de aquí */}
      <div className="md:hidden sticky top-0 left-0 w-full flex h-14 z-40 bg-white border-b border-zinc-100 shadow-sm">
        
        {/* Input de Búsqueda */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center border-r border-zinc-100 px-4">
          <input 
            type="text" 
            placeholder="BUSCAR..." 
            className="w-full text-[10px] font-bold tracking-[0.2em] outline-none bg-transparent placeholder:text-zinc-300" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button type="submit"><Search className="w-4 h-4 text-zinc-300" /></button>
        </form>

        {/* Menú Desplegable de Productos */}
        <div className="flex-[1.2] relative">
          <button 
            onClick={() => setShowProductMobileMenu(!showProductMobileMenu)}
            className="w-full h-full flex items-center justify-between px-4 text-[10px] font-bold uppercase tracking-widest"
          >
            PRODUCTOS <ChevronDown className={`w-3 h-3 transition-transform ${showProductMobileMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showProductMobileMenu && (
            <div className="absolute top-full left-0 w-full bg-white shadow-2xl z-50 border-t border-zinc-100">
              {categorias.map((cat) => (
                <Link 
                  key={cat.to} 
                  to={cat.to} 
                  onClick={() => setShowProductMobileMenu(false)} 
                  className="block px-6 py-4 text-[11px] font-bold border-b border-zinc-50 uppercase tracking-[0.1em]"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
