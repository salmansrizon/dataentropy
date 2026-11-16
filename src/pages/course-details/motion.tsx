import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";

/** Fade + rise when scrolled into view. Static under prefers-reduced-motion. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.24, 1, 0.4, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Grid/list wrapper whose direct <RevealItem> children stagger in. */
export function RevealGroup({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} role={role}>{children}</div>;
  return (
    <motion.div
      role={role}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className, role }: { children: ReactNode; className?: string; role?: string }) {
  return (
    <motion.div
      role={role}
      className={className}
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
    >
      {children}
    </motion.div>
  );
}

/** Counts up to `value` once visible. `format` handles locale digits. */
export function CountUp({ value, format = String, className }: { value: number; format?: (n: number) => string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView || reduce) {
      if (reduce) setShown(value);
      return;
    }
    const controls = animate(0, value, { duration: 1.2, ease: "easeOut", onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, value]);
  return <span ref={ref} className={className}>{format(shown)}</span>;
}
