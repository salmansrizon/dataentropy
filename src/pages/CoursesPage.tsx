import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { CardGridSkeleton } from "@/components/ui/skeletons";
import { useLang, useT } from "@/i18n/lang";
import { USE_SAMPLE, sampleCategories, sampleCourses, sampleWebinars } from "@/content/sampleContent";
import CatalogHero from "@/components/catalog/CatalogHero";
import CatalogCarousel, { type Tab } from "@/components/catalog/CatalogCarousel";
import UpcomingWebinarBanner from "@/components/catalog/UpcomingWebinarBanner";
import FeaturedCourses from "@/components/catalog/FeaturedCourses";
import { isFreeCourse, isRecorded, toItems, type Category, type Course, type Webinar } from "@/components/catalog/items";

const T = {
  en: { all: "All Courses", short: "Short Courses", recorded: "Recorded", free: "Free Courses", webinar: "Webinar" },
  bn: { all: "সব কোর্স", short: "শর্ট কোর্স", recorded: "রেকর্ডেড", free: "ফ্রি কোর্স", webinar: "ওয়েবিনার" },
};

const RESERVED = ["free courses", "free course", "webinar", "all", "regular", "recorded"];

export default function CoursesPage() {
  const t = useT(T);
  const { pick } = useLang();
  const [courses, setCourses] = useState<Course[]>([]);
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Navbar course search lands here as /courses?q=…
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  useEffect(() => {
    if (!urlQuery) return;
    setQuery(urlQuery);
    document.getElementById("all-courses")?.scrollIntoView({ block: "start" });
  }, [urlQuery]);
  const [tab, setTab] = useState("all");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => { if (!document.hidden) setTick((n) => n + 1); }, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(false);
      try {
        const [catRes, courseRes, webinarRes] = await Promise.all([
          supabase.from("course_categories" as any).select("*").order("name"),
          supabase.from("courses").select("*").eq("status", "published").order("created_at", { ascending: false }),
          supabase.from("webinars").select("*").in("status", ["published", "upcoming"]).order("webinar_date", { ascending: true }),
        ]);
        if (catRes.error) console.error("Error fetching categories:", catRes.error);
        if (webinarRes.error) console.error("Error fetching webinars:", webinarRes.error);
        setCategories((catRes.data as any[]) || []);
        if (courseRes.error) throw courseRes.error;
        setCourses((courseRes.data as any[]) || []);
        setWebinars((webinarRes.data as Webinar[]) || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [attempt]);

  const useSamples = !isLoading && !error && USE_SAMPLE && !courses.length && !webinars.length;
  const cs: Course[] = useSamples ? (sampleCourses as unknown as Course[]) : courses;
  const ws: Webinar[] = useSamples ? (sampleWebinars as unknown as Webinar[]) : webinars;
  const cats: Category[] = useSamples ? sampleCategories.map((c) => ({ id: c.id, name: pick(c.name) })) : categories;

  const tabs = useMemo<Tab[]>(() => {
    const names = new Set(cats.map((c) => c.name.toLowerCase().trim()));
    const types = Array.from(new Set(cs.map((c) => c.course_type).filter(Boolean))) as string[];
    return [
      { id: "all", label: t.all },
      ...cats.filter((c) => !c.parent_id && !RESERVED.includes(c.name.toLowerCase().trim())).map((c) => ({ id: c.id, label: c.name })),
      ...types.filter((x) => !names.has(x.toLowerCase().trim()) && !RESERVED.includes(x.toLowerCase().trim())).map((x) => ({ id: `type:${x}`, label: x.charAt(0).toUpperCase() + x.slice(1) })),
      { id: "short", label: t.short },
      { id: "recorded", label: t.recorded },
      { id: "free", label: t.free },
      { id: "webinar", label: t.webinar },
    ];
  }, [cats, cs, t]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const okCourse = (c: Course) => {
      if (tab === "all") return true;
      if (tab === "short") return c.duration_hours != null && c.duration_hours <= 10;
      if (tab === "recorded") return isRecorded(c);
      if (tab === "free") return isFreeCourse(c);
      if (tab === "webinar") return c.course_type === "webinar";
      if (tab.startsWith("type:")) return c.course_type?.toLowerCase() === tab.slice(5).toLowerCase();
      return c.category_id === tab;
    };
    const okWebinar = (w: Webinar) => tab === "all" || tab === "webinar" || (tab === "free" && !!w.is_free);
    return toItems(cs.filter(okCourse), ws.filter(okWebinar)).filter((i) => `${i.title} ${i.desc} ${i.kind === "course" ? i.c.description || "" : ""}`.toLowerCase().includes(q));
  }, [cs, ws, tab, query]);

  const nextWebinar = useMemo(
    () => ws.filter((w) => new Date(w.webinar_date).getTime() > Date.now()).sort((a, b) => +new Date(a.webinar_date) - +new Date(b.webinar_date))[0],
    [ws],
  );

  const byPopular = useMemo(() => [...cs].sort((a, b) => (b.student_count || 0) - (a.student_count || 0)), [cs]);
  const popular = byPopular[0];
  const second = popular && (byPopular.find((c) => c.id !== popular.id && isRecorded(c)) || byPopular[1]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CatalogHero courses={cs.length} webinars={ws.length} loading={isLoading} query={query} onQuery={setQuery} />
      {isLoading ? (
        <div id="all-courses" className="container mx-auto px-4 py-16">
          <CardGridSkeleton count={3} className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3" />
        </div>
      ) : (
        <CatalogCarousel tabs={tabs} active={tab} onTab={setTab} items={items} onClear={() => { setQuery(""); setTab("all"); }} error={error} onRetry={() => setAttempt((n) => n + 1)} />
      )}
      {nextWebinar && <UpcomingWebinarBanner webinar={nextWebinar} />}
      {popular && <FeaturedCourses left={popular} right={second} />}
    </div>
  );
}
