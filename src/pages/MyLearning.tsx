import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, Clock, GraduationCap, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, useReducedMotion } from "framer-motion";
import { useLang, useT } from "@/i18n/lang";
import { RevealGroup, RevealItem } from "@/pages/course-details/motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { hasCourseAccess } from "@/domain/courseEnrollment";

const pendingStatuses = new Set(["pending", "submitted"]);

const T = {
  en: {
    eyebrow: "LEARN. BUILD. TRANSFORM.", title: "My Learning",
    intro: "Continue approved Courses, track pending payments, and finish lesson by lesson.",
    browse: "Browse Courses", enrolled: "Enrolled", active: "Active", pending: "Pending", complete: "Complete",
    unlocked: "Unlocked", payPending: "Payment pending", rejected: "Rejected", refunded: "Refunded", submitted: "Submitted",
    unavailable: "Learning data unavailable", loadFail: "Could not load your learning dashboard.", retry: "Try again",
    signInTitle: "Sign in to track your learning", signInBody: "Your enrolled Courses, progress, and payment status live here.", signIn: "Sign in",
    emptyTitle: "No enrolled Courses yet", emptyBody: "Enroll in a free Course or submit payment for a paid Course. Confirmed Courses appear here with progress.", find: "Find a Course",
    fallbackDesc: "Continue your Course and complete each lesson at your pace.", lessons: "lessons", beginner: "Beginner", selfPaced: "Self-paced", hr: "h",
    locked: "Access unlocks after payment confirmation.", cont: "Continue Course", view: "View Course",
  },
  bn: {
    eyebrow: "শিখুন। গড়ুন। বদলে যান।", title: "আমার লার্নিং",
    intro: "অনুমোদিত কোর্স চালিয়ে যান, পেন্ডিং পেমেন্ট দেখুন এবং এক এক করে লেসন শেষ করুন।",
    browse: "কোর্স দেখুন", enrolled: "এনরোল করা", active: "চলমান", pending: "পেন্ডিং", complete: "সম্পন্ন",
    unlocked: "আনলকড", payPending: "পেমেন্ট পেন্ডিং", rejected: "বাতিল", refunded: "রিফান্ডেড", submitted: "জমা হয়েছে",
    unavailable: "লার্নিং তথ্য পাওয়া যাচ্ছে না", loadFail: "আপনার লার্নিং ড্যাশবোর্ড লোড করা যায়নি।", retry: "আবার চেষ্টা করুন",
    signInTitle: "লার্নিং ট্র্যাক করতে সাইন ইন করুন", signInBody: "আপনার এনরোল করা কোর্স, অগ্রগতি ও পেমেন্টের অবস্থা এখানেই থাকবে।", signIn: "সাইন ইন",
    emptyTitle: "এখনো কোনো কোর্সে এনরোল করা হয়নি", emptyBody: "ফ্রি কোর্সে এনরোল করুন বা পেইড কোর্সের পেমেন্ট জমা দিন। নিশ্চিত হওয়া কোর্স অগ্রগতিসহ এখানে দেখা যাবে।", find: "কোর্স খুঁজুন",
    fallbackDesc: "আপনার গতিতে কোর্স চালিয়ে যান এবং প্রতিটি লেসন শেষ করুন।", lessons: "লেসন", beginner: "বিগিনার", selfPaced: "নিজের গতিতে", hr: " ঘণ্টা",
    locked: "পেমেন্ট নিশ্চিত হলে অ্যাক্সেস আনলক হবে।", cont: "কোর্স চালিয়ে যান", view: "কোর্স দেখুন",
  },
};

const statusMeta = (status: string, t: typeof T.en) => {
  if (hasCourseAccess(status)) return { label: t.unlocked, className: "bg-success-soft text-success-strong border-success/20" };
  if (pendingStatuses.has(status)) return { label: t.payPending, className: "bg-warning-soft text-warning border-warning/20" };
  if (status === "rejected" || status === "refunded") return { label: status === "rejected" ? t.rejected : t.refunded, className: "bg-danger-soft text-danger-strong border-danger/20" };
  return { label: t.submitted, className: "bg-secondary text-muted-foreground border-border" };
};

