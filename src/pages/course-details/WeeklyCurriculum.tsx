import { ClipboardList, FileQuestion, Video } from "lucide-react";
import PlanOverview from "./PlanOverview";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { Reveal } from "./motion";

const T = {
  en: { eyebrow: "Study plan", title: "Week-by-week plan", goal: "Goal", topics: "Topics", projects: "Projects", live: "live classes", quizzes: "quizzes", assignments: "assignments" },
  bn: { eyebrow: "স্টাডি প্ল্যান", title: "সপ্তাহভিত্তিক পরিকল্পনা", goal: "লক্ষ্য", topics: "টপিক", projects: "প্রজেক্ট", live: "লাইভ ক্লাস", quizzes: "কুইজ", assignments: "অ্যাসাইনমেন্ট" },
};

const WeeklyCurriculum = ({ curriculum }: { curriculum?: SalesPage["curriculum"] }) => {
  const t = useT(T);
  const { pick, num } = useLang();
  const phases = curriculum?.phases.filter((p) => p.weeks.length) ?? [];
  if (!phases.length) return null;

  return (
    <SectionShell id="weekly-plan" eyebrow={t.eyebrow} title={t.title}>
      {curriculum && <PlanOverview curriculum={curriculum} />}
      <div className="space-y-8">
        {phases.map((phase, pi) => (
          <Reveal key={pi}>
            <h3 className="mb-3 text-lg font-bold text-foreground">{pick(phase.title)}</h3>
            <Accordion type="multiple" className="space-y-3">
              {phase.weeks.map((w, wi) => {
                const chips = [
                  { Icon: Video, n: w.live_classes, label: t.live },
                  { Icon: FileQuestion, n: w.quizzes, label: t.quizzes },
                  { Icon: ClipboardList, n: w.assignments, label: t.assignments },
                ].filter((c) => c.n);
                return (
                  <AccordionItem key={wi} value={`${pi}-${wi}`} className="rounded-2xl border border-border bg-card px-5 shadow-card">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex flex-col gap-2">
                        <span>
                          <span className="mr-2 text-xs font-bold uppercase tracking-wider text-brand-blue">{pick(w.label)}</span>
                          <span className="font-semibold text-foreground">{pick(w.title)}</span>
                        </span>
                        {chips.length > 0 && (
                          <span className="flex flex-wrap gap-2">
                            {chips.map(({ Icon, n, label }) => (
                              <span key={label} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                                <Icon className="h-3 w-3" aria-hidden="true" />{num(n!)} {label}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      {w.goal && <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{t.goal}: </span>{pick(w.goal)}</p>}
                      {w.topics.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground">{t.topics}</h4>
                          <div className="flex flex-wrap gap-2">
                            {w.topics.map((x, i) => <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-brand-blue">{pick(x)}</span>)}
                          </div>
                        </div>
                      )}
                      {w.projects.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-sm font-semibold text-foreground">{t.projects}</h4>
                          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                            {w.projects.map((x, i) => <li key={i}>{pick(x)}</li>)}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
};

export default WeeklyCurriculum;
