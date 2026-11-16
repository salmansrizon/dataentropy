import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ClipboardCheck, Code2, PlayCircle, Trophy } from "lucide-react";
import { useT } from "@/i18n/lang";
import "./landing-extras.css";

const T = {
  en: {
    eyebrow: "Learning roadmap",
    title: "Learn step by step, move ahead in your career",
    steps: [
      ["Learn", "Through video lessons"],
      ["Practice", "Practical projects"],
      ["Assess yourself", "Quizzes & assignments"],
      ["Get certified", "Proof of your achievement"],
    ],
  },
  bn: {
    eyebrow: "লার্নিং রোডম্যাপ",
    title: "ধাপে ধাপে শিখুন, এগিয়ে যান ক্যারিয়ারের পথে",
    steps: [
      ["শিখুন", "ভিডিও লেসনের মাধ্যমে"],
      ["অনুশীলন করুন", "প্র্যাকটিক্যাল প্রজেক্ট"],
      ["নিজেকে মূল্যায়ন করুন", "কুইজ ও অ্যাসাইনমেন্ট"],
      ["সার্টিফিকেট পান", "আপনার অর্জনের প্রমাণ"],
    ],
  },
};
const ICONS = [PlayCircle, Code2, ClipboardCheck, Trophy];
const STEP_MS = 1800;

export default function LearningRoadmap() {
  const t = useT(T);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % ICONS.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [reduce, inView]);

  return (
    <section id="roadmap" className="px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="landing-roadmap-heading">
      <div className="mx-auto max-w-7xl text-center">
        <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{t.eyebrow}</p>
        <h2 id="landing-roadmap-heading" className="mt-4 text-3xl font-extrabold sm:text-4xl">{t.title}</h2>
        <motion.ol
          ref={ref}
          className="mt-14 grid gap-y-10 md:grid-cols-4 md:gap-x-12"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
        >
          {t.steps.map(([title, sub], i) => {
            const Icon = ICONS[i];
            const on = !reduce && active === i;
            return (
              <motion.li
                  key={title}
                  whileHover={reduce ? undefined : { y: -6 }}
                  className="relative"
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.24, 1, 0.4, 1] } } }}
                >
                  {/* active lift is CSS on this inner card: framer owns the <li>'s transform */}
                  <div className={`relative h-full rounded-2xl border bg-card px-5 pb-6 pt-8 shadow-card transition duration-300 motion-reduce:transition-none ${on ? "-translate-y-1 border-primary shadow-brand" : "border-border"}`}>
                  <span className="absolute -top-3.5 left-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                  <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full transition-colors duration-300 ${on ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
                  </div>
                  {/* arrow lives inside the <li> (valid list markup), centred in the gap to the next card */}
                  {i < ICONS.length - 1 && (
                    <span aria-hidden="true" className={`absolute -right-9 top-1/2 hidden -translate-y-1/2 text-2xl font-bold text-primary md:block ${on ? "landing-arrow-nudge" : "opacity-50"}`}>→</span>
                  )}
                </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}
