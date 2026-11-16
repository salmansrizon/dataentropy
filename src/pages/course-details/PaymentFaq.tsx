import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { Reveal } from "./motion";

const T = { en: { title: "Payment questions" }, bn: { title: "পেমেন্ট সংক্রান্ত প্রশ্ন" } };

const PaymentFaq = ({ items }: { items?: SalesPage["payment_faq"] }) => {
  const t = useT(T);
  const { pick, num } = useLang();
  if (!items?.length) return null;
  return (
    <SectionShell id="payment-faq" title={t.title}>
      <Reveal>
        <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-6 shadow-card">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`pf-${i}`}>
              <AccordionTrigger className="text-left font-semibold text-foreground">
                <span className="flex items-start gap-3">
                  <span className="text-brand-blue">{num(i + 1)}.</span>
                  <span>{pick(it.question)}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-8 text-muted-foreground">{pick(it.answer)}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </SectionShell>
  );
};

export default PaymentFaq;
