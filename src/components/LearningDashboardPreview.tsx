import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, BookOpenCheck, Check, Clock3, Database, Play } from "lucide-react";

const lessons = [
  { label: "SQL foundations", progress: "Complete", done: true },
  { label: "Window functions", progress: "8 min", done: false },
  { label: "Business case", progress: "Next", done: false },
];

const LearningDashboardPreview = () => {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" as const };

  return (
    <div className="relative mx-auto min-w-0 w-full max-w-xl" aria-label="Preview of a personalized DataEntropy learning plan">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-card p-4 shadow-pop sm:p-5"
      >
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><Database className="h-5 w-5" aria-hidden="true" /></span>
            <div className="min-w-0"><p className="truncate text-sm font-bold">Data Analyst plan</p><p className="truncate text-sm text-muted-foreground">Example week · 5 hours</p></div>
          </div>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Preview</span>
        </div>
        <div className="grid gap-4 pt-4 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl bg-secondary p-4">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-sm font-semibold text-muted-foreground">Do now</p><p className="mt-1 font-bold">Find each customer’s latest order</p></div>
              <motion.span animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Play className="h-4 w-4 fill-current" aria-hidden="true" /></motion.span>
            </div>
            <div className="mt-5 flex items-center gap-2" aria-label="Learning plan is 42 percent complete">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-background"><motion.div initial={reduceMotion ? false : { scaleX: 0 }} animate={{ scaleX: 0.42 }} transition={{ ...transition, delay: reduceMotion ? 0 : 0.2 }} className="h-full origin-left rounded-full bg-primary" /></div>
              <span className="text-xs font-bold tabular-nums">42%</span>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><BarChart3 className="h-4 w-4 text-accent" aria-hidden="true" /> Mastery</div>
            <p className="mt-3 text-3xl font-extrabold tabular-nums">7<span className="text-base text-muted-foreground">/12</span></p>
            <p className="mt-1 text-sm text-muted-foreground">skills demonstrated</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {lessons.map((lesson, index) => (
            <motion.div key={lesson.label} initial={reduceMotion ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...transition, delay: reduceMotion ? 0 : 0.12 + index * 0.07 }} className="flex min-h-12 items-center gap-3 rounded-xl border border-border bg-card px-3 py-2">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${lesson.done ? "bg-success-soft text-success-strong" : "bg-primary/10 text-primary"}`}>{lesson.done ? <Check className="h-4 w-4" aria-hidden="true" /> : <BookOpenCheck className="h-4 w-4" aria-hidden="true" />}</span>
              <span className="min-w-0 flex-1 text-sm font-semibold">{lesson.label}</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">{!lesson.done && <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />}{lesson.progress}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LearningDashboardPreview;
