import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LottieAnimation from "@/components/LottieAnimation";
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

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-brand-grid bg-brand-surface rounded-3xl border border-brand-border p-6 sm:p-10"
    >
      <div aria-hidden="true" className="pointer-events-none absolute -right-6 top-1/2 hidden -translate-y-1/2 opacity-80 lg:block">
        <LottieAnimation src="/animations/learning-journey.json" className="h-72 w-72 xl:h-80 xl:w-80" />
      </div>
      <nav aria-label={t.breadcrumb} className="relative mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/courses" className="hover:text-foreground">{t.all}</Link>
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate text-foreground">{course.title}</span>
      </nav>

      <div className="relative mb-4 flex flex-wrap items-center gap-2">
        {isFree && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">{t.free}</Badge>}
        <Badge variant="outline" className="">{t.level[level] ?? level}</Badge>
        <Badge variant="outline">{totalLessons ? <CountUp value={totalLessons} format={num} /> : "—"} {t.lessons}</Badge>
        <Badge variant="outline">{course.duration_hours ? `${num(Number(course.duration_hours))} ${t.hours}` : t.selfPaced}</Badge>
        {course.category?.name && <Badge variant="outline">{course.category.name}</Badge>}
      </div>

      <h1 className="page-heading relative mb-4 text-3xl font-extrabold leading-tight text-foreground md:text-4xl lg:max-w-[calc(100%-14rem)] lg:text-[42px]">{course.title}</h1>

      <div className="relative mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {reviewAverage === null ? (
          <span className="text-muted-foreground">{t.noReviews}</span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-card px-3 py-1 font-semibold"
            aria-label={t.rating(num(Number(reviewAverage.toFixed(1))), num(reviewCount))}
          >
            <Star className="h-4 w-4 fill-primary text-primary" aria-hidden="true" />
            {reviewAverage.toFixed(1)}
            <span className="font-normal text-muted-foreground">(<CountUp value={reviewCount} format={num} />)</span>
          </span>
        )}
        {(course.student_count ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" aria-hidden="true" />
            <CountUp value={course.student_count ?? 0} format={num} /> {t.learners}
          </span>
        )}
      </div>

      <p className="relative mb-8 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{summary}</p>

      <div className="relative flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={onEnroll} className="h-14 rounded-xl bg-brand-blue px-8 text-primary-foreground hover:bg-brand-blue-hover">
          {isFree ? t.startFree : t.enroll}
        </Button>
        <Button size="lg" variant="outline" onClick={onSeeCurriculum} className="h-14 rounded-xl px-8">
          {t.curriculum}
        </Button>
      </div>
    </motion.section>
  );
};

export default CourseHero;
