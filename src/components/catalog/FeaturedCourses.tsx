import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import LottieAnimation from "@/components/LottieAnimation";
import { useLang, useT } from "@/i18n/lang";
import { RevealGroup, RevealItem } from "@/pages/course-details/motion";
import { hrefFor, isFreeCourse, isRecorded, type Course } from "./items";
import "./catalog.css";

const T = {
  en: { popular: "Popular", self: "Self-paced", view: "View Course Details", hours: "hours", free: "Free", selfDur: "Learn at your own pace" },
  bn: { popular: "জনপ্রিয়", self: "নিজের গতিতে", view: "কোর্সের বিস্তারিত দেখুন", hours: "ঘণ্টা", free: "ফ্রি", selfDur: "নিজের গতিতে শিখুন" },
};

const BARS = [40, 65, 50, 85, 100];

function Card({ c, badge, art }: { c: Course; badge?: string; art: "lottie" | "bars" }) {
  const t = useT(T);
  const { num } = useLang();
  const free = isFreeCourse(c);
  const price = c.discounted_price && c.discounted_price < c.price ? c.discounted_price : c.price;
  return (
    <article className="grid h-full gap-6 rounded-3xl border border-border bg-card p-7 shadow-card sm:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col">
        {badge && <span className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{badge}</span>}
        <h3 className="mb-2 line-clamp-2 text-xl font-extrabold leading-snug [overflow-wrap:anywhere]">{c.title}</h3>
        <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{c.short_description || c.description}</p>
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {c.duration_hours ? `${num(c.duration_hours)} ${t.hours}` : t.selfDur}
        </div>
        <div className="mb-5 flex items-baseline gap-2">
          {free ? <b className="text-lg">{t.free}</b> : (
            <>
              {price < c.price && <s className="text-sm text-muted-foreground">৳{num(c.price)}</s>}
              <b className="text-xl text-primary">৳{num(price)}</b>
            </>
          )}
        </div>
        <Link to={hrefFor("course", c.id)} className="mt-auto inline-flex h-11 w-fit items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          {t.view} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="flex items-end justify-center rounded-2xl bg-brand-surface p-4" aria-hidden="true">
        {art === "lottie" ? (
          <LottieAnimation src="/animations/learning-path-stages.json" className="aspect-square w-full max-w-[14rem]" />
        ) : (
          <div className="flex h-40 w-full items-end gap-2">
            {BARS.map((h, i) => <span key={i} className="catalog-bar flex-1 rounded-t-lg bg-brand-gradient" style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }} />)}
          </div>
        )}
      </div>
    </article>
  );
}

export default function FeaturedCourses({ left, right }: { left: Course; right?: Course }) {
  const t = useT(T);
  return (
    <section className="container mx-auto px-4 pb-20">
      <RevealGroup className="grid gap-6 lg:grid-cols-2">
          <RevealItem className="h-full"><Card c={left} badge={(left.student_count || 0) > 0 ? t.popular : undefined} art="lottie" /></RevealItem>
          {right && <RevealItem className="h-full"><Card c={right} badge={isRecorded(right) ? t.self : undefined} art="bars" /></RevealItem>}
        </RevealGroup>
    </section>
  );
}
