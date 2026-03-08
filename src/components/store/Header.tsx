import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, Search, ChevronDown, X, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

  const [openMenu, setOpenMenu] = useState(false);
  const [showProductMobileMenu, setShowProductMobileMenu] = useState(false);
  const [showDesktopSearch, setShowDesktopSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!location.pathname.includes("/productos")) {
      setSearchTerm("");
    }
  }, [location]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?search=${searchTerm.trim()}`);
      setShowDesktopSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card">
      {/* Top promo bar */}
      <div className="bg-card border-b border-border py-2 px-4 text-center">
        <p className="text-[10px] tracking-[0.2em] font-bold text-muted-foreground uppercase">
          Envíos a todo el país — Aura Femenina
        </p>
      </div>

      {/* Main nav */}
      <div className="container mx-auto px-4 h-16 md:h-24 flex items-center justify-between relative border-b md:border-none border-border">
        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center flex-1">
          <Sheet open={openMenu} onOpenChange={setOpenMenu}>
            <SheetTrigger className="flex items-center gap-2 outline-none">
              <Menu className="h-6 w-6 text-foreground" />
              <span className="text-[10px] font-bold text-foreground tracking-widest">MENÚ</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] p-0 flex flex-col">
              <nav className="flex flex-col mt-10">
                <Link to="/" onClick={() => setOpenMenu(false)} className="p-6 border-b border-border font-bold uppercase text-xs tracking-widest">Inicio</Link>
                <Link to="/productos" onClick={() => setOpenMenu(false)} className="p-6 border-b border-border font-bold uppercase text-xs tracking-widest text-accent">Colección Completa</Link>
                <Link to="/encargues" onClick={() => setOpenMenu(false)} className="p-6 border-b border-border font-bold uppercase text-xs tracking-widest">Por Encargue</Link>
                <Link to="/contacto" onClick={() => setOpenMenu(false)} className="p-6 border-b border-border font-bold uppercase text-xs tracking-widest">Contacto</Link>
                <Link to="/login" onClick={() => setOpenMenu(false)} className="p-6 border-b border-border font-bold uppercase text-xs tracking-widest">Mi Cuenta</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex-[2] md:flex-none text-center">
          <Link to="/" className="text-xl md:text-3xl font-black italic tracking-tighter text-foreground uppercase">
            AURA<span className="font-display italic text-accent font-bold">FEMENINA</span>
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex flex-1 md:flex-none items-center justify-end gap-2 md:gap-5">
          <button className="hidden md:block p-2" onClick={() => setShowDesktopSearch(true)}>
            <Search className="h-5 w-5 text-foreground" />
          </button>
          <Link to="/carrito" className="relative p-2">
            <ShoppingBag className="h-6 w-6 text-foreground" />
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-foreground text-background text-[8px] rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Desktop search overlay */}
        {showDesktopSearch && (
          <div className="absolute inset-0 bg-card z-[60] flex items-center px-12 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleSearch} className="w-full flex items-center gap-4">
              <Search className="w-6 h-6 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="¿Qué estás buscando?"
                className="w-full text-2xl font-light outline-none bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="button" onClick={() => setShowDesktopSearch(false)}>
                <X className="w-8 h-8 text-muted-foreground" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile sub-bar: Search + Products dropdown */}
      <div className="md:hidden sticky top-0 left-0 w-full flex h-14 z-40 bg-card border-b border-border shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 flex items-center border-r border-border px-4">
          <input
            type="text"
            placeholder="BUSCAR..."
            className="w-full text-[10px] font-bold tracking-[0.2em] outline-none bg-transparent placeholder:text-muted-foreground/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit"><Search className="w-4 h-4 text-muted-foreground/40" /></button>
        </form>

        <div className="flex-[1.2] relative">
          <button
            onClick={() => setShowProductMobileMenu(!showProductMobileMenu)}
            className="w-full h-full flex items-center justify-between px-4 text-[10px] font-bold uppercase tracking-widest"
          >
            PRODUCTOS <ChevronDown className={`w-3 h-3 transition-transform ${showProductMobileMenu ? "rotate-180" : ""}`} />
          </button>

          {showProductMobileMenu && (
            <div className="absolute top-full left-0 w-full bg-card shadow-2xl z-50 border-t border-border">
              {categorias.map((cat) => (
                <Link
                  key={cat.to}
                  to={cat.to}
                  onClick={() => setShowProductMobileMenu(false)}
                  className="block px-6 py-4 text-[11px] font-bold border-b border-border/50 uppercase tracking-[0.1em]"
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
