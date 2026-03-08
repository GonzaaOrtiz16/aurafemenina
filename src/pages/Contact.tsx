import Layout from "@/components/store/Layout";
import { Instagram, Mail, MapPin, Phone, MessageCircle } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

interface ContactData {
  whatsapp: string;
  email: string;
  instagram: string;
  instagram_url: string;
  location: string;
  hours_weekday: string;
  hours_saturday: string;
}

export default function Contact() {
  const { data: contact, isLoading } = useSiteSetting<ContactData>("contact");

  const c = contact || {
    whatsapp: "5491134944228", email: "orianaevelyn09@gmail.com",
    instagram: "@aurafemenina.oficial", instagram_url: "https://instagram.com",
    location: "Buenos Aires, Argentina",
    hours_weekday: "Lunes a Viernes: 9:00 a 18:00 hs", hours_saturday: "Sábados: 10:00 a 14:00 hs",
  };

  const formattedPhone = c.whatsapp ? `+${c.whatsapp.slice(0, 2)} ${c.whatsapp.slice(2, 4)} ${c.whatsapp.slice(4, 8)}-${c.whatsapp.slice(8)}` : "";

  if (isLoading) return <Layout><div className="container max-w-2xl py-12 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div></Layout>;

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-center mb-4">Contacto</h1>
        <p className="font-body text-center text-muted-foreground mb-10">¿Tenés alguna consulta? Escribinos y te respondemos a la brevedad.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 border border-border rounded-sm p-5 hover:bg-secondary transition-colors">
            <MessageCircle className="h-6 w-6 text-whatsapp flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium">WhatsApp</p>
              <p className="font-body text-xs text-muted-foreground">{formattedPhone}</p>
            </div>
          </a>
          <a href={`mailto:${c.email}`} className="flex items-center gap-4 border border-border rounded-sm p-5 hover:bg-secondary transition-colors">
            <Mail className="h-6 w-6 text-accent flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium">Email</p>
              <p className="font-body text-xs text-muted-foreground">{c.email}</p>
            </div>
          </a>
          <a href={c.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 border border-border rounded-sm p-5 hover:bg-secondary transition-colors">
            <Instagram className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium">Instagram</p>
              <p className="font-body text-xs text-muted-foreground">{c.instagram}</p>
            </div>
          </a>
          <div className="flex items-center gap-4 border border-border rounded-sm p-5">
            <MapPin className="h-6 w-6 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-body text-sm font-medium">Ubicación</p>
              <p className="font-body text-xs text-muted-foreground">{c.location}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-sm border border-border p-8 text-center bg-secondary">
          <h2 className="font-display text-xl font-semibold mb-3">Horario de atención</h2>
          <p className="font-body text-sm text-muted-foreground">{c.hours_weekday}</p>
          <p className="font-body text-sm text-muted-foreground">{c.hours_saturday}</p>
        </div>
      </div>
    </Layout>
  );
}
