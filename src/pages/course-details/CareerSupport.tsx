import { CheckCircle2 } from "lucide-react";
import LottieAnimation from "@/components/LottieAnimation";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { RevealGroup, RevealItem } from "./motion";
import { SECTION_IDS } from "./types";

const T = {
  en: { eyebrow: "Career support", title: "We help you land the job", sub: "Support that continues after the final class." },
  bn: { eyebrow: "ক্যারিয়ার সাপোর্ট", title: "চাকরি পেতে আমরা পাশে আছি", sub: "শেষ ক্লাসের পরেও সাপোর্ট চলতে থাকে।" },
};

const CareerSupport = ({ groups }: { groups?: SalesPage["career_support"] }) => {
  const t = useT(T);
  const { pick } = useLang();
  if (!groups?.length) return null;
  return (
    <SectionShell id={SECTION_IDS.career} eyebrow={t.eyebrow} title={t.title}>
      <div className="mb-6 flex items-center gap-4">
        <div aria-hidden="true">
          <LottieAnimation src="/animations/roadmap-journey.json" className="h-28 w-40" />
        </div>
        <p className="text-muted-foreground">{t.sub}</p>
      </div>
      <RevealGroup className="grid gap-4 md:grid-cols-2">
        {groups.map((g, i) => (
          <RevealItem key={i}>
            <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-card transition duration-200 hover:-translate-y-1">
              <h3 className="mb-4 font-semibold text-foreground">{pick(g.title)}</h3>
              <ul className="space-y-2">
                {g.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{pick(it)}</span>
                  </li>
                ))}
              </ul>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
};

export default CareerSupport;
