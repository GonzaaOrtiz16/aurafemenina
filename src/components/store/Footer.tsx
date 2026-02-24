import { Link } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-[0.2em] mb-4">AURELIA</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Moda femenina con estilo y calidad. Envíos a todo el país.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider mb-4">Navegación</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/productos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Productos</Link>
              <Link to="/como-comprar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">¿Cómo comprar?</Link>
              <Link to="/preguntas-frecuentes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Preguntas frecuentes</Link>
              <Link to="/contacto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contacto</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider mb-4">Contacto</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a href="https://wa.me/5491134944228" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" /> +54 9 11 3494-4228
              </a>
              <a href="mailto:orianaevelyn09@gmail.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" /> orianaevelyn09@gmail.com
              </a>
              <a href="https://www.instagram.com/aurafemenina.oficial/?hl=es" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Instagram className="h-4 w-4" /> @aurafemenina.oficial
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AURA FEMENINA. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
