import Layout from "@/components/store/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cómo realizo una compra?",
    answer:
      "Navegá por nuestros productos, seleccioná el talle y agregalo al carrito. Cuando tengas todo listo, hacé clic en 'Finalizar compra por WhatsApp' y te contactaremos para coordinar el pago y envío.",
  },
  {
    question: "¿Cuáles son los medios de pago?",
    answer:
      "Aceptamos transferencia bancaria, Mercado Pago, efectivo y tarjeta de débito/crédito. Coordinamos el pago por WhatsApp una vez que realizás el pedido.",
  },
  {
    question: "¿Cuánto tarda el envío?",
    answer:
      "Los envíos a CABA demoran entre 2 y 4 días hábiles, a GBA entre 3 y 5 días hábiles, y al interior del país entre 5 y 8 días hábiles. Todos los envíos se realizan por Correo Argentino.",
  },
  {
    question: "¿Puedo cambiar o devolver un producto?",
    answer:
      "Sí, tenés 30 días desde la recepción para solicitar un cambio o devolución. El producto debe estar sin uso y con etiquetas originales. Contactanos por WhatsApp para gestionar el cambio.",
  },
  {
    question: "¿Cómo elijo mi talle?",
    answer:
      "Cada producto tiene una guía de talles disponible. Si tenés dudas, escribinos por WhatsApp y te asesoramos con gusto.",
  },
  {
    question: "¿Hacen envíos a todo el país?",
    answer:
      "Sí, enviamos a todo el territorio argentino a través de Correo Argentino. Podés calcular el costo de envío ingresando tu código postal en el carrito.",
  },
];

export default function FAQ() {
  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-center mb-8">
          Preguntas frecuentes
        </h1>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-sm px-4">
              <AccordionTrigger className="font-body text-sm font-medium text-left py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="font-body text-sm text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
}
