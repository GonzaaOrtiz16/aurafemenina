// src/components/store/Header.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, ShoppingBag, User, Search, ChevronDown, X } from "lucide-react";
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
  const [openMenu, setOpenMenu] = useState(false);
  const [showProductMobileMenu, setShowProductMobileMenu] = useState(false);
  const [showDesktopSearch, setShowDesktopSearch] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?search=${searchTerm}`);
      setSearchTerm("");
      setShowDesktopSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* 1. BARRA SUPERIOR */}
      <div className="bg-white border-b border-zinc-100 py-2 px-4 text-center">
        <p className="text-[10px] tracking-tight font-medium text-zinc-500 uppercase">
          ¡Seguinos en Instagram para enterarte de todas las novedades!
        </p>
      </div>

      {/* 2. NAVEGACIÓN PRINCIPAL (Logo y Carrito) */}
      <div className="bg-white container mx-auto px-4 h-16 md:h-24 flex items-center justify-between relative border-b md:border-none border-zinc-100">
        
        {/* MOBILE: Menú Hamburguesa */}
        <div className="flex md:hidden items-center flex-1">
          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger className="flex items-center gap-2 outline-none">
              <Menu className="h-6 w-6 text-black" />
              <span className="text-[10px] font-bold text-black">MENÚ</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] p-0 flex flex-col">
              <div className="p-4 border-b border-zinc-100 flex justify-end">
                <button onClick={() => setOpenMenu(false)}>
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
              <nav className="flex flex-col text-sm font-medium">
                <Link to="/" onClick={() => setOpenMenu(false)} className="p-5 border-b border-zinc-50">Inicio</Link>
                <button 
                   onClick={() => setShowProductMobileMenu(!showProductMobileMenu)}
                   className="w-full p-5 flex justify-between items-center border-b border-zinc-50 uppercase"
                 >
                   PRODUCTOS <ChevronDown className={`w-4 h-4 transition-transform ${showProductMobileMenu ? 'rotate-180' : ''}`} />
                 </button>
                {showProductMobileMenu && (
                  <div className="bg-zinc-50">
                    {categorias.map(cat => (
                      <Link key={cat.to} to={cat.to} onClick={() => setOpenMenu(false)} className="block py-4 px-10 border-b border-white text-xs uppercase tracking-widest">
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}
                <Link to="/contacto" onClick={() => setOpenMenu(false)} className="p-5 border-b border-zinc-50">Contacto</Link>
              </nav>
              <div className="mt-auto p-4 bg-zinc-50">
                <Link to="/login" className="flex items-center justify-center gap-2 bg-[#E84C3D] text-white py-4 text-[11px] font-bold uppercase">
                  <User className="w-4 h-4" /> Crear cuenta | Iniciar sesión
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* LOGO: Centrado en Móvil / Izquierda en PC */}
        <div className="flex-[2] md:flex-none text-center md:text-left">
          <Link to="/" className="text-xl md:text-3xl font-black italic tracking-tighter text-black uppercase">
            AURA<span className="text-pink-400 font-bold italic">FEMENINA</span>
          </Link>
        </div>

        {/* DESKTOP NAV: Links centrales */}
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[11px] font-bold tracking-widest hover:text-pink-400 uppercase transition-colors">Inicio</Link>
          <div 
            className="relative h-24 flex items-center"
            onMouseEnter={() => setShowProductDropdown(true)}
            onMouseLeave={() => setShowProductDropdown(false)}
          >
            <button className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase outline-none">
              Productos <ChevronDown className="w-3 h-3" />
            </button>
            {showProductDropdown && (
              <div className="absolute top-20 left-0 w-48 bg-white border border-zinc-100 shadow-xl p-2 animate-in fade-in slide-in-from-top-2 z-50">
                {categorias.map(cat => (
                  <Link key={cat.to} to={cat.to} className="block px-4 py-3 text-[10px] font-bold hover:bg-zinc-50 uppercase tracking-widest transition-colors">
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/contacto" className="text-[11px] font-bold tracking-widest hover:text-pink-400 uppercase transition-colors">Contacto</Link>
        </nav>

        {/* ICONOS DERECHA: Buscador PC + Carrito */}
        <div className="flex flex-1 md:flex-none items-center justify-end gap-2 md:gap-5 text-black">
          <button 
            className="hidden md:block p-2 hover:bg-zinc-50 rounded-full transition-colors" 
            onClick={() => setShowDesktopSearch(true)}
          >
            <Search className="h-5 w-5" />
          </button>
          
          <Link to="/login" className="hidden md:block p-2 hover:bg-zinc-50 rounded-full transition-colors">
            <User className="h-5 w-5" />
          </Link>

          <Link to="/carrito" className="relative p-2 hover:bg-zinc-50 rounded-full transition-colors">
            <ShoppingBag className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-black text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* BUSCADOR DESKTOP OVERLAY: Se abre al dar clic en la lupa */}
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
                <X className="w-8 h-8 text-zinc-400 hover:text-black transition-colors" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 3. BARRA MÓVIL SOBREPUESTA: Buscador + Productos */}
      <div className="md:hidden absolute top-[calc(100%)] left-0 w-full flex h-14 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 animate-in fade-in slide-in-from-top-2 duration-700 ease-in-out">
        
        {/* Buscador móvil */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center border-r border-zinc-200/50 px-4">
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full text-xs outline-none bg-transparent placeholder:text-zinc-400" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <button type="submit">
            <Search className="w-4 h-4 text-zinc-400" />
          </button>
        </form>

        {/* Selector de Productos móvil */}
        <div className="flex-[1.5] relative">
          <button 
            onClick={() => setShowProductMobileMenu(!showProductMobileMenu)}
            className="w-full h-full flex items-center justify-between px-6 text-[10px] font-bold uppercase tracking-tighter"
          >
            PRODUCTOS <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showProductMobileMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {showProductMobileMenu && (
            <div className="absolute top-full left-0 w-full bg-white shadow-2xl z-50 border-t border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
              {categorias.map((cat) => (
                <Link 
                  key={cat.to} 
                  to={cat.to} 
                  onClick={() => setShowProductMobileMenu(false)} 
                  className="block px-6 py-4 text-[11px] font-bold border-b border-zinc-50 uppercase active:bg-zinc-50"
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
