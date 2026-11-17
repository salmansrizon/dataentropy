import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, CheckCircle2, Layout, Play, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLang, useT } from "@/i18n/lang";
import type { Course } from "./types";
import { priceCourse } from "@/domain/coursePricing";

interface PriceCardProps {
  course: Course;
  isFree: boolean;
  ctaLabel: string;
  onCta: () => void;
  onShare: () => void;
  sampleAvailable: boolean;
  onTrySample: () => void;
}

const T = {
  en: {
    free: "FREE", batch: "Batch starts", share: "Share course", terms: "Payment, verification & refund terms", sample: "Try the first lesson free",
    includes: "This course includes", completion: "Completion is recorded lesson by lesson", preview: "Course Preview",
    playPreview: "Play course preview", enrollIn: "Enroll in this course",
  },
  bn: {
    free: "বিনামূল্যে", batch: "ব্যাচ শুরু", share: "কোর্স শেয়ার করুন", terms: "পেমেন্ট, যাচাই ও রিফান্ডের শর্তাবলি", sample: "প্রথম পাঠটি বিনামূল্যে দেখুন",
    includes: "এই কোর্সে যা আছে", completion: "প্রতিটি পাঠ ধরে ধরে সম্পন্ন হওয়া রেকর্ড হয়", preview: "কোর্স প্রিভিউ",
    playPreview: "কোর্স প্রিভিউ চালান", enrollIn: "এই কোর্সে ভর্তি হন",
  },
};

const ctaClass = (isFree: boolean) =>
  isFree ? "bg-primary text-primary-foreground hover:bg-primary-hover" : "bg-primary text-primary-foreground hover:bg-primary-hover";

const Price = ({ course, isFree, compact }: { course: Course; isFree: boolean; compact?: boolean }) => {
  const t = useT(T);
  const { num } = useLang();
  const size = compact ? "text-xl" : "text-4xl";
  const p = priceCourse(course);
  if (isFree || p.kind === "free") return <span className={cn(size, "font-bold text-primary")}>{t.free}</span>;
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={cn(size, "font-bold text-foreground")}>৳{num(p.charge)}</span>
      {p.listPrice ? (
        <>
          <span className="text-sm text-muted-foreground line-through">৳{num(p.listPrice)}</span>
          {p.discountPercent ? <Badge className="bg-primary/10 text-primary">-{num(p.discountPercent)}%</Badge> : null}
        </>
      ) : null}
    </div>
  );
};

export const PriceCard = ({ course, isFree, ctaLabel, onCta, onShare, sampleAvailable, onTrySample }: PriceCardProps) => {
  const t = useT(T);
  const { date } = useLang();
  const reduce = useReducedMotion();
  const [playingVideo, setPlayingVideo] = useState(false);
  const url = course.video_url;
  const isYoutube = !!url && (url.includes("youtube.com") || url.includes("youtu.be"));
  const includes = course.course_includes?.length
    ? course.course_includes
    : [course.access_terms, t.completion].filter((x): x is string => !!x);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="overflow-hidden rounded-3xl border border-border bg-card shadow-card"
    >
      <div className="group relative aspect-video bg-foreground">
        {playingVideo && url ? (
          isYoutube ? (
            <iframe
              src={`https://www.youtube.com/embed/${url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1]}?autoplay=1&rel=0&modestbranding=1`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={t.preview}
            />
          ) : (
            <video src={url} className="h-full w-full object-cover" controls autoPlay />
          )
        ) : course.banner_image ? (
          <button
            type="button"
            className="relative h-full w-full"
            aria-label={url ? t.playPreview : t.enrollIn}
            onClick={() => (url ? setPlayingVideo(true) : onCta())}
          >
            <img src={course.banner_image} alt={course.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 flex items-center justify-center bg-scrim/40 transition-all group-hover:bg-scrim/20">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary-foreground/30 bg-primary-foreground/20 backdrop-blur-xl transition-all group-hover:scale-110">
                <Play className="h-7 w-7 translate-x-0.5 fill-current text-primary-foreground" aria-hidden="true" />
              </span>
            </span>
          </button>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-gradient">
            <Layout className="h-12 w-12 text-primary-foreground/70" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="space-y-5 p-6">
        <Price course={course} isFree={isFree} />
        {course.start_date && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {t.batch} {date(course.start_date, { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}

        <div className="flex gap-2">
          <motion.div className="flex-1" animate={reduce ? undefined : { scale: [1, 1.02, 1] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }}>
            <Button onClick={onCta} className={cn("h-14 w-full rounded-xl text-base font-semibold", ctaClass(isFree))}>{ctaLabel}</Button>
          </motion.div>
          <Button variant="outline" onClick={onShare} aria-label={t.share} className="h-14 w-14 rounded-xl p-0">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {!isFree && (
          <a href="#faq" className="block text-xs font-semibold text-brand-blue underline-offset-4 hover:underline">{t.terms}</a>
        )}

        {!isFree && sampleAvailable && (
          <Button variant="outline" onClick={onTrySample} className="h-12 w-full rounded-xl">
            <Play className="mr-2 h-4 w-4" aria-hidden="true" />
            {t.sample}
          </Button>
        )}

        {includes.length > 0 && (
          <div className="border-t border-border pt-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">{t.includes}</h3>
            <ul className="space-y-2.5">
              {includes.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const MobileEnrollBar = ({ course, isFree, ctaLabel, onCta }: PriceCardProps) => (
  <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
    <div className="flex items-center justify-between gap-3">
      <Price course={course} isFree={isFree} compact />
      <Button onClick={onCta} className={cn("min-h-11 rounded-xl px-6 font-semibold", ctaClass(isFree))}>{ctaLabel}</Button>
    </div>
  </div>
);
