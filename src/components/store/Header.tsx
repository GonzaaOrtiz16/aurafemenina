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
  const [searchTerm, setSearchTerm] = useState("");

  // Función para manejar la búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?search=${searchTerm}`);
      setSearchTerm("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      {/* Barra superior minimalista */}
      <div className="bg-white border-b border-zinc-100 py-2 px-4 text-center">
        <p className="text-[10px] tracking-tight font-medium text-zinc-500 uppercase">
          ¡Seguinos en Instagram para enterarte de todas las novedades!
        </p>
      </div>

      <div className="container mx-auto px-4 h-16 md:h-24 flex items-center justify-between">
        {/* Lado Izquierdo: Menú Hamburguesa con texto */}
        <div className="flex md:hidden items-center flex-1">
          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger className="flex items-center gap-2 outline-none">
              <Menu className="h-6 w-6 text-black" />
              <span className="text-[10px] font-bold text-black">MENÚ</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] p-0 flex flex-col">
              <div className="p-4 border-b border-zinc-100 flex justify-end">
                <button onClick={() => setOpenMenu(false)}><X className="w-6 h-6 text-zinc-400" /></button>
              </div>
              <nav className="flex flex-col text-sm font-medium">
                <Link to="/" onClick={() => setOpenMenu(false)} className="p-5 border-b border-zinc-50">Inicio</Link>
                {/* Menú colapsable dentro del lateral */}
                <div className="border-b border-zinc-50">
                   <button 
                     onClick={() => setShowProductMobileMenu(!showProductMobileMenu)}
                     className="w-full p-5 flex justify-between items-center"
                   >
                     PRODUCTOS <ChevronDown className={`w-4 h-4 transition-transform ${showProductMobileMenu ? 'rotate-180' : ''}`} />
                   </button>
                   {showProductMobileMenu && (
                     <div className="bg-zinc-50 flex flex-col">
                        {categorias.map(cat => (
                          <Link key={cat.to} to={cat.to} onClick={() => setOpenMenu(false)} className="py-4 px-10 border-b border-white text-xs uppercase tracking-widest">
                            {cat.label}
                          </Link>
                        ))}
                     </div>
                   )}
                </div>
                <Link to="/contacto" onClick={() => setOpenMenu(false)} className="p-5 border-b border-zinc-50">Contacto</Link>
              </nav>
              {/* Botón de cuenta abajo */}
              <div className="mt-auto p-4 bg-zinc-50">
                <Link to="/login" className="flex items-center justify-center gap-2 bg-[#E84C3D] text-white py-4 text-[11px] font-bold uppercase">
                  <User className="w-4 h-4" /> Crear cuenta | Iniciar sesión
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* LOGO: Centrado */}
        <div className="flex-[2] md:flex-none text-center">
          <Link to="/" className="text-xl md:text-3xl font-black italic tracking-tighter text-black">
            AURA<span className="text-pink-400">FEMENINA</span>
          </Link>
        </div>

        {/* Carrito Derecha */}
        <div className="flex flex-1 items-center justify-end">
          <Link to="/carrito" className="relative p-2">
            <ShoppingBag className="h-6 w-6 text-black" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-black text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* BARRA FUNCIONAL: Buscador + Selector de Productos */}
      <div className="flex md:hidden border-t border-zinc-100 h-14">
        {/* Buscador: Al darle Enter o click a la lupa, busca */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center border-r border-zinc-100 px-4">
          <input 
            type="text" 
            placeholder="Buscar..."
            className="w-full text-xs outline-none bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit"><Search className="w-4 h-4 text-zinc-400" /></button>
        </form>

        {/* Selector de Productos: Menú rápido */}
        <div className="flex-[1.5] relative">
          <button 
            onClick={() => setShowProductMobileMenu(!showProductMobileMenu)}
            className="w-full h-full flex items-center justify-between px-6 text-[10px] font-bold uppercase tracking-tighter"
          >
            PRODUCTOS <ChevronDown className={`w-4 h-4 transition-transform ${showProductMobileMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown del selector */}
          {showProductMobileMenu && (
            <div className="absolute top-full left-0 w-full bg-white shadow-xl z-50 border-t border-zinc-100 animate-in fade-in slide-in-from-top-1">
              {categorias.map((cat) => (
                <Link 
                  key={cat.to} 
                  to={cat.to} 
                  onClick={() => setShowProductMobileMenu(false)}
                  className="block px-6 py-4 text-[11px] font-bold border-b border-zinc-50 uppercase"
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
