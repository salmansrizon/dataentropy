import { ArrowUpRight } from "lucide-react";
import LottieAnimation from "@/components/LottieAnimation";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { RevealGroup, RevealItem } from "./motion";
import { SECTION_IDS } from "./types";

const T = {
  en: { eyebrow: "Build real work", title: "Projects you will build", view: "View project" },
  bn: { eyebrow: "হাতে-কলমে কাজ", title: "যেসব প্রজেক্ট করবেন", view: "প্রজেক্ট দেখুন" },
};

const ProjectsSection = ({ projects }: { projects?: SalesPage["projects"] }) => {
  const t = useT(T);
  const { pick } = useLang();
  if (!projects?.length) return null;

  return (
    <SectionShell id={SECTION_IDS.projects} eyebrow={t.eyebrow} title={t.title}>
      <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <RevealItem key={i} className="h-full">
            <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition duration-200 hover:-translate-y-1">
              <div className="aspect-video bg-brand-surface">
                {p.image_url ? (
                  <img src={p.image_url} alt={pick(p.title)} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div aria-hidden="true" className="h-full w-full"><LottieAnimation src="/animations/data-insights.json" className="h-full w-full" /></div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-semibold text-foreground">{pick(p.title)}</h3>
                {p.description && <p className="mt-2 text-sm text-muted-foreground">{pick(p.description)}</p>}
                {p.link && (
                  <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-blue hover:text-brand-blue-hover">
                    {t.view}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
};

export default ProjectsSection;
