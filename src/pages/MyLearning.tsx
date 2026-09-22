import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, Clock, GraduationCap, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { hasCourseAccess } from "@/domain/courseEnrollment";

const pendingStatuses = new Set(["pending", "submitted"]);

const statusMeta = (status: string) => {
  if (hasCourseAccess(status)) return { label: "Unlocked", className: "bg-success-soft text-success-strong border-success/20" };
  if (pendingStatuses.has(status)) return { label: "Payment pending", className: "bg-warning-soft text-warning border-warning/20" };
  if (status === "rejected" || status === "refunded") return { label: status, className: "bg-danger-soft text-danger-strong border-danger/20" };
  return { label: status || "Submitted", className: "bg-secondary text-muted-foreground border-border" };
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
  const { user, loading: authLoading } = useAuth();
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
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load your learning dashboard.");
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
        <header className="mb-10 overflow-hidden rounded-3xl border border-brand-blue/15 bg-card p-6 shadow-brand sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-blue dark:text-primary">LEARN. BUILD. TRANSFORM.</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-5xl">My Learning</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Continue approved Courses, track pending payments, and finish lesson by lesson.
              </p>
            </div>
            <Button className="min-h-12 rounded-xl bg-brand-blue hover:bg-brand-blue-hover" asChild>
              <Link to="/courses">Browse Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {[['Enrolled', stats.total], ['Active', stats.active], ['Pending', stats.pending], ['Complete', stats.completed]].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-brand-border bg-brand-surface p-4 dark:bg-secondary">
                <div className="text-2xl font-black text-foreground">{value}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </header>

        {authLoading || loading ? (
          <div className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <section className="rounded-3xl border border-danger/20 bg-danger-soft p-10 text-center">
            <h2 className="text-2xl font-black text-danger-strong">Learning data unavailable</h2>
            <p className="mx-auto mt-3 max-w-xl text-danger-strong/80">{error}</p>
            <Button className="mt-6 rounded-xl" onClick={() => window.location.reload()}>Try again</Button>
          </section>
        ) : !user ? (
          <section className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-card">
            <GraduationCap className="mx-auto h-14 w-14 text-primary" />
            <h2 className="mt-5 text-2xl font-black">Sign in to track your learning</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Your enrolled Courses, progress, and payment status live here.</p>
            <Button className="mt-6 rounded-xl" asChild><Link to="/auth">Sign in</Link></Button>
          </section>
        ) : courses.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-border bg-card p-10 text-center shadow-card">
            <GraduationCap className="mx-auto h-14 w-14 text-primary" />
            <h2 className="mt-5 text-2xl font-black">No enrolled Courses yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Enroll in a free Course or submit payment for a paid Course. Confirmed Courses appear here with progress.</p>
            <Button className="mt-6 rounded-xl" asChild><Link to="/courses">Find a Course</Link></Button>
          </section>
        ) : (
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((enrollment) => {
              const course = enrollment.courses!;
              const lessons = contentRows.filter((row) => row.course_id === enrollment.course_id);
              const progress = progressRows.filter((row) => row.course_id === enrollment.course_id);
              const completed = progress.filter((row) => row.completed).length;
              const total = lessons.length;
              const percent = total ? Math.round((completed / total) * 100) : 0;
              const lastOpened = [...progress].sort((a, b) => +new Date(b.last_opened_at) - +new Date(a.last_opened_at))[0];
              const unlocked = hasCourseAccess(enrollment.status) || course.is_free;
              const meta = statusMeta(enrollment.status);

              return (
                <article key={enrollment.id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative h-40 bg-primary text-primary-foreground">
                    {course.banner_image ? <img src={course.banner_image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
                    <div className="absolute inset-0 bg-scrim/45" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <Badge className={cn("mb-3 border bg-background/90 capitalize", meta.className)}>{meta.label}</Badge>
                      <h2 className="line-clamp-2 text-xl font-black leading-tight">{course.title}</h2>
                    </div>
                  </div>
                  <div className="space-y-5 p-5">
                    <p className="line-clamp-2 min-h-10 text-sm leading-6 text-muted-foreground">{course.short_description || "Continue your Course and complete each lesson at your pace."}</p>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm font-bold">
                        <span>{completed}/{total || "—"} lessons</span>
                        <span className="text-primary">{percent}%</span>
                      </div>
                      <Progress value={percent} className="h-2" />
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1"><BookOpen className="h-3.5 w-3.5" /> {course.difficulty_level || "Beginner"}</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1"><Clock className="h-3.5 w-3.5" /> {course.duration_hours ? `${course.duration_hours}h` : "Self-paced"}</span>
                      {percent === 100 && <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-success-strong"><CheckCircle2 className="h-3.5 w-3.5" /> Complete</span>}
                    </div>
                    {!unlocked && (
                      <div className="flex items-start gap-2 rounded-2xl border border-warning/20 bg-warning-soft p-3 text-sm text-warning">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>Access unlocks after payment confirmation.</span>
                      </div>
                    )}
                    <Button className="w-full rounded-xl" variant={unlocked ? "default" : "outline"} asChild>
                      <Link to={`/course/${course.id}${unlocked && lastOpened ? `?lesson=${lastOpened.content_id}` : ""}`}>{unlocked ? "Continue Course" : "View Course"}</Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}
