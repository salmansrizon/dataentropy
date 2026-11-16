import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Clock, Code2, PieChart, TrendingUp } from "lucide-react";
import SideArrows from "@/components/home/SideArrows";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang, useT } from "@/i18n/lang";
import { USE_SAMPLE, sampleCourses } from "@/content/sampleContent";
import { RevealGroup, RevealItem } from "@/pages/course-details/motion";

const T = {
  en: {
    eyebrow: "Our courses",
    title1: "Choose the right course",
    title2: "to grow your skills",
    all: "View all courses →",
    more: "Learn more →",
    hours: "hours",
    prev: "Previous courses",
    next: "Next courses",
  },
  bn: {
    prev: "আগের কোর্স",
    next: "পরের কোর্স",
    eyebrow: "আমাদের কোর্সসমূহ",
    title1: "আপনার দক্ষতা বাড়ানোর জন্য",
    title2: "বেছে নিন সঠিক কোর্স",
    all: "সব কোর্স দেখুন →",
    more: "আরও জানুন →",
    hours: "ঘণ্টা",
  },
};

type Course = {
  id: string;
  title: string;
  short_description: string | null;
  banner_image: string | null;
  duration_hours: number | null;
};

const covers = [
  { bg: "bg-brand-gradient", Icon: BarChart3 },
  { bg: "bg-gradient-to-br from-brand-indigo to-brand-indigo/60", Icon: PieChart },
  { bg: "bg-gradient-to-br from-brand-blue to-brand-blue/60", Icon: Code2 },
  { bg: "bg-gradient-to-br from-brand-purple to-brand-purple/60", Icon: TrendingUp },
];

export default function LandingCourses() {
  const t = useT(T);
  const { num } = useLang();
  const reduce = useReducedMotion();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let live = true;
    supabase
      .from("courses")
      .select("id,title,short_description,banner_image,duration_hours")
      .eq("status", "published")
      .order("student_count", { ascending: false, nullsFirst: false })
      .limit(8)
      .then(
        ({ data, error }) => {
          if (!live) return;
          const rows = (error ? [] : (data ?? [])) as Course[];
          setCourses(rows.length === 0 && USE_SAMPLE ? sampleCourses : rows);
        },
        () => live && setCourses(USE_SAMPLE ? sampleCourses : []),
      );
    return () => {
      live = false;
    };
  }, []);

  if (courses && courses.length === 0) return null;

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };
  const item = "w-64 shrink-0 snap-start sm:w-72";

  return (
    <section aria-labelledby="landing-courses-title" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{t.eyebrow}</span>
            <h2 id="landing-courses-title" className="mt-3 text-2xl font-extrabold leading-tight sm:text-4xl">
              {t.title1}
              <br />
              {t.title2}
            </h2>
          </div>
          <Link to="/courses" className="rounded-md text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {t.all}
          </Link>
        </div>

        <div className="relative mt-8">
          {courses === null ? (
            <div className="flex gap-5 overflow-hidden">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`${item} overflow-hidden rounded-2xl border border-border bg-card`}>
                  <Skeleton className="aspect-[16/10] w-full rounded-none" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <RevealGroup>
                <ul ref={track} className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {courses.map((c, i) => {
                    const { bg, Icon } = covers[i % covers.length];
                    return (
                      <li key={c.id} className={item}>
                        <RevealItem className="h-full">
                          <motion.article
                            whileHover={reduce ? undefined : { y: -6 }}
                            className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
                          >
                            <div className={`relative aspect-[16/10] overflow-hidden ${bg}`}>
                              {c.banner_image ? (
                                <img src={c.banner_image} alt="" loading="lazy" className="h-full w-full object-cover" />
                              ) : (
                                <Icon className="absolute -bottom-4 -right-4 h-28 w-28 text-primary-foreground/80" aria-hidden="true" />
                              )}
                            </div>
                            <div className="flex flex-1 flex-col gap-2 p-4">
                              <h3 className="line-clamp-1 text-base font-bold">{c.title}</h3>
                              <p className="line-clamp-1 text-sm text-muted-foreground">{c.short_description}</p>
                              <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock className="h-4 w-4" aria-hidden="true" />
                                  {c.duration_hours ? `${num(c.duration_hours)} ${t.hours}` : "—"}
                                </span>
                                <Link
                                  to={c.id.startsWith("sample-") ? "/courses" : `/course/${c.id}`}
                                  className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-primary transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  {t.more}
                                </Link>
                              </div>
                            </div>
                          </motion.article>
                        </RevealItem>
                      </li>
                    );
                  })}
                </ul>
              </RevealGroup>
              <SideArrows onPrev={() => scroll(-1)} onNext={() => scroll(1)} prevLabel={t.prev} nextLabel={t.next} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