interface EnrollmentRow {
  id: string;
  status: string;
  course_id: string;
  created_at: string;
  courses: {
    id: string;
    title: string;
    short_description: string | null;
    banner_image: string | null;
    is_free: boolean;
    duration_hours: number | null;
    difficulty_level: string | null;
  } | null;
}

interface ProgressRow {
  course_id: string;
  content_id: string;
  completed: boolean;
  last_opened_at: string;
}

interface ContentRow {
  id: string;
  course_id: string;
}

export default function MyLearning() {
  const { user, isAnonymous, loading: authLoading } = useAuth();
  // Visitors get an anonymous session; they have no enrolments to show, so treat them as signed out.
  const needsSignIn = !user || isAnonymous;
  const t = useT(T);
  const { num } = useLang();
  const reduce = useReducedMotion();
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [progressRows, setProgressRows] = useState<ProgressRow[]>([]);
  const [contentRows, setContentRows] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const { data: enrollmentData, error: enrollmentError } = await (supabase as any)
          .from("course_enrollments")
          .select("id,status,course_id,created_at,courses(id,title,short_description,banner_image,is_free,duration_hours,difficulty_level)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (enrollmentError) throw enrollmentError;

        const rows = (enrollmentData ?? []) as EnrollmentRow[];
        const courseIds = rows.map((row) => row.course_id);

        const [progressResult, outlineResult] = courseIds.length
          ? await Promise.all([
              (supabase as any)
                .from("course_lesson_progress")
                .select("course_id,content_id,completed,last_opened_at")
                .eq("user_id", user.id)
                .in("course_id", courseIds),
              (supabase as any)
                .from("course_content_outline")
                .select("id,course_id")
                .in("course_id", courseIds),
            ])
          : [{ data: [], error: null }, { data: [], error: null }];
        if (progressResult.error) throw progressResult.error;

        let contentResult = outlineResult;
        if (outlineResult.error && courseIds.length) {
          contentResult = await (supabase as any)
            .from("course_content")
            .select("id,course_id")
            .in("course_id", courseIds);
        }
        if (contentResult.error) throw contentResult.error;

        if (!cancelled) {
          setEnrollments(rows);
          setProgressRows((progressResult.data ?? []) as ProgressRow[]);
          setContentRows((contentResult.data ?? []) as ContentRow[]);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!authLoading) void load();
    return () => { cancelled = true; };
  }, [authLoading, user?.id]);

  const courses = useMemo(() => enrollments.filter((row) => row.courses), [enrollments]);
  const stats = useMemo(() => {
    let completedCourses = 0;
    let pendingCourses = 0;
    for (const enrollment of courses) {
      if (pendingStatuses.has(enrollment.status)) pendingCourses += 1;
      const lessons = contentRows.filter((row) => row.course_id === enrollment.course_id).length;
      const completed = progressRows.filter((row) => row.course_id === enrollment.course_id && row.completed).length;
      if (lessons > 0 && completed === lessons) completedCourses += 1;
    }
    return { total: courses.length, active: Math.max(courses.length - completedCourses - pendingCourses, 0), pending: pendingCourses, completed: completedCourses };
  }, [contentRows, courses, progressRows]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <motion.header
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.24, 1, 0.4, 1] }}
          className="mb-10 overflow-hidden rounded-3xl border border-brand-blue/15 bg-card p-6 shadow-brand sm:p-8"
        >
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-blue dark:text-primary">{t.eyebrow}</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">{t.title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {t.intro}
              </p>
            </div>
            <Button className="min-h-12 rounded-xl bg-brand-blue hover:bg-brand-blue-hover" asChild>
              <Link to="/courses">{t.browse} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          {!needsSignIn && <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([[t.enrolled, stats.total], [t.active, stats.active], [t.pending, stats.pending], [t.complete, stats.completed]] as const).map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-brand-border bg-brand-surface p-4 dark:bg-secondary">
                <div className="text-2xl font-black text-foreground">{num(value)}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>}
        </motion.header>

        {authLoading || loading ? (
          <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <section className="rounded-3xl border border-danger/20 bg-danger-soft p-10 text-center">
            <h2 className="text-2xl font-black text-danger-strong">{t.unavailable}</h2>
            <p className="mx-auto mt-3 max-w-xl text-danger-strong/80">{error || t.loadFail}</p>
            <Button className="mt-6 rounded-xl" onClick={() => window.location.reload()}>{t.retry}</Button>
          </section>
        ) : needsSignIn ? (
          <section className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-card">
            <GraduationCap className="mx-auto h-14 w-14 text-primary" />
            <h2 className="mt-5 text-2xl font-black">{t.signInTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.signInBody}</p>
            <Button className="mt-6 rounded-xl" asChild><Link to="/auth">{t.signIn}</Link></Button>
          </section>
        ) : courses.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-card">
            <GraduationCap className="mx-auto h-14 w-14 text-primary" />
            <h2 className="mt-5 text-2xl font-black">{t.emptyTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.emptyBody}</p>
            <Button className="mt-6 rounded-xl" asChild><Link to="/courses">{t.find}</Link></Button>
          </section>
        ) : (
          <RevealGroup className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((enrollment) => {
              const course = enrollment.courses!;
              const lessons = contentRows.filter((row) => row.course_id === enrollment.course_id);
              const progress = progressRows.filter((row) => row.course_id === enrollment.course_id);
              const completed = progress.filter((row) => row.completed).length;
              const total = lessons.length;
              const percent = total ? Math.round((completed / total) * 100) : 0;
              const lastOpened = [...progress].sort((a, b) => +new Date(b.last_opened_at) - +new Date(a.last_opened_at))[0];
              const unlocked = hasCourseAccess(enrollment.status) || course.is_free;
              const meta = statusMeta(enrollment.status, t);

              return (
                <RevealItem key={enrollment.id}>
                <article className="h-full overflow-hidden rounded-3xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transform-none">
                  <div className="relative h-40 bg-primary text-primary-foreground">
                    {course.banner_image ? <img src={course.banner_image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
                    <div className="absolute inset-0 bg-scrim/45" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <Badge className={cn("mb-3 border bg-background/90 capitalize", meta.className)}>{meta.label}</Badge>
                      <h2 className="line-clamp-2 text-xl font-black leading-tight">{course.title}</h2>
                    </div>
                  </div>
                  <div className="space-y-5 p-5">
                    <p className="line-clamp-2 min-h-10 text-sm leading-6 text-muted-foreground">{course.short_description || t.fallbackDesc}</p>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm font-bold">
                        <span>{num(completed)}/{total ? num(total) : "—"} {t.lessons}</span>
                        <span className="text-primary">{num(percent)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={reduce ? false : { width: 0 }}
                          whileInView={{ width: `${percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={reduce ? { width: `${percent}%` } : undefined}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1"><BookOpen className="h-3.5 w-3.5" /> {course.difficulty_level || t.beginner}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1"><Clock className="h-3.5 w-3.5" /> {course.duration_hours ? `${num(course.duration_hours)}${t.hr}` : t.selfPaced}</span>
                      {percent === 100 && <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-success-strong"><CheckCircle2 className="h-3.5 w-3.5" /> {t.complete}</span>}
                    </div>
                    {!unlocked && (
                      <div className="flex items-start gap-2 rounded-2xl border border-warning/20 bg-warning-soft p-3 text-sm text-warning">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{t.locked}</span>
                      </div>
                    )}
                    <Button className="w-full rounded-xl" variant={unlocked ? "default" : "outline"} asChild>
                      <Link to={`/course/${course.id}${unlocked && lastOpened ? `?lesson=${lastOpened.content_id}` : ""}`}>{unlocked ? t.cont : t.view}</Link>
                    </Button>
                  </div>
                </article>
                </RevealItem>
              );
            })}
          </RevealGroup>
        )}
      </main>
    </div>
  );
}
