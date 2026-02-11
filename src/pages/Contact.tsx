import Layout from "@/components/store/Layout";
import { Instagram, Mail, MapPin, Phone, MessageCircle } from "lucide-react";

export default function Contact() {
  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-center mb-4">
          Contacto
        </h1>
        <p className="font-body text-center text-muted-foreground mb-10">
          ¿Tenés alguna consulta? Escribinos y te respondemos a la brevedad.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://wa.me/5491112345678"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 border border-border rounded-sm p-5 hover:bg-secondary transition-colors"
          >
            <MessageCircle className="h-6 w-6 text-whatsapp flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium">WhatsApp</p>
              <p className="font-body text-xs text-muted-foreground">+54 9 11 1234-5678</p>
            </div>
          </a>

          <a
            href="mailto:hola@aurelia.com.ar"
            className="flex items-center gap-4 border border-border rounded-sm p-5 hover:bg-secondary transition-colors"
          >
            <Mail className="h-6 w-6 text-accent flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium">Email</p>
              <p className="font-body text-xs text-muted-foreground">hola@aurelia.com.ar</p>
            </div>
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 border border-border rounded-sm p-5 hover:bg-secondary transition-colors"
          >
            <Instagram className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium">Instagram</p>
              <p className="font-body text-xs text-muted-foreground">@aurelia.moda</p>
            </div>
          </a>

          <div className="flex items-center gap-4 border border-border rounded-sm p-5">
            <MapPin className="h-6 w-6 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium">Ubicación</p>
              <p className="font-body text-xs text-muted-foreground">Buenos Aires, Argentina</p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-sm border border-border p-8 text-center bg-secondary">
          <h2 className="font-display text-xl font-semibold mb-3">Horario de atención</h2>
          <p className="font-body text-sm text-muted-foreground">Lunes a Viernes: 9:00 a 18:00 hs</p>
          <p className="font-body text-sm text-muted-foreground">Sábados: 10:00 a 14:00 hs</p>
        </div>
      </div>
    </Layout>
  );
}
