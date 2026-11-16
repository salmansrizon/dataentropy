import { Award, BookOpen, Calendar, Infinity as InfinityIcon, LifeBuoy, LineChart, Rocket, Sparkles, Users, Video, type LucideIcon } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { RevealGroup, RevealItem } from "./motion";

const T = { en: { title: "What you get" }, bn: { title: "যা যা পাচ্ছেন" } };

const ICONS: Record<string, LucideIcon> = {
  calendar: Calendar, video: Video, rocket: Rocket, chart: LineChart, "life-buoy": LifeBuoy,
  users: Users, infinity: InfinityIcon, book: BookOpen, award: Award,
};

const FeatureGrid = ({ features }: { features?: SalesPage["features"] }) => {
  const t = useT(T);
  const { pick } = useLang();
  if (!features?.length) return null;
  return (
    <SectionShell id="features" title={t.title}>
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => {
          const Icon = ICONS[(f.icon ?? "").toLowerCase()] ?? Sparkles;
          return (
            <RevealItem key={i}>
              <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-card transition duration-200 hover:-translate-y-1">
                <div aria-hidden className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground">{pick(f.title)}</h3>
                {f.description && <p className="mt-2 text-sm text-muted-foreground">{pick(f.description)}</p>}
              </article>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </SectionShell>
  );
};

export default FeatureGrid;
