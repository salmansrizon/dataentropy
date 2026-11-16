import { useEffect, useRef, useState, type RefObject } from "react";
import { LivePulse } from "@/components/LivePulse";
import { isLiveNow } from "@/lib/liveWindow";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import SideArrows from "./SideArrows";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang, useT } from "@/i18n/lang";
import { RevealGroup, RevealItem } from "@/pages/course-details/motion";
import { USE_SAMPLE, sampleWebinars } from "@/content/sampleContent";

const T = {
  en: {
    eyebrow: "Demo classes",
    liveTitle: "Free live demo classes",
    recTitle: "Recorded demo classes",
    live: "Upcoming",
    liveNow: "Live now",
    prevRec: "Previous recorded classes",
    prevLive: "Previous live classes",
    nextLive: "Next live classes",
    nextRec: "Next recorded classes",
    booked: "booked",
    view: "View details",
    watch: "Watch",
    held: "Held on",
    all: "All",
    more: "See more",
    less: "See less",
  },
  bn: {
    eyebrow: "ডেমো ক্লাস",
    liveTitle: "ফ্রি লাইভ ডেমো ক্লাস",
    recTitle: "রেকর্ডেড ডেমো ক্লাস",
    live: "আসন্ন",
    liveNow: "এখন লাইভ",
    prevRec: "আগের রেকর্ডেড ক্লাস",
    prevLive: "আগের লাইভ ক্লাস",
    nextLive: "পরের লাইভ ক্লাস",
    nextRec: "পরের রেকর্ডেড ক্লাস",
    booked: "জন বুক করেছেন",
    view: "বিস্তারিত দেখুন",
    watch: "দেখুন",
    held: "অনুষ্ঠিত",
    all: "সব",
    more: "আরও দেখুন",
    less: "কম দেখুন",
  },
};

type Webinar = { id: string; title: string; description: string | null; banner_url: string | null; webinar_date: string; booked_count: number | null };

function Cover({ w }: { w: Webinar }) {
  return (
    <div className="relative aspect-video overflow-hidden bg-brand-gradient">
      {w.banner_url ? (
        <img src={w.banner_url} alt={w.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        <p className="flex h-full items-center p-5 text-lg font-extrabold leading-snug text-primary-foreground">{w.title}</p>
      )}
    </div>
  );
}

const card =
  "flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition duration-200 hover:-translate-y-1 motion-reduce:transform-none";
const link = "rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function DemoClassesHome() {
  const t = useT(T);
  const { num, date } = useLang();
  const [data, setData] = useState<{ up: Webinar[]; past: Webinar[]; sample: boolean } | null>(null);
  const recTrack = useRef<HTMLUListElement>(null);
  const upTrack = useRef<HTMLUListElement>(null);
  const scrollRow = (ref: RefObject<HTMLUListElement>, dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  useEffect(() => {
    let live = true;
    const cols = "id,title,description,banner_url,webinar_date,booked_count";
    const now = new Date(Date.now() - 2 * 3_600_000).toISOString();
    Promise.all([
      supabase.from("webinars").select(cols).gte("webinar_date", now).in("status", ["published", "upcoming"]).order("webinar_date", { ascending: true }),
      supabase.from("webinars").select(cols).lt("webinar_date", now).in("status", ["published", "upcoming"]).order("webinar_date", { ascending: false }).limit(6),
    ]).then(([u, p]) => {
      if (!live) return;
      const up = (u.error ? [] : u.data ?? []) as Webinar[];
      const past = (p.error ? [] : p.data ?? []) as Webinar[];
      if (!up.length && !past.length && USE_SAMPLE) {
        const nowMs = Date.now();
        const s = sampleWebinars as Webinar[];
        setData({
          up: s.filter((w) => +new Date(w.webinar_date) >= nowMs).sort((a, b) => +new Date(a.webinar_date) - +new Date(b.webinar_date)),
          past: s.filter((w) => +new Date(w.webinar_date) < nowMs).sort((a, b) => +new Date(b.webinar_date) - +new Date(a.webinar_date)),
          sample: true,
        });
      } else setData({ up, past, sample: false });
    }, () => {
      if (live) setData({ up: [], past: [], sample: false });
    });
    return () => {
      live = false;
    };
  }, []);

  if (data && !data.up.length && !data.past.length) return null;

  const to = (id: string) => (data?.sample ? "/courses" : `/webinar/${id}`);
  const time = { hour: "numeric", minute: "2-digit", day: "numeric", month: "short", year: "numeric" } as const;

  return (
    <section aria-labelledby="demo-live-title" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{t.eyebrow}</p>

        {data === null ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
                <Skeleton className="aspect-video w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {data.up.length > 0 && (
              <>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <h2 id="demo-live-title" className="text-3xl font-extrabold sm:text-4xl">{t.liveTitle}</h2>
                </div>
                <div className="relative">
                  <SideArrows onPrev={() => scrollRow(upTrack, -1)} onNext={() => scrollRow(upTrack, 1)} prevLabel={t.prevLive} nextLabel={t.nextLive} />
                  <ul ref={upTrack} className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-4 pt-1 motion-reduce:scroll-auto">
                  {data.up.map((w) => (
                    <li key={w.id} className="flex w-72 shrink-0 snap-start sm:w-80">
                      <article className={card}>
                        <div className="relative">
                          <Cover w={w} />
                          {isLiveNow(w.webinar_date) ? (
                            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-bold text-primary shadow-card">
                              <LivePulse live />
                              {t.liveNow}
                            </span>
                          ) : (
                            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                              <LivePulse />
                              {t.live}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="text-lg font-bold leading-snug text-foreground">{w.title}</h3>
                          {w.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{w.description}</p>}
                          <p className="mt-3 text-sm font-semibold text-primary">{date(w.webinar_date, time)}</p>
                          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" aria-hidden="true" />
                              {num(w.booked_count ?? 0)} {t.booked}
                            </span>
                            <Link to={to(w.id)} className={link}>{t.view}</Link>
                          </div>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
                </div>
              </>
            )}

            {data.past.length > 0 && (
              <div className={data.up.length ? "mt-16 sm:mt-24" : ""}>
                <div className="flex items-end justify-between gap-4">
                  <h2 id={data.up.length ? undefined : "demo-live-title"} className="text-3xl font-extrabold sm:text-4xl">{t.recTitle}</h2>
                </div>
                <div className="relative">
                  <SideArrows onPrev={() => scrollRow(recTrack, -1)} onNext={() => scrollRow(recTrack, 1)} prevLabel={t.prevRec} nextLabel={t.nextRec} />
                  <ul ref={recTrack} className="mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-1 pb-4 pt-1 motion-reduce:scroll-auto">
                  {data.past.map((w) => (
                    <li key={w.id} className="flex w-72 shrink-0 snap-start sm:w-80">
                      <article className={card}>
                        <Cover w={w} />
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="text-lg font-bold leading-snug text-foreground">{w.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{t.held} {date(w.webinar_date)}</p>
                          <div className="mt-auto pt-4">
                            <Link to={to(w.id)} className={link}>{t.watch}</Link>
                          </div>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
