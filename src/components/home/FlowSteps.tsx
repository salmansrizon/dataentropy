import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";

const STEP_MS = 1800;

/**
 * "Better way to learn" steps: cards stagger in, then the active step cycles
 * (card glow + icon pop), arrows nudge, and a progress track fills in sync.
 * Markup keeps li > span, svg, h3, p, svg so home-proposal.css still styles it.
 * Reduced motion: static, no cycling.
 */
export default function FlowSteps({ steps, icons }: { steps: readonly (readonly string[])[]; icons: readonly LucideIcon[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % steps.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [reduce, inView, steps.length]);

  const last = steps.length - 1;
  return (
    <>
      <motion.ol
        ref={ref}
        className="mt-10 grid gap-4 md:grid-cols-4"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
      >
        {steps.map(([title, detail], index) => {
          const Icon = icons[index];
          const on = !reduce && active === index;
          return (
            <motion.li
              key={title}
              data-active={on || undefined}
              className="home-flow-step relative border-t border-border pt-5 md:border-t-0 md:border-l md:pl-5"
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.24, 1, 0.4, 1] } } }}
            >
              <span className="text-xs font-bold text-primary">0{index + 1}</span>
              <Icon className="mt-4 h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
              {index < last ? <ArrowRight className="home-flow-arrow absolute right-3 top-6 hidden h-4 w-4 text-primary/50 md:block" aria-hidden="true" /> : null}
            </motion.li>
          );
        })}
      </motion.ol>

      {/* progress track synced with the active step */}
      <div className="mx-auto mt-10 hidden max-w-3xl md:block" aria-hidden="true">
        <div className="relative h-1.5 rounded-full bg-primary/15">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-brand-gradient"
            initial={false}
            animate={{ width: `${((reduce ? last : active) / last) * 100}%` }}
            transition={{ duration: reduce ? 0 : 0.6, ease: "easeInOut" }}
          />
          {steps.map((_, i) => (
            <span
              key={i}
              className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-300 ${
                (reduce ? true : i <= active) ? "border-primary bg-primary" : "border-primary/30 bg-card"
              }`}
              style={{ left: `${(i / last) * 100}%` }}
            >
              {!reduce && i === active && <span className="absolute inset-0 rounded-full bg-primary/50 motion-safe:animate-ping" />}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
