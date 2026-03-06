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
    <header className="sticky top-0 z-50 w-full bg-black text-white border-b border-white/5">
      {/* Barra superior fina */}
      <div className="hidden md:flex bg-zinc-900 text-[9px] tracking-[0.4em] h-8 items-center justify-center border-b border-white/5 uppercase font-bold text-zinc-400">
        Envíos a todo el país — 3 y 6 cuotas sin interés
      </div>

      <div className="container flex h-20 items-center justify-between px-4 md:px-8">
        {/* Menu Mobile */}
        <div className="flex md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger className="p-2">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-full p-0 bg-black text-white border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
                  <span className="font-display text-xl font-black tracking-[0.3em]">AURA</span>
                  <button onClick={() => setOpen(false)}><X className="h-6 w-6" /></button>
                </div>
                <nav className="flex flex-col p-6 gap-6">
                  <Link to="/" onClick={() => setOpen(false)} className="text-xl font-black tracking-widest uppercase italic">INICIO</Link>
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] tracking-[0.2em] text-zinc-500 font-bold">CATEGORÍAS</p>
                    {categorias.map((cat) => (
                        <Link key={cat.to} to={cat.to} onClick={() => setOpen(false)} className="text-lg font-bold tracking-widest uppercase hover:italic transition-all">
                        {cat.label}
                        </Link>
                    ))}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
        </div>

        {/* LOGO (Estilo Nissie) */}
        <Link to="/" className="font-display text-xl md:text-2xl font-black tracking-[0.4em] uppercase">
          AURA<span className="font-light italic ml-1 text-zinc-400">FEMENINA</span>
        </Link>

        {/* LINKS CENTRALES DESKTOP */}
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-[11px] font-black tracking-[0.2em] hover:text-zinc-400 transition-colors uppercase">INICIO</Link>
          
          {/* Dropdown de Productos */}
          <div 
            className="relative h-20 flex items-center"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button className="flex items-center gap-1 text-[11px] font-black tracking-[0.2em] hover:text-zinc-400 transition-colors uppercase cursor-pointer">
              PRODUCTOS <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
                <div className="absolute top-[80px] left-[-20px] w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-black border border-white/10 p-2 shadow-2xl">
                        {categorias.map((cat) => (
                            <Link 
                                key={cat.to} 
                                to={cat.to} 
                                className="block px-4 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
                            >
                                {cat.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
          </div>

          <Link to="/como-comprar" className="text-[11px] font-black tracking-[0.2em] hover:text-zinc-400 transition-colors uppercase">CÓMO COMPRAR</Link>
          <Link to="/contacto" className="text-[11px] font-black tracking-[0.2em] hover:text-zinc-400 transition-colors uppercase">CONTACTO</Link>
        </nav>

        {/* ICONOS DERECHA */}
        <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:block hover:text-zinc-400 transition-colors">
                <User className="h-5 w-5" />
            </Link>
            <Link to="/carrito" className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-black text-[9px] font-black shadow-lg">
                        {itemCount}
                    </span>
                )}
            </Link>
        </div>
      </div>
    </header>
  );
}
