import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, CalendarCheck, CheckCircle2, Database, GraduationCap, Map, Route, ShieldCheck, Sparkles, Target, Timer, UserRound, Users, Wrench } from "lucide-react";
import Navbar from "@/components/Navbar";
import LearningHeroVisual from "@/components/LearningHeroVisual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageView } from "@/hooks/usePageView";
import { track, trackOnce } from "@/services/funnel";
import { motion, useReducedMotion } from "framer-motion";
import { CURRENT_LEVELS, TARGET_ROLES, WEEKLY_TIME, preferencesToSearch, recommendLearningPlan, type LearningPreferences } from "@/domain/learningPlan";

const learningPaths = [
  { title: "Career practice", description: "Solve SQL, Python, and business cases with feedback that explains your next move.", href: "/career-prep", cta: "Start a question", icon: Database, accent: "bg-series-data" },
  { title: "Guided courses", description: "Build a complete skill through ordered lessons, examples, and independent practice.", href: "/courses", cta: "Browse courses", icon: GraduationCap, accent: "bg-series-web" },
  { title: "Career roadmaps", description: "See what to learn now, what comes next, and how each skill supports your target role.", href: "/roadmaps", cta: "Explore roadmaps", icon: Map, accent: "bg-series-career" },
  { title: "Mentor sessions", description: "Bring an interview, project, or career decision and leave with a focused action plan.", href: "/book-session", cta: "Book a session", icon: CalendarCheck, accent: "bg-series-webinar" },
];

const planQuestions = [
  { key: "role", label: "Target role", icon: Target, options: TARGET_ROLES },
  { key: "level", label: "Current level", icon: UserRound, options: CURRENT_LEVELS },
  { key: "time", label: "Time each week", icon: Timer, options: WEEKLY_TIME },
] as const;

const valueProps = [
  [Users, "Learner-first", "Clear progress without noise"],
  [BarChart3, "Career growth", "Skills tied to real work"],
  [ShieldCheck, "Built by practitioners", "Feedback you can trust"],
  [Wrench, "Ready to apply", "Practice before pressure"],
] as const;

const learningFlow = [
  [Route, "Choose direction", "Pick a role and a realistic weekly pace."],
  [GraduationCap, "Learn", "Build the idea with focused explanations."],
  [Database, "Practice", "Solve SQL, Python, and business problems."],
  [ShieldCheck, "Prove", "Turn practice into visible evidence."],
] as const;

