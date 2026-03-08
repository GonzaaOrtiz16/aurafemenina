import Layout from "@/components/store/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSiteSetting } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

interface FAQ {
  question: string;
  answer: string;
}

const defaultFaqs: FAQ[] = [
  { question: "¿Cómo realizo una compra?", answer: "Navegá por nuestros productos, seleccioná el talle y agregalo al carrito." },
];

export default function FAQ() {
  const { data: faqs, isLoading } = useSiteSetting<FAQ[]>("faqs");
  const items = faqs || defaultFaqs;

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-center mb-8">
          Preguntas frecuentes
        </h1>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {items.map((faq, i) => (
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
        )}
      </div>
    </Layout>
  );
}
