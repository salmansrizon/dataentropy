import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CalendarCheck, Database, GraduationCap, Map, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { usePageView } from "@/hooks/usePageView";

const learningPaths = [
  { title: "Career Prep", description: "Practice SQL, Python, and business cases in an interactive challenge workspace.", href: "/career-prep", cta: "Start practicing", icon: Database, accent: "bg-series-data" },
  { title: "Guided Courses", description: "Build practical, job-ready skills through structured lessons and expert-led programs.", href: "/courses", cta: "Browse courses", icon: GraduationCap, accent: "bg-series-web" },
  { title: "Career Roadmaps", description: "Follow clear, step-by-step learning paths from your first concept to portfolio-ready work.", href: "/roadmaps", cta: "Explore roadmaps", icon: Map, accent: "bg-series-career" },
  { title: "Mentor Sessions", description: "Book focused one-to-one guidance for interviews, projects, and career decisions.", href: "/book-session", cta: "Book a session", icon: CalendarCheck, accent: "bg-series-webinar" },
];

const Index = () => {
  usePageView("/");
  const [counts, setCounts] = useState({ courses: 0, roadmaps: 0, challenges: 0 });

  useEffect(() => {
    let active = true;
    const fetchCounts = async () => {
      const [courses, roadmaps, challenges] = await Promise.all([
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("roadmaps").select("id", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("careerprep_questions").select("id", { count: "exact", head: true }).is("parent_id", null),
      ]);
      if (active) {
        setCounts({ courses: courses.count ?? 0, roadmaps: roadmaps.count ?? 0, challenges: challenges.count ?? 0 });
      }
    };
    void fetchCounts();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-40">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,hsl(var(--accent)/0.14),transparent_34%),radial-gradient(circle_at_10%_75%,hsl(var(--series-data)/0.12),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent">
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Learn data skills. Build career momentum.
              </div>
              <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                Turn data knowledge into <span className="text-accent">real-world confidence.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                DataEntropy brings practical courses, guided roadmaps, interview challenges, and personal mentoring into one focused learning platform.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="min-h-12 rounded-xl px-7 text-base" asChild>
                  <Link to="/career-prep">Start learning <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="min-h-12 rounded-xl px-7 text-base" asChild>
                  <Link to="/courses">Explore courses</Link>
                </Button>
              </div>
            </div>
            <Card className="border-border/70 bg-card/90 shadow-pop backdrop-blur">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-8 flex items-center gap-3">
                  <div className="rounded-xl bg-accent/10 p-3 text-accent"><BookOpen className="h-6 w-6" aria-hidden="true" /></div>
                  <div><p className="font-bold">One learning system</p><p className="text-sm text-muted-foreground">Built for consistent progress</p></div>
                </div>
                <dl className="grid grid-cols-3 gap-3">
                  {[[counts.challenges, "Challenges"], [counts.courses, "Courses"], [counts.roadmaps, "Roadmaps"]].map(([value, label]) => (
                    <div key={label} className="rounded-xl bg-secondary p-4 text-center">
                      <dt className="mt-1 text-xs font-semibold text-muted-foreground sm:text-sm">{label}</dt>
                      <dd className="text-2xl font-extrabold tabular-nums sm:text-3xl">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-6 rounded-xl border border-border bg-background p-5">
                  <p className="text-sm font-semibold text-muted-foreground">Your next step</p>
                  <p className="mt-1 text-lg font-bold">Practice one interview challenge today.</p>
                  <Link to="/career-prep" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    Open the practice workspace <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <section className="bg-secondary/70 px-4 py-20 sm:px-6 sm:py-24" aria-labelledby="learning-paths-heading">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Choose your path</p>
              <h2 id="learning-paths-heading" className="mt-3 text-3xl font-extrabold sm:text-5xl">Everything you need to move forward</h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">Learn a skill, prepare for an interview, or get direct guidance without switching between disconnected tools.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {learningPaths.map(({ title, description, href, cta, icon: Icon, accent }) => (
                <Link key={title} to={href} className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4">
                  <Card className="h-full border-border/70 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-hover">
                    <CardContent className="flex h-full flex-col p-6 sm:p-8">
                      <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl text-primary-foreground ${accent}`}><Icon className="h-6 w-6" aria-hidden="true" /></div>
                      <h3 className="text-2xl font-bold">{title}</h3>
                      <p className="mt-3 flex-1 leading-7 text-muted-foreground">{description}</p>
                      <span className="mt-7 inline-flex min-h-11 items-center font-bold text-accent">{cta} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
