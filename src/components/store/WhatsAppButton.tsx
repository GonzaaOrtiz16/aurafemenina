import { MessageCircle } from "lucide-react";
import { useSiteSetting } from "@/hooks/useSiteSettings";

interface ContactData {
  whatsapp: string;
}

export default function WhatsAppButton() {
  const { data: contact } = useSiteSetting<ContactData>("contact");
  const whatsapp = contact?.whatsapp || "5491134944228";

  return (
    <a
      href={`https://wa.me/${whatsapp}?text=Hola!%20Quiero%20consultar%20sobre%20un%20producto.`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg hover:scale-110 transition-transform duration-200"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
