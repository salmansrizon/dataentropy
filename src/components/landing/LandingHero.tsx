import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLang, useT } from "@/i18n/lang";
import { USE_SAMPLE, landingVideoUrl } from "@/content/sampleContent";
import "./landing.css";

const T = {
  en: {
    l1: "Take your", l2a: "", l2b: "career", l2c: " to a", l3: "new height with data",
    sub: "Learn Data Analytics, BI and AI and build a future-ready career.",
    cta: "Browse courses", video: "Watch video",
    students: "learners", loved: "Learners love learning with us", generic: "Learn alongside thousands of learners",
    grow: "Grow Your Career",
    alt: "Illustrative portrait of a data professional beside an analytics workspace",
  },
  bn: {
    l1: "ডেটা দিয়ে", l2a: "নিজের ", l2b: "ক্যারিয়ার", l2c: "কে", l3: "নতুন উচ্চতায় নিয়ে যান",
    sub: "Data Analytics, BI এবং AI শিখে গড়ে তুলুন একটি ভবিষ্যৎ-প্রস্তুত ক্যারিয়ার।",
    cta: "কোর্স দেখে শুরু করুন", video: "ভিডিও দেখুন",
    students: "শিক্ষার্থী", loved: "শিক্ষার্থী আমাদের ভালোবাসার সাথে", generic: "হাজারো শিক্ষার্থীর সাথে শিখুন",
    grow: "Grow Your Career",
    alt: "অ্যানালিটিক্স ওয়ার্কস্পেসের পাশে একজন ডেটা প্রফেশনালের চিত্র",
  },
};

const AVATARS = ["A", "S", "R", "N"];
const AVATAR_TONES = ["bg-brand-blue", "bg-brand-indigo", "bg-brand-purple", "bg-brand-blue"];
const BARS = [40, 65, 50, 85, 70];

export default function LandingHero() {
  const t = useT(T);
  const { num } = useLang();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const item = (i: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.08 * i, ease: "easeOut" as const } };
  const btn = reduce ? {} : { whileHover: { scale: 1.04 }, whileTap: { scale: 0.97 } };

  return (
    <section className="relative overflow-hidden bg-brand-surface pb-24 pt-24 sm:pb-28 sm:pt-28">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-purple/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-brand-blue/15 blur-3xl" />

      <div className="container relative grid items-center gap-10 lg:grid-cols-2">
        <div>
          <motion.h1 {...item(0)} className="text-4xl font-bold leading-[1.25] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t.l1}<br />
            {t.l2a}<span className="text-brand-purple">{t.l2b}</span>{t.l2c}<br />
            {t.l3}
          </motion.h1>
          <motion.p {...item(1)} className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{t.sub}</motion.p>

          <motion.div {...item(2)} className="mt-8 flex flex-wrap gap-3">
            <motion.div {...btn}>
              <Button asChild size="lg" className="rounded-full bg-brand-gradient px-7 text-primary-foreground">
                <Link to="/courses">{t.cta} <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></Link>
              </Button>
            </motion.div>
            {landingVideoUrl && (
              <motion.div {...btn}>
                <Button size="lg" variant="outline" className="rounded-full px-7" onClick={() => setOpen(true)}>
                  <Play className="mr-2 h-4 w-4" aria-hidden /> {t.video}
                </Button>
              </motion.div>
            )}
          </motion.div>

          {USE_SAMPLE && (
          <motion.div {...item(3)} className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-3" aria-hidden>
              {AVATARS.map((a, i) => (
                <span key={a} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-card text-sm font-semibold text-primary-foreground ${AVATAR_TONES[i]}`}>{a}</span>
              ))}
            </div>
                          <div>
                <p className="font-semibold text-foreground">{num(10000)}+ {t.students}</p>
                <p className="text-sm text-muted-foreground">{t.loved}</p>
              </div>
          </motion.div>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-md">
          {/* edges fade into the hero background (mask), so the photo has no visible border */}
          <img src="/images/data-professional-hero.png" alt={t.alt} width={1024} height={1536} fetchPriority="high" className="hero-photo-fade relative z-10 block h-auto w-full" />

          <div aria-hidden className="landing-float absolute left-0 top-10 z-20 hidden rounded-2xl border border-brand-border bg-card p-3 shadow-lg sm:block">
            <div className="flex h-12 items-end gap-1.5">
              {BARS.map((h, i) => <span key={i} className="w-2.5 rounded-sm bg-brand-purple" style={{ height: `${h}%`, opacity: 0.45 + i * 0.13 }} />)}
            </div>
          </div>
          <div aria-hidden className="landing-float-b absolute -left-4 top-1/2 z-20 hidden rounded-2xl border border-brand-border bg-card p-3 shadow-lg sm:block">
            <div className="landing-donut h-14 w-14 rounded-full" />
          </div>
          <div aria-hidden className="landing-float-c absolute right-0 top-4 z-20 hidden items-center gap-1 rounded-full border border-brand-border bg-card px-3 py-1.5 text-xs font-semibold text-brand-purple shadow-lg sm:flex">
            {t.grow} <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
          <div aria-hidden className="landing-float-d absolute right-6 top-20 z-0 hidden sm:block">
            <span className="block h-0.5 w-6 -rotate-45 rounded bg-primary" />
            <span className="ml-3 mt-1.5 block h-0.5 w-4 rounded bg-primary" />
            <span className="ml-1 mt-1.5 block h-0.5 w-5 rotate-45 rounded bg-primary" />
          </div>
        </div>
      </div>

      {landingVideoUrl && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-3xl p-0">
            <DialogTitle className="sr-only">{t.video}</DialogTitle>
            {open && (
              <iframe
                className="aspect-video w-full rounded-lg"
                src={landingVideoUrl.replace("youtube.com", "youtube-nocookie.com")}
                title={t.video}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}
