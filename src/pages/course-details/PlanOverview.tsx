import { motion, useReducedMotion } from "framer-motion";
import { CalendarRange, ClipboardList, FileQuestion, Flag, Video } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import { CountUp } from "./motion";
import "./plan-overview.css";

const T = {
  en: { weeks: "Weeks", live: "Live classes", quizzes: "Quizzes", assignments: "Assignments", phase: "Phase", week: "Week" },
  bn: { weeks: "সপ্তাহ", live: "লাইভ ক্লাস", quizzes: "কুইজ", assignments: "অ্যাসাইনমেন্ট", phase: "ধাপ", week: "সপ্তাহ" },
};

type Curriculum = NonNullable<SalesPage["curriculum"]>;

/**
 * Animated plan header built from the course's own data: count-up totals, and a
 * phase timeline whose line draws in, nodes pop in sequence, and one shimmer
 * loops along the track. Static under reduced motion.
 */
export default function PlanOverview({ curriculum }: { curriculum: Curriculum }) {
  const t = useT(T);
  const { pick, num } = useLang();
  const reduce = useReducedMotion();
  const phases = curriculum.phases.filter((p) => p.weeks.length);
  const weeks = phases.flatMap((p) => p.weeks);
  const sum = (k: "live_classes" | "quizzes" | "assignments") => weeks.reduce((n, w) => n + (w[k] ?? 0), 0);
  const stats = [
    { Icon: CalendarRange, value: weeks.length, label: t.weeks },
    { Icon: Video, value: sum("live_classes"), label: t.live },
    { Icon: FileQuestion, value: sum("quizzes"), label: t.quizzes },
    { Icon: ClipboardList, value: sum("assignments"), label: t.assignments },
  ].filter((s) => s.value > 0);

  // week ranges per phase (1-based, continuous across phases)
  let cursor = 0;
  const ranges = phases.map((p) => {
    const start = cursor + 1;
    cursor += p.weeks.length;
    return [start, cursor] as const;
  });

  const inView = { initial: reduce ? false : ("hidden" as const), whileInView: "show", viewport: { once: true, margin: "-60px" } };

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-brand-border bg-card shadow-card">
      {/* gradient banner */}
      <div className="relative overflow-hidden bg-brand-gradient px-6 py-7 text-primary-foreground sm:px-8">
        <div aria-hidden="true" className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-primary-foreground/15 blur-2xl" />
        {curriculum.summary && <p className="relative text-xl font-bold sm:text-2xl">{pick(curriculum.summary)}</p>}
        {stats.length > 0 && (
          <motion.ul {...inView} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map(({ Icon, value, label }) => (
              <motion.li key={label} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="rounded-2xl bg-primary-foreground/10 px-4 py-3 backdrop-blur-sm">
                <Icon className="h-4 w-4 opacity-80" aria-hidden="true" />
                <CountUp value={value} format={num} className="mt-1 block text-2xl font-extrabold tabular-nums" />
                <span className="text-xs opacity-90">{label}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>

      {/* phase timeline */}
      {phases.length > 0 && (
        <div className="bg-brand-grid px-6 py-8 sm:px-8">
          <div className="relative">
            <div aria-hidden="true" className="absolute left-5 right-5 top-5 hidden h-1 rounded-full bg-primary/15 sm:block">
              <motion.div
                className="plan-track relative h-full origin-left overflow-hidden rounded-full bg-brand-gradient"
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 1.1, ease: [0.24, 1, 0.4, 1] }}
              />
            </div>
            <motion.ol
              {...inView}
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18, delayChildren: 0.25 } } }}
              className="relative grid gap-6"
              style={{ gridTemplateColumns: `repeat(${Math.min(phases.length, 4)}, minmax(0, 1fr))` }}
            >
              {phases.map((p, i) => (
                <motion.li
                  key={i}
                  variants={{ hidden: { opacity: 0, scale: 0.6 }, show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 260, damping: 18 } } }}
                  className="flex flex-col items-center text-center sm:items-start sm:text-left"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full border-4 border-card bg-primary text-sm font-bold text-primary-foreground shadow-brand">
                    {i === phases.length - 1 ? <Flag className="h-4 w-4" aria-hidden="true" /> : num(i + 1)}
                  </span>
                  <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary">{t.phase} {num(i + 1)} · {ranges[i][0] === ranges[i][1] ? `${t.week} ${num(ranges[i][0])}` : `${t.week} ${num(ranges[i][0])}–${num(ranges[i][1])}`}</span>
                  <span className="mt-1 font-bold text-foreground">{pick(p.title)}</span>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </div>
      )}
    </div>
  );
}
