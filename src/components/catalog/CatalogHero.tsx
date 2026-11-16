import { ArrowRight, BookOpen, Play, Search, Sparkles, Lightbulb, Video, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LottieAnimation from "@/components/LottieAnimation";
import { useLang, useT } from "@/i18n/lang";
import "./catalog.css";

const T = {
  en: { eyebrow: "DATA • AI • ENGINEERING", a: "Learn skills. Build systems. ", b: "Create impact.", sub: "Practical courses with clear outcomes, lesson previews, and a clear path from learning to real work.", explore: "Explore Courses", talk: "Talk to a practitioner", label: "Search course library", ph: "Try SQL, analytics, or Python", courses: "Courses", webinars: "Webinars", self: "Self-paced Learning" },
  bn: { eyebrow: "ডেটা • এআই • ইঞ্জিনিয়ারিং", a: "দক্ষতা শিখুন। সিস্টেম গড়ুন। ", b: "প্রভাব তৈরি করুন।", sub: "সুস্পষ্ট ফলাফল, লেসন প্রিভিউ এবং শেখা থেকে বাস্তব কাজে যাওয়ার পরিষ্কার পথসহ ব্যবহারিক কোর্স।", explore: "কোর্স দেখুন", talk: "প্র্যাকটিশনারের সাথে কথা বলুন", label: "কোর্স লাইব্রেরিতে খুঁজুন", ph: "SQL, অ্যানালিটিক্স বা Python লিখুন", courses: "কোর্স", webinars: "ওয়েবিনার", self: "নিজের গতিতে শেখা" },
};

const tile = "absolute hidden sm:grid place-items-center rounded-2xl border border-border bg-card shadow-card catalog-float";

export default function CatalogHero({ courses, webinars, loading, query, onQuery }: { courses: number; webinars: number; loading?: boolean; query: string; onQuery: (v: string) => void }) {
  const t = useT(T);
  const { num } = useLang();
  const stats = [
    { Icon: BookOpen, n: num(courses), l: t.courses, show: !loading && courses > 0 },
    { Icon: Video, n: num(webinars), l: t.webinars, show: !loading && webinars > 0 },
    { Icon: Sparkles, n: "", l: t.self, show: true },
  ].filter((x) => x.show);
  return (
    <section className="relative overflow-hidden bg-brand-surface pb-16 pt-32">
      <div className="catalog-blob absolute -left-24 top-20 h-80 w-80 rounded-full blur-3xl" aria-hidden="true" />
      <div className="catalog-blob absolute -right-24 bottom-0 h-96 w-96 rounded-full blur-3xl" aria-hidden="true" />
      <div className="container relative mx-auto grid items-center gap-10 px-4 lg:grid-cols-2">
        <div>
          <span className="mb-4 inline-flex rounded-full border border-primary/20 bg-card px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-primary shadow-sm">{t.eyebrow}</span>
          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl">
            {t.a}<span className="bg-brand-gradient bg-clip-text text-transparent">{t.b}</span>
          </h1>
          <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">{t.sub}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-7">
              <a href="#all-courses">{t.explore} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full bg-card px-7">
              <Link to="/book-session"><Play className="mr-2 h-4 w-4" aria-hidden="true" />{t.talk}</Link>
            </Button>
          </div>
          <div className="mt-8 max-w-xl">
            <label htmlFor="course-search" className="mb-2 block text-sm font-semibold">{t.label}</label>
            <div className="group relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" aria-hidden="true" />
              <Input id="course-search" value={query} onChange={(e) => onQuery(e.target.value)} placeholder={t.ph} className="h-12 rounded-full border-border bg-card pl-12 text-base shadow-sm" />
            </div>
          </div>
          <ul className="mt-6 flex max-w-xl flex-wrap gap-3">
            {stats.map(({ Icon, n, l }) => (
              <li key={l} className="flex min-w-[8.5rem] flex-1 items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="min-w-0 text-xs leading-tight text-muted-foreground">{n && <b className="block text-lg text-foreground">{n}</b>}{l}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto hidden w-full max-w-md lg:block" aria-hidden="true">
          <LottieAnimation src="/animations/data-insights.json" className="aspect-square w-full" />
          <div className={`${tile} -left-6 top-8 h-20 w-32 p-3`} style={{ animationDelay: "0s" }}><BarChart3 className="h-8 w-8 text-primary" /></div>
          <div className={`${tile} -right-4 top-24 h-14 w-14 font-mono text-lg font-bold text-primary`} style={{ animationDelay: "1.3s", animationDuration: "6s" }}>{"</>"}</div>
          <div className={`${tile} bottom-10 left-2 h-14 w-14 text-primary`} style={{ animationDelay: "2.4s", animationDuration: "4.4s" }}><Lightbulb className="h-7 w-7" /></div>
        </div>
      </div>
    </section>
  );
}
