import { ArrowUpRight, BarChart3, Database, Route } from "lucide-react";
import LottieAnimation from "@/components/LottieAnimation";

export default function LearningHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-primary/15 bg-secondary/60 p-5 shadow-card sm:p-7" aria-label="DataEntropy learning paths">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-primary">Data skills for real work</p>
          <h2 className="mt-2 max-w-xs text-2xl font-extrabold tracking-tight sm:text-3xl">Learn clearly. Prove it confidently.</h2>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><ArrowUpRight className="h-5 w-5" aria-hidden="true" /></span>
      </div>
      <LottieAnimation src="/animations/data-insights.json" className="mx-auto my-3 aspect-square w-44 sm:w-56" />
      <div className="grid grid-cols-3 gap-2 border-t border-border/70 pt-4 text-center">
        {[
          [Database, "Practice", "SQL + Python"],
          [Route, "Roadmaps", "Next clear step"],
          [BarChart3, "Progress", "Evidence over hype"],
        ].map(([Icon, label, detail]) => {
          const Symbol = Icon as typeof Database;
          return <div key={label as string} className="min-w-0"><Symbol className="mx-auto h-4 w-4 text-primary" aria-hidden="true" /><p className="mt-1 truncate text-xs font-bold">{label as string}</p><p className="truncate text-[11px] text-muted-foreground">{detail as string}</p></div>;
        })}
      </div>
    </div>
  );
}
