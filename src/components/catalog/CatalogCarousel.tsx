import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BarChart3, CalendarDays, GraduationCap, ShoppingBag, TrendingUp, Video } from "lucide-react";
import SideArrows from "@/components/home/SideArrows";
import { LivePulse } from "@/components/LivePulse";
import { isLiveNow } from "@/lib/liveWindow";
import { cn } from "@/lib/utils";
import { useLang, useT } from "@/i18n/lang";
import { Reveal } from "@/pages/course-details/motion";
import { hrefFor, type Item } from "./items";

const T = {
  en: { eyebrow: "Our Courses", title: "All Courses", all: "All Courses", short: "Short Courses", recorded: "Recorded", free: "Free Courses", webinar: "Webinar", filters: "Filter courses", prev: "Previous", next: "Next", empty: "No courses match your search or filter.", clear: "Clear filters", cWebinar: "WEBINAR", cCourse: "COURSE", live: "LIVE", soon: "UPCOMING", freeP: "Free", register: "Register Now", enroll: "Enroll Now", tba: "Self-paced", error: "Could not load courses. Please check your connection and try again.", retry: "Retry" },
  bn: { eyebrow: "আমাদের কোর্স", title: "সব কোর্স", all: "সব কোর্স", short: "শর্ট কোর্স", recorded: "রেকর্ডেড", free: "ফ্রি কোর্স", webinar: "ওয়েবিনার", filters: "কোর্স ফিল্টার", prev: "আগের", next: "পরের", empty: "আপনার সার্চ বা ফিল্টারের সাথে কোনো কোর্স মেলেনি।", clear: "ফিল্টার মুছুন", cWebinar: "ওয়েবিনার", cCourse: "কোর্স", live: "লাইভ", soon: "আসছে", freeP: "ফ্রি", register: "রেজিস্টার করুন", enroll: "এনরোল করুন", tba: "নিজের গতিতে", error: "কোর্স লোড করা যায়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন।", retry: "আবার চেষ্টা করুন" },
};

export interface Tab { id: string; label: string }

const COVERS = [
  { bg: "from-primary to-primary/60", Icon: BarChart3 },
  { bg: "from-brand-indigo to-brand-indigo/60", Icon: ShoppingBag },
  { bg: "from-brand-blue to-brand-blue/60", Icon: TrendingUp },
  { bg: "from-brand-purple to-brand-purple/60", Icon: GraduationCap },
  { bg: "from-brand-purple to-brand-purple/60", Icon: Video },
];

function Card({ item, i }: { item: Item; i: number }) {
  const t = useT(T);
  const { num, date } = useLang();
  const reduce = useReducedMotion();
  const web = item.kind === "webinar";
  const cover = web ? COVERS[4] : COVERS[i % 4];
  const live = web && isLiveNow(item.date);
  const upcoming = web && new Date(item.date).getTime() > Date.now();
  return (
    <motion.article whileHover={reduce ? undefined : { y: -6 }} transition={{ duration: 0.2 }} className="flex h-full w-72 shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card sm:w-80">
      <div className={cn("relative grid h-40 shrink-0 place-items-center overflow-hidden bg-gradient-to-br text-primary-foreground", cover.bg)}>
        {item.img ? <img src={item.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : <cover.Icon className="h-16 w-16 opacity-90" aria-hidden="true" />}
        <span className="absolute right-3 top-3 rounded-full bg-card px-3 py-1 text-[11px] font-bold tracking-wider text-primary">{web ? t.cWebinar : t.cCourse}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 min-h-[3.25rem] text-lg font-bold leading-snug [overflow-wrap:anywhere]">{item.title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
          {item.date ? date(item.date, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" }) : t.tba}
        </div>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {web && (live || upcoming) ? (
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", live ? "bg-primary/10 text-primary" : "bg-primary/15 text-primary")}>
              <LivePulse live={live} />{live ? t.live : t.soon}
            </span>
          ) : <span />}
          <span className="flex items-baseline gap-2">
            {/* cut price: original shown struck through when a course is discounted */}
            {!item.free && item.kind === "course" && item.c.discounted_price && item.c.price > item.c.discounted_price && (
              <span className="text-sm text-muted-foreground line-through">৳{num(item.c.price)}</span>
            )}
            <span className="font-bold text-foreground">{item.free ? t.freeP : `৳${num(item.price)}`}</span>
          </span>
        </div>
        <Link to={hrefFor(item.kind, item.id)} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          {web ? t.register : t.enroll} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}

export default function CatalogCarousel({ tabs, active, onTab, items, onClear, error, onRetry }: { tabs: Tab[]; active: string; onTab: (id: string) => void; items: Item[]; onClear: () => void; error?: boolean; onRetry?: () => void }) {
  const t = useT(T);
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollTo({ left: 0 }); }, [items]);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 340, behavior: reduce ? "auto" : "smooth" });
  return (
    <section id="all-courses" className="container mx-auto scroll-mt-24 px-4 py-16">
      <Reveal className="mb-8 text-center">
        <span className="mb-3 inline-flex rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">{t.eyebrow}</span>
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{t.title}</h2>
      </Reveal>
      <div role="group" aria-label={t.filters} className="mb-8 flex gap-2 overflow-x-auto px-1 pb-2 no-scrollbar sm:flex-wrap sm:justify-center">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" aria-pressed={active === tab.id} onClick={() => onTab(tab.id)}
            className={cn("relative whitespace-nowrap rounded-full border px-5 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active === tab.id ? "border-transparent text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-primary")}>
            {active === tab.id && <motion.span layoutId="catalog-tab" transition={{ duration: reduce ? 0 : 0.25 }} className="absolute inset-0 rounded-full bg-primary" />}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>
      {error ? (
        <div role="alert" className="rounded-3xl border-2 border-dashed border-border bg-card py-16 text-center">
          <p className="mb-4 text-muted-foreground">{t.error}</p>
          <button type="button" onClick={onRetry} className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t.retry}</button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-card py-16 text-center">
          <p className="mb-4 text-muted-foreground">{t.empty}</p>
          <button type="button" onClick={onClear} className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{t.clear}</button>
        </div>
      ) : (
        <div className="relative">
          <SideArrows onPrev={() => scroll(-1)} onNext={() => scroll(1)} prevLabel={t.prev} nextLabel={t.next} />
          <div ref={ref} className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-6 pt-2 no-scrollbar">
            {items.map((it, i) => <Card key={`${it.kind}-${it.id}`} item={it} i={i} />)}
          </div>
        </div>
      )}
    </section>
  );
}
