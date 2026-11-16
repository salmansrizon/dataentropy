import { Link } from "react-router-dom";
import { USE_SAMPLE } from "@/content/sampleContent";
import { motion, useReducedMotion } from "framer-motion";
import { Rocket } from "lucide-react";
import { useT } from "@/i18n/lang";
import { Reveal } from "@/pages/course-details/motion";
import LottieAnimation from "@/components/LottieAnimation";
import "./landing-extras.css";

const T = {
  en: { l1: "Start your data career", l2: "journey today", sub: "A special limited-time offer is on!", cta: "Enroll now →" },
  bn: { l1: "আজই শুরু করুন আপনার", l2: "ডেটা ক্যারিয়ারের যাত্রা", sub: "সীমিত সময়ের জন্য বিশেষ অফার চলছে!", cta: "এখনই এনরোল করুন →" },
};

export default function LandingCta() {
  const t = useT(T);
  const reduce = useReducedMotion();
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="landing-cta-heading">
      <Reveal className="relative mx-auto grid max-w-7xl items-center gap-6 overflow-hidden rounded-3xl bg-brand-gradient p-8 text-primary-foreground sm:p-12 md:grid-cols-2">
        <span aria-hidden="true" className="pointer-events-none absolute -left-10 top-6 h-32 w-56 rounded-full bg-primary-foreground/15 blur-2xl" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-0 right-1/3 h-24 w-48 rounded-full bg-primary-foreground/15 blur-2xl" />
        <div className="relative">
          <h2 id="landing-cta-heading" className="text-3xl font-extrabold leading-tight sm:text-4xl">{t.l1}<br />{t.l2}</h2>
          {/* Offer line only with sample/preview data: no fake urgency in production. */}
          {USE_SAMPLE && <p className="mt-4 text-primary-foreground">{t.sub}</p>}
          <motion.div className="mt-8 inline-block" whileHover={reduce ? undefined : { scale: 1.04 }} whileTap={reduce ? undefined : { scale: 0.97 }}>
            <Link to="/courses" className="inline-flex rounded-full bg-card px-7 py-3 font-bold text-primary shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t.cta}</Link>
          </motion.div>
        </div>
        <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
          <LottieAnimation src="/animations/learning-journey.json" />
          <Rocket className="landing-rocket-float absolute -top-2 right-2 h-12 w-12 text-primary-foreground" />
        </div>
      </Reveal>
    </section>
  );
}
