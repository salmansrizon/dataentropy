import { motion, useReducedMotion } from "framer-motion";
import { Lightbulb, MonitorPlay, UserCheck, Users } from "lucide-react";
import LottieAnimation from "@/components/LottieAnimation";
import { useT } from "@/i18n/lang";
import { Reveal, RevealGroup, RevealItem } from "@/pages/course-details/motion";
import "./landing-sections.css";

const T = {
  en: {
    eyebrow: "Why DataEntropy?",
    title1: "Not just courses,",
    title2: "your partner in building a career",
    f1: ["Practical", "projects & case studies"],
    f2: ["Expert mentors", "for guidance"],
    f3: ["Active community", "& peer support"],
  },
  bn: {
    eyebrow: "কেন DataEntropy?",
    title1: "শুধু কোর্স নয়,",
    title2: "এটি আপনার ক্যারিয়ার গড়ার সঙ্গী",
    f1: ["প্র্যাকটিক্যাল", "প্রজেক্ট ও কেস স্টাডি"],
    f2: ["এক্সপার্ট মেন্টর", "থেকে গাইডেন্স"],
    f3: ["সক্রিয় কমিউনিটি", "ও পিয়ার সাপোর্ট"],
  },
};

export default function WhyDataEntropy() {
  const t = useT(T);
  const reduce = useReducedMotion();
  const feats = [
    { Icon: MonitorPlay, l: t.f1 },
    { Icon: UserCheck, l: t.f2 },
    { Icon: Users, l: t.f3 },
  ];
  return (
    <section aria-labelledby="why-de-title" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{t.eyebrow}</span>
          <h2 id="why-de-title" className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">
            {t.title1}
            <br />
            {t.title2}
          </h2>
          <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-3">
            {feats.map(({ Icon, l }) => (
              <RevealItem key={l[0]}>
                <motion.div
                  whileHover={reduce ? undefined : { y: -4, scale: 1.02 }}
                  className="flex h-full flex-col items-start gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-sm font-bold leading-snug">
                    {l[0]}
                    <br />
                    <span className="font-medium text-muted-foreground">{l[1]}</span>
                  </h3>
                </motion.div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
        <Reveal className="relative mx-auto w-full max-w-md" delay={0.1}>
          <div aria-hidden="true" className="why-glow absolute -inset-6" />
          <LottieAnimation src="/animations/data-insights.json" className="relative aspect-square w-full" />
          <Lightbulb className="landing-bulb absolute right-2 top-2 h-10 w-10 text-brand-purple" aria-hidden="true" />
        </Reveal>
      </div>
    </section>
  );
}
