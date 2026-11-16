import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang, useT } from "@/i18n/lang";
import { CountUp } from "./motion";
import type { Course } from "./types";

const T = {
  en: {
    breadcrumb: "Breadcrumb", all: "All courses", free: "FREE", lessons: "lessons", hours: "hours", selfPaced: "Self-paced",
    noReviews: "No learner reviews yet", learners: "enrolled learners", startFree: "Start for free", enroll: "Enroll now", curriculum: "See curriculum",
    rating: (a: string, n: string) => `${a} out of 5 from ${n} approved reviews`,
    level: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as Record<string, string>,
  },
  bn: {
    breadcrumb: "ব্রেডক্রাম্ব", all: "সব কোর্স", free: "বিনামূল্যে", lessons: "টি পাঠ", hours: "ঘণ্টা", selfPaced: "নিজের গতিতে",
    noReviews: "এখনও কোনো রিভিউ নেই", learners: "জন শিক্ষার্থী ভর্তি", startFree: "বিনামূল্যে শুরু করুন", enroll: "এখনই ভর্তি হন", curriculum: "কারিকুলাম দেখুন",
    rating: (a: string, n: string) => `অনুমোদিত ${n}টি রিভিউ থেকে ৫-এর মধ্যে ${a}`,
    level: { beginner: "শুরুর স্তর", intermediate: "মধ্যম স্তর", advanced: "উন্নত স্তর" } as Record<string, string>,
  },
};

interface CourseHeroProps {
  course: Course;
  totalLessons: number;
  reviewAverage: number | null;
  reviewCount: number;
  isFree: boolean;
  onEnroll: () => void;
  onSeeCurriculum: () => void;
}

const CourseHero = ({ course, totalLessons, reviewAverage, reviewCount, isFree, onEnroll, onSeeCurriculum }: CourseHeroProps) => {
  const t = useT(T);
  const { num } = useLang();
  const reduce = useReducedMotion();
  const level = course.difficulty_level || "beginner";
  const summary = course.short_description || `${(course.description ?? "").substring(0, 160)}...`;

  // Minimal hero: no card chrome, no decoration — breadcrumb, quiet meta line, title, summary, two actions.
  const meta = [
    isFree ? t.free : null,
    t.level[level] ?? level,
    totalLessons ? `${num(totalLessons)} ${t.lessons}` : null,
    course.duration_hours ? `${num(Number(course.duration_hours))} ${t.hours}` : t.selfPaced,
    course.category?.name ?? null,
  ].filter(Boolean) as string[];

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-2"
    >
      <nav aria-label={t.breadcrumb} className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/courses" className="shrink-0 whitespace-nowrap hover:text-foreground">{t.all}</Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{course.title}</span>
      </nav>

      <p className="mb-3 text-sm font-medium text-primary">{meta.join(" · ")}</p>

      <h1 className="mb-4 max-w-3xl text-3xl font-extrabold leading-tight text-foreground md:text-4xl">{course.title}</h1>

      {(reviewAverage !== null || (course.student_count ?? 0) > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {reviewAverage !== null && (
            <span className="inline-flex items-center gap-1.5" aria-label={t.rating(num(Number(reviewAverage.toFixed(1))), num(reviewCount))}>
              <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">{reviewAverage.toFixed(1)}</span>
              (<CountUp value={reviewCount} format={num} />)
            </span>
          )}
          {(course.student_count ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden="true" />
              <CountUp value={course.student_count ?? 0} format={num} /> {t.learners}
            </span>
          )}
        </div>
      )}

      <p className="mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground">{summary}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={onEnroll} className="h-12 rounded-full px-8">
          {isFree ? t.startFree : t.enroll}
        </Button>
        <Button size="lg" variant="ghost" onClick={onSeeCurriculum} className="h-12 rounded-full px-6 text-primary hover:bg-primary/10">
          {t.curriculum}
        </Button>
      </div>
    </motion.section>
  );
};

export default CourseHero;
