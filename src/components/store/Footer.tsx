import { Link } from "react-router-dom";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";

interface ContactData {
  whatsapp: string;
  email: string;
  instagram: string;
  instagram_url: string;
  location: string;
}

export default function Footer() {
  const { data: contact } = useSiteSetting<ContactData>("contact");
  const c = contact || {
    whatsapp: "5491134944228", email: "orianaevelyn09@gmail.com",
    instagram: "@aurafemenina.oficial", instagram_url: "https://instagram.com",
    location: "Buenos Aires, Argentina",
  };

  const formattedPhone = c.whatsapp ? `+${c.whatsapp.slice(0, 2)} ${c.whatsapp.slice(2, 4)} ${c.whatsapp.slice(4, 8)}-${c.whatsapp.slice(8)}` : "";

  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-[0.2em] mb-4">AURA FEMENINA</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Moda femenina con estilo y calidad. Envíos a todo el país.</p>
          </div>
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider mb-4">Navegación</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/productos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Productos</Link>
              <Link to="/como-comprar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">¿Cómo comprar?</Link>
              <Link to="/preguntas-frecuentes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Preguntas frecuentes</Link>
              <Link to="/contacto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contacto</Link>
            </nav>
          </div>
          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider mb-4">Contacto</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" /> {formattedPhone}
              </a>
              <a href={`mailto:${c.email}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" /> {c.email}
              </a>
              <a href={c.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Instagram className="h-4 w-4" /> {c.instagram}
              </a>
              {c.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {c.location}
                </span>
              )}
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
