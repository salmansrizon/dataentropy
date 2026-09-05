import { ArrowDown, ArrowUpRight, BarChart3, Check, Database, Route } from "lucide-react";

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
      <div className="relative my-6 overflow-hidden rounded-xl border border-border/70 bg-card" aria-label="DataEntropy learning journey">
        <img src="/images/data-professional-hero.png" alt="Data professional reviewing analytics" className="h-64 w-full object-cover object-[center_25%] sm:h-72" />
        <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-white/30 bg-background/90 p-3 shadow-card backdrop-blur-sm">
          <div className="flex items-center justify-between"><p className="text-xs font-bold text-muted-foreground">Skills demonstrated</p><p className="text-sm font-extrabold text-primary">+24%</p></div>
          <svg viewBox="0 0 240 42" className="mt-2 h-10 w-full text-primary" role="img" aria-label="Upward learning progress graph" preserveAspectRatio="none"><path d="M0 36 C24 35 27 25 47 28 S72 33 91 22 S117 24 135 16 S162 18 179 10 S211 13 240 3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="animate-pulse" /><path d="M0 41H240" stroke="currentColor" strokeOpacity=".15" /></svg>
        </div>
      </div>
      <div className="space-y-2" aria-label="DataEntropy learning journey">
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 px-3 py-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary"><Route className="h-4 w-4" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Choose a direction</p><p className="truncate text-sm font-extrabold">Data Analyst · 5 hours/week</p></div><Check className="h-4 w-4 text-success-strong" aria-hidden="true" /></div>
        <div className="flex justify-center text-primary/60"><ArrowDown className="h-4 w-4" aria-hidden="true" /></div>
        <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-3 py-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Database className="h-4 w-4" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-primary">Do next</p><p className="truncate text-sm font-extrabold">Find each customer’s latest order</p></div><span className="text-xs font-bold text-primary">SQL</span></div>
        <div className="flex justify-center text-primary/60"><ArrowDown className="h-4 w-4" aria-hidden="true" /></div>
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/80 px-3 py-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-success-soft text-success-strong"><BarChart3 className="h-4 w-4" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Leave with evidence</p><p className="truncate text-sm font-extrabold">Skill demonstrated · next step ready</p></div><span className="text-xs font-bold text-success-strong">42%</span></div>
      </div>
      <p className="border-t border-border/70 pt-4 text-xs font-semibold text-muted-foreground">A calm path from intention to proof, built for real data work.</p>
    </div>
  );
}
