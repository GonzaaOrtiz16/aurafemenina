import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, Search, ChevronDown, X, LogOut, User, Camera } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCategories } from "@/hooks/useProducts";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementData {
  text: string;
  enabled: boolean;
}

export default function Header() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: categories = [] } = useCategories();
  const { data: announcement } = useSiteSetting<AnnouncementData>("announcement");
  const { user, isReady } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const [openMenu, setOpenMenu] = useState(false);
  const [showDesktopSearch, setShowDesktopSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVisualSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      // Navigate to products with visual search
      navigate(`/productos?visual=1`);
      // Store in sessionStorage for the Products page to pick up
      sessionStorage.setItem("visual-search-image", base64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Build dynamic nav links from categories
  const categoryChildren = [
    { label: "VER TODO", to: "/productos" },
    ...categories.map((c) => ({
      label: c.name.toUpperCase(),
      to: `/productos?categoria=${c.slug}`,
    })),
  ];

  const navLinks = [
    { label: "INICIO", to: "/", children: undefined },
    { label: "PRODUCTOS", to: "/productos", children: categoryChildren },
    { label: "POR ENCARGUE", to: "/encargues", children: undefined },
    { label: "¿CÓMO COMPRAR?", to: "/como-comprar", children: undefined },
    { label: "CONTACTO", to: "/contacto", children: undefined },
    { label: "PREGUNTAS FRECUENTES", to: "/preguntas-frecuentes", children: undefined },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!location.pathname.includes("/productos")) setSearchTerm("");
    setActiveDropdown(null);
  }, [location]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?search=${searchTerm.trim()}`);
      setShowDesktopSearch(false);
    }
  };

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  const announcementText = announcement?.text || "ENVÍO GRATIS A CABA Y ZONA SUR · 3 CUOTAS SIN INTERÉS";
  const showAnnouncement = announcement?.enabled !== false;

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${scrolled ? "shadow-md" : ""} bg-card`}>
      {/* Announcement bar */}
      {showAnnouncement && (
        <div className="bg-foreground text-primary-foreground py-2 px-4 text-center overflow-hidden">
          <div className="animate-marquee whitespace-nowrap inline-block">
            <span className="text-[10px] tracking-[0.25em] font-bold uppercase mx-8">{announcementText}</span>
            <span className="text-[10px] tracking-[0.25em] font-bold uppercase mx-8">{announcementText}</span>
          </div>
        </div>
      )}

      {/* Main header row */}
      <div className="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between relative">
        <div className="flex items-center flex-1">
          <div className="md:hidden">
            <Sheet open={openMenu} onOpenChange={setOpenMenu}>
              <SheetTrigger className="flex items-center gap-2 outline-none">
                <Menu className="h-6 w-6 text-foreground" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] p-0 flex flex-col overflow-y-auto">
                <div className="p-6 border-b border-border">
                  <p className="font-display text-xl font-bold tracking-wider">AURA<span className="italic text-accent">FEMENINA</span></p>
                </div>
                <nav className="flex flex-col">
                  {navLinks.map((link) => (
                    <div key={link.label}>
                      {link.children ? (
                        <>
                          <button
                            onClick={() => setMobileSubmenu(mobileSubmenu === link.label ? null : link.label)}
                            className="w-full flex items-center justify-between p-5 border-b border-border/50 font-body text-xs font-bold uppercase tracking-[0.15em]"
                          >
                            {link.label}
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${mobileSubmenu === link.label ? "rotate-180" : ""}`} />
                          </button>
                          <div className={`overflow-hidden transition-all duration-300 bg-secondary/30 ${mobileSubmenu === link.label ? "max-h-96" : "max-h-0"}`}>
                            {link.children.map((child) => (
                              <Link key={child.to} to={child.to} onClick={() => setOpenMenu(false)}
                                className="block px-8 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors">
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <Link to={link.to} onClick={() => setOpenMenu(false)}
                          className="p-5 border-b border-border/50 font-body text-xs font-bold uppercase tracking-[0.15em] block">
                          {link.label}
                        </Link>
                      )}
                    </div>
                  ))}
                  {user ? (
                    <button onClick={() => { setOpenMenu(false); handleLogout(); }}
                      className="w-full text-left p-5 border-b border-border/50 font-body text-xs font-bold uppercase tracking-[0.15em] text-accent flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> CERRAR SESIÓN
                    </button>
                  ) : (
                    <Link to="/login" onClick={() => setOpenMenu(false)}
                      className="p-5 border-b border-border/50 font-body text-xs font-bold uppercase tracking-[0.15em] text-accent block">
                      MI CUENTA
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <button className="hidden md:flex items-center gap-2 group" onClick={() => setShowDesktopSearch(true)}>
            <Search className="h-5 w-5 text-foreground group-hover:text-accent transition-colors" />
          </button>
        </div>

        <div className="flex-[2] md:flex-none text-center">
          <Link to="/" className="text-xl md:text-3xl font-black tracking-tighter text-foreground uppercase inline-block hover:opacity-80 transition-opacity">
            AURA<span className="font-display italic text-accent font-bold">FEMENINA</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3 md:gap-5">
          {isReady && (
            user ? (
              <button onClick={handleLogout} className="hidden md:flex items-center gap-1 group">
                <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground group-hover:text-foreground transition-colors">SALIR</span>
              </button>
            ) : (
              <>
                <Link to="/registro" className="hidden md:block">
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors">CREAR CUENTA</span>
                </Link>
                <Link to="/login" className="hidden md:block">
                  <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors">INICIAR SESIÓN</span>
                </Link>
              </>
            )
          )}
          <Link to="/carrito" className="relative p-2">
            <ShoppingBag className="h-5 w-5 text-foreground" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-accent text-accent-foreground text-[8px] rounded-full flex items-center justify-center font-bold">{itemCount}</span>
            )}
          </Link>
        </div>

        {showDesktopSearch && (
          <div className="absolute inset-0 bg-card z-[60] flex items-center px-12 animate-fade-in">
            <form onSubmit={handleSearch} className="w-full flex items-center gap-4">
              <Search className="w-6 h-6 text-muted-foreground" />
              <input autoFocus type="text" placeholder="¿Qué estás buscando?"
                className="w-full text-2xl font-light outline-none bg-transparent font-display"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <button type="button" onClick={() => setShowDesktopSearch(false)}>
                <X className="w-8 h-8 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Desktop navigation */}
      <nav className="hidden md:block border-t border-border">
        <div className="container mx-auto flex items-center justify-center gap-0">
          {navLinks.map((link) => (
            <div key={link.label} className="relative"
              onMouseEnter={() => link.children && handleDropdownEnter(link.label)}
              onMouseLeave={() => link.children && handleDropdownLeave()}>
              <Link to={link.to}
                className={`relative flex items-center gap-1 px-5 py-4 font-body text-[11px] font-bold uppercase tracking-[0.15em] transition-colors hover:text-accent ${
                  location.pathname === link.to ? "text-accent after:absolute after:bottom-0 after:left-5 after:right-5 after:h-[2px] after:bg-accent" : "text-foreground"
                }`}>
                {link.label}
                {link.children && <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${activeDropdown === link.label ? "rotate-180" : ""}`} />}
              </Link>
              {link.children && activeDropdown === link.label && (
                <div className="absolute top-full left-0 min-w-[220px] bg-card shadow-xl border border-border z-50 animate-fade-in"
                  onMouseEnter={() => handleDropdownEnter(link.label)} onMouseLeave={handleDropdownLeave}>
                  {link.children.map((child) => (
                    <Link key={child.to} to={child.to}
                      className="block px-6 py-3 font-body text-[11px] font-bold uppercase tracking-[0.1em] text-foreground/70 hover:text-accent hover:bg-secondary/50 transition-all duration-200">
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile sub-bar */}
      <div className="md:hidden flex h-12 z-40 bg-card border-t border-border">
        <form onSubmit={handleSearch} className="flex-1 flex items-center border-r border-border px-4">
          <input type="text" placeholder="BUSCAR..."
            className="w-full text-[10px] font-bold tracking-[0.2em] outline-none bg-transparent placeholder:text-muted-foreground/40"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button type="submit"><Search className="w-4 h-4 text-muted-foreground/40" /></button>
        </form>
        <Link to="/productos" className="flex-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-accent transition-colors">
          PRODUCTOS
        </Link>
      </div>
    </header>
  );
}
