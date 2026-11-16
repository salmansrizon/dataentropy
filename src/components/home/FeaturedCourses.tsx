import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import SideArrows from "./SideArrows";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang, useT, type Bi } from "@/i18n/lang";
import { parseSalesPage } from "@/pages/course-details/salesPage";
import { USE_SAMPLE, sampleCategories, sampleCourses } from "@/content/sampleContent";

const T = {
  en: {
    eyebrow: "Upcoming courses",
    title: "Pick your next batch",
    sub: "Live batches with projects and support. Seats are limited.",
    all: "All",
    starts: "Starts",
    seats: "seats left",
    free: "FREE",
    view: "View details",
    more: "View all courses",
    prev: "Previous courses",
    next: "Next courses",
    cats: "Course categories",
    students: "learners",
  },
  bn: {
    eyebrow: "আসন্ন কোর্স",
    title: "আপনার পরবর্তী ব্যাচ বেছে নিন",
    sub: "প্রজেক্ট ও সাপোর্টসহ লাইভ ব্যাচ। আসন সীমিত।",
    all: "সব",
    starts: "শুরু",
    seats: "আসন বাকি",
    free: "ফ্রি",
    view: "বিস্তারিত দেখুন",
    more: "সব কোর্স দেখুন",
    prev: "আগের কোর্স",
    next: "পরের কোর্স",
    cats: "কোর্সের ক্যাটাগরি",
    students: "শিক্ষার্থী",
  },
};

type Course = {
  id: string;
  title: string;
  category_id: string | null;
  start_date: string | null;
  sales_page: unknown;
  price: number | null;
  discounted_price: number | null;
  discount_percentage: number | null;
  is_free: boolean | null;
  student_count: number | null;
  banner_image: string | null;
};
type Cat = { id: string; name: Bi };

export default function FeaturedCourses() {
  const t = useT(T);
  const { num, pick, date } = useLang();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [cats, setCats] = useState<Cat[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [sample, setSample] = useState(false);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let live = true;
    Promise.all([
      supabase
        .from("courses")
        .select("id,title,category_id,start_date,sales_page,price,discounted_price,discount_percentage,is_free,student_count,banner_image")
        .eq("status", "published")
        .order("start_date", { ascending: true, nullsFirst: false }),
      supabase.from("course_categories").select("id,name"),
    ]).then(([c, k]) => {
      if (!live) return;
      const rows = (c.error ? [] : (c.data ?? [])) as unknown as Course[];
      if (rows.length === 0 && USE_SAMPLE) {
        setSample(true);
        setCourses(sampleCourses);
        setCats(sampleCategories);
      } else {
        setCourses(rows);
        setCats((k.data ?? []) as Cat[]);
      }
    }, () => {
      // Network/RLS failure: never leave the skeleton up forever.
      if (live) setCourses(USE_SAMPLE ? sampleCourses : []);
    });
    return () => {
      live = false;
    };
  }, []);

  if (courses && courses.length === 0) return null;

  const shown = courses?.filter((c) => !active || c.category_id === active) ?? [];
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const tile = (on: boolean) =>
    `rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
      on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-secondary"
    }`;

  return (
    <section aria-labelledby="upcoming-courses-title" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold text-primary">{t.eyebrow}</p>
        <h2 id="upcoming-courses-title" className="mt-3 text-3xl font-extrabold sm:text-5xl">{t.title}</h2>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{t.sub}</p>

        {courses === null ? (
          <div className="mt-10 flex gap-6 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-80 shrink-0 overflow-hidden rounded-2xl border border-border bg-card">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {cats.length > 0 && (
              <div role="group" aria-label={t.cats} className="mt-8 flex flex-wrap gap-2">
                <button type="button" aria-pressed={active === null} onClick={() => setActive(null)} className={tile(active === null)}>
                  {t.all} ({num(courses.length)})
                </button>
                {cats.map((k) => (
                  <button key={k.id} type="button" aria-pressed={active === k.id} onClick={() => setActive(k.id)} className={tile(active === k.id)}>
                    {pick(k.name)} ({num(courses.filter((c) => c.category_id === k.id).length)})
                  </button>
                ))}
              </div>
            )}

            <div className="relative mt-8">
              <SideArrows onPrev={() => scroll(-1)} onNext={() => scroll(1)} prevLabel={t.prev} nextLabel={t.next} />
              <ul ref={track} className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-4 pt-1">
                {shown.map((c) => {
                  const price = Number(c.price ?? 0);
                  const sale = Number(c.discounted_price ?? 0);
                  const discounted = !c.is_free && sale > 0 && sale < price;
                  const pct = c.discount_percentage || (discounted ? Math.round((1 - sale / price) * 100) : 0);
                  const batch = parseSalesPage(c.sales_page).batch;
                  const left = batch?.seats_left;
                  return (
                    <li key={c.id} className="w-72 shrink-0 snap-start sm:w-80">
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition duration-200 hover:-translate-y-1 motion-reduce:transform-none">
                        <div className="relative aspect-video overflow-hidden bg-brand-gradient">
                          {c.banner_image ? (
                            <img src={c.banner_image} alt={c.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                          ) : (
                            <p className="flex h-full items-center p-5 text-lg font-extrabold leading-snug text-primary-foreground">{c.title}</p>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          {c.start_date && <p className="text-xs font-semibold text-primary">{t.starts} {date(c.start_date)}</p>}
                          <h3 className="mt-2 text-lg font-bold leading-snug text-foreground">{c.title}</h3>
                          {batch?.name && <p className="mt-1 text-sm text-muted-foreground">{pick(batch.name)}</p>}
                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {c.student_count ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Users className="h-4 w-4" aria-hidden="true" />
                                {num(c.student_count)} {t.students}
                              </span>
                            ) : null}
                            {left != null && (
                              <span className={left <= 15 ? "font-semibold text-primary" : ""}>
                                {num(left)} {t.seats}
                              </span>
                            )}
                          </div>
                          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                            {c.is_free ? (
                              <span className="text-lg font-black text-primary">{t.free}</span>
                            ) : (
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-lg font-black text-foreground">৳{num(discounted ? sale : price)}</span>
                                {discounted && (
                                  <>
                                    <span className="text-sm text-muted-foreground line-through">৳{num(price)}</span>
                                    {pct > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">-{num(pct)}%</span>}
                                  </>
                                )}
                              </span>
                            )}
                            <Link
                              to={sample ? "/courses" : `/course/${c.id}`}
                              className="rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {t.view}
                            </Link>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <Button asChild size="lg" variant="outline">
            <Link to="/courses">
              {t.more} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
