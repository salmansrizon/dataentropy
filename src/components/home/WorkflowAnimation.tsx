import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Award, BookOpen, CheckCircle2, Code2 } from "lucide-react";
import { useT } from "@/i18n/lang";

const T = {
  en: { steps: ["Learn", "Practice", "Get feedback", "Get certified"] },
  bn: { steps: ["নিজে শিখুন", "প্র্যাকটিস", "ফিডব্যাক", "সার্টিফিকেট"] },
};
const ICONS = [BookOpen, Code2, CheckCircle2, Award];
const STEP_MS = 1400;

/** Looping step-by-step workflow: line fills node to node, active node pops + pings. Static (all done) under reduced motion. */
export default function WorkflowAnimation() {
  const t = useT(T);
  const reduce = useReducedMotion();
  const last = ICONS.length - 1;
  // 0..last = active step; last+1 = everything done (hold), then restart.
  const [step, setStep] = useState(reduce ? last + 1 : 0);

  useEffect(() => {
    if (reduce) return setStep(last + 1);
    const id = window.setInterval(() => setStep((s) => (s > last ? 0 : s + 1)), STEP_MS);
    return () => window.clearInterval(id);
  }, [reduce, last]);

  const progress = Math.min(step, last) / last; // 0..1 across the line

  return (
    <div className="relative mx-auto w-full max-w-md px-2 py-10">
      {/* track + animated fill, inset to node centres */}
      <div className="absolute left-[12.5%] right-[12.5%] top-[calc(2.5rem+1.5rem)] h-1 -translate-y-1/2 rounded-full bg-primary/15">
        <motion.div
          className="h-full rounded-full bg-brand-gradient"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: reduce ? 0 : STEP_MS / 1000 - 0.3, ease: "easeInOut" }}
        />
      </div>
      <ol className="relative grid grid-cols-4">
        {ICONS.map((Icon, i) => {
          const done = step > i;
          const active = step === i;
          return (
            <li key={i} className="flex flex-col items-center gap-3">
              <motion.span
                className={`relative grid h-12 w-12 place-items-center rounded-full border-2 transition-colors duration-300 ${
                  done || active ? "border-primary bg-primary text-primary-foreground shadow-brand" : "border-primary/20 bg-card text-primary"
                }`}
                animate={reduce ? undefined : { scale: active ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                {active && !reduce && <span className="absolute inset-0 rounded-full bg-primary/40 motion-safe:animate-ping" />}
                <Icon className="relative h-5 w-5" />
              </motion.span>
              <span className={`text-center text-xs font-semibold transition-colors duration-300 ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
                {t.steps[i]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