const Index = () => {
  usePageView("/");
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<LearningPreferences>({ role: TARGET_ROLES[0], level: CURRENT_LEVELS[0], time: WEEKLY_TIME[1] });

  useEffect(() => {
    void trackOnce('landing-viewed', { event: 'landing_viewed', surface: 'lobby' });
  }, []);
  const planPreview = recommendLearningPlan(preferences, []);

  const openPlan = () => {
    void trackOnce('diagnostic-started', { event: 'diagnostic_started', surface: 'lobby' });
    void track({ event: "diagnostic_completed", surface: "lobby", metadata: { ...preferences, weekly_time: preferences.time } });
    void track({ event: "engaged", surface: "lobby", metadata: { source: "skill_plan", ...preferences } });
    navigate(`/career-prep?${preferencesToSearch(preferences)}`);
  };

  const selectPreference = <K extends keyof LearningPreferences>(key: K, value: LearningPreferences[K]) => {
    void trackOnce('diagnostic-started', { event: 'diagnostic_started', surface: 'lobby' });
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main id="main-content">
        <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-36">
          <div className="relative mx-auto grid min-w-0 max-w-7xl items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <motion.div className="min-w-0" initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"><Sparkles className="h-4 w-4" aria-hidden="true" /> Practical learning for data careers</div>
              <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.07] tracking-tight sm:text-6xl lg:text-7xl">Build the data skills your <span className="text-primary">next role needs.</span></h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">Get a focused plan, learn through worked examples, then prove each skill with realistic practice questions—with no sign-up required to begin.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="min-h-12 rounded-full px-7 text-base shadow-card" asChild><a href="#skill-plan">Get my free skill plan <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></a></Button>
                <Button size="lg" variant="outline" className="min-h-12 rounded-full px-7 text-base text-foreground" asChild><Link to="/career-prep">Try a real question</Link></Button>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-muted-foreground">
                {["Start anonymously", "Practice with feedback", "Keep your progress"].map((item) => <span key={item} className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success-strong" aria-hidden="true" />{item}</span>)}
              </div>
            </motion.div>
            <LearningHeroVisual />
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 sm:pb-24" aria-label="Why learners choose DataEntropy">
          <div className="mx-auto grid max-w-6xl gap-3 rounded-2xl border border-border bg-card p-3 shadow-card sm:grid-cols-2 lg:grid-cols-4">
            {valueProps.map(([Icon, label, detail]) => <div key={label} className="flex items-center gap-3 px-3 py-3 sm:px-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0"><p className="text-sm font-bold">{label}</p><p className="text-xs text-muted-foreground">{detail}</p></div></div>)}
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 sm:pb-24" aria-labelledby="learning-flow-heading">
          <div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-sm font-bold text-primary">A clearer way forward</p><h2 id="learning-flow-heading" className="mt-3 text-3xl font-extrabold sm:text-5xl">From intention to evidence.</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">Every path keeps the next useful action visible, so learning stays calm and practical.</p></div>
            <ol className="mt-10 grid gap-4 md:grid-cols-4">
              {learningFlow.map(([Icon, title, detail], index) => <li key={title} className="relative border-t border-border pt-5 md:border-t-0 md:border-l md:pl-5"><span className="text-xs font-bold text-primary">0{index + 1}</span><Icon className="mt-4 h-6 w-6 text-primary" aria-hidden="true" /><h3 className="mt-4 text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>{index < learningFlow.length - 1 ? <ArrowRight className="absolute right-3 top-6 hidden h-4 w-4 text-primary/50 md:block" aria-hidden="true" /> : null}</li>)}
            </ol>
          </div>
        </section>

        <section id="skill-plan" className="scroll-mt-24 bg-secondary/70 px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="skill-plan-heading">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold text-primary">A useful answer in under a minute</p>
              <h2 id="skill-plan-heading" className="mt-3 text-3xl font-extrabold sm:text-5xl">Start with a plan that fits your week.</h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">Choose your goal, starting point, and available time. We’ll take you straight to the most useful first action—no account wall.</p>
            </div>
            <Card className="border-primary/15 shadow-pop"><CardContent className="space-y-6 p-5 sm:p-8">
              {planQuestions.map(({ key, label, icon: Icon, options }) => (
                <fieldset key={label}><legend className="mb-3 flex items-center gap-2 text-sm font-bold"><Icon className="h-4 w-4 text-primary" aria-hidden="true" />{label}</legend><div className="grid gap-2 sm:grid-cols-3">
                  {options.map((option) => <Button key={option} type="button" variant={preferences[key] === option ? "default" : "outline"} className="min-h-11 whitespace-normal rounded-full px-3" onClick={() => selectPreference(key, option)} aria-pressed={preferences[key] === option}>{option}</Button>)}
                </div></fieldset>
              ))}
              <motion.div key={`${preferences.level}-${preferences.time}`} initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-2 rounded-2xl bg-primary/5 p-3 text-center" aria-live="polite">
                <div><p className="text-lg font-extrabold text-primary">{planPreview.sessionsPerWeek}</p><p className="text-xs text-muted-foreground">sessions/week</p></div>
                <div><p className="text-lg font-extrabold text-primary">{planPreview.minutesPerSession}m</p><p className="text-xs text-muted-foreground">per session</p></div>
                <div><p className="text-lg font-extrabold text-primary">{planPreview.difficulty}</p><p className="text-xs text-muted-foreground">starting practice</p></div>
              </motion.div>
              <Button size="lg" className="min-h-12 w-full rounded-full text-base" onClick={openPlan}>Show my first step <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Button>
              <p className="text-center text-sm text-muted-foreground">Your selections are used only to open a relevant Journey.</p>
            </CardContent></Card>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="learning-paths-heading">
          <div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-sm font-bold text-primary">Learn, practise, get unstuck</p><h2 id="learning-paths-heading" className="mt-3 text-3xl font-extrabold sm:text-5xl">One clear next step, however you learn.</h2><p className="mt-4 text-lg leading-8 text-muted-foreground">Use a structured path or jump directly into the problem you need to solve today.</p></div>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {learningPaths.map(({ title, description, href, cta, icon: Icon, accent }) => <Link key={title} to={href} className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"><Card className="h-full border-border/80 transition duration-200 group-hover:-translate-y-1 group-hover:border-primary/20 group-hover:shadow-hover motion-reduce:transform-none"><CardContent className="flex h-full flex-col p-6 sm:p-8"><div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-primary-foreground ${accent}`}><Icon className="h-6 w-6" aria-hidden="true" /></div><h3 className="text-2xl font-bold">{title}</h3><p className="mt-3 flex-1 leading-7 text-muted-foreground">{description}</p><span className="mt-6 inline-flex min-h-11 items-center font-bold text-primary">{cta} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" /></span></CardContent></Card></Link>)}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
