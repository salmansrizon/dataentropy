import { GraduationCap, PlayCircle, Star, Rocket } from "lucide-react";
import { useLang } from "@/i18n/lang";
import { USE_SAMPLE, sampleLandingStats } from "@/content/sampleContent";
import { CountUp } from "@/pages/course-details/motion";

const ICONS = { learners: GraduationCap, hours: PlayCircle, satisfaction: Star, support: Rocket };

export default function StatsBar() {
  const { pick, num } = useLang();
  if (!USE_SAMPLE) return null;
  return (
    <div className="container relative z-20 -mt-16">
      <div className="grid grid-cols-2 gap-x-2 gap-y-6 rounded-3xl border border-brand-border bg-card p-4 shadow-xl sm:p-6 md:grid-cols-4 md:divide-x md:divide-border">
        {sampleLandingStats.map((s) => {
          const Icon = ICONS[s.icon];
          return (
            <div key={s.icon} className="flex flex-col items-start gap-2 px-2 sm:flex-row sm:items-center sm:gap-3 sm:px-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-surface text-brand-purple sm:h-12 sm:w-12">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <p className="text-xl font-bold tabular-nums text-foreground sm:text-2xl">
                  <CountUp value={s.value} format={num} />{s.suffix}
                </p>
                <p className="text-sm text-muted-foreground">{pick(s.label)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
