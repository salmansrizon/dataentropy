import { useCallback, useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang, useT, type Bi } from "@/i18n/lang";
import { Reveal } from "@/pages/course-details/motion";
import { USE_SAMPLE, sampleTestimonials } from "@/content/sampleContent";

const GAP = 20; // gap-5 between cards

const T = {
  en: { eyebrow: "Learner experiences", title: "Their stories, our inspiration", more: "Read more", less: "Show less", rating: (n: number) => `${n} out of 5`, goTo: (n: number) => `Go to page ${n}` },
  bn: { eyebrow: "শিক্ষার্থীদের অভিজ্ঞতা", title: "তাদের গল্প, আমাদের অনুপ্রেরণা", more: "আরও পড়ুন", less: "কম দেখুন", rating: (n: number) => `৫ এর মধ্যে ${n}`, goTo: (n: number) => `${n} নম্বর পেজে যান` },
};

interface Item { name: string; role?: Bi | null; quote: Bi; avatar?: string | null; rating?: number | null }

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

export default function LandingTestimonials() {
  const t = useT(T);
  const { pick } = useLang();
  const [items, setItems] = useState<Item[] | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(0);
  const track = useRef<HTMLUListElement>(null);
  const toggle = (i: number) => setOpen((p) => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n; });

  useEffect(() => {
    let alive = true;
    void supabase.from("testimonials").select("client_name,client_role,company,content,testimonial,avatar_url,rating").order("created_at", { ascending: false }).limit(9)
      .then(({ data }) => {
        if (!alive) return;
        const real: Item[] = (data ?? [])
          .map((r) => ({ name: r.client_name, role: [r.client_role, r.company].filter(Boolean).join(" · ") || null, quote: r.testimonial || r.content || "", avatar: r.avatar_url, rating: r.rating }))
          .filter((r) => r.quote);
        setItems(real.length ? real : USE_SAMPLE ? sampleTestimonials : []);
      }, () => alive && setItems(USE_SAMPLE ? sampleTestimonials : []));
    return () => { alive = false; };
  }, []);

  // One dot per *page* (viewport-width of cards), so every dot is reachable: 3 cards/page on desktop, 1 on mobile.
  const [pages, setPages] = useState(1);
  const onScroll = useCallback(() => {
    const el = track.current;
    if (!el || !el.clientWidth) return;
    const span = el.clientWidth + GAP;
    const count = Math.max(1, Math.ceil((el.scrollWidth + GAP - 4) / span));
    setPages(count);
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setPage(atEnd ? count - 1 : Math.round(el.scrollLeft / span));
  }, []);
  useEffect(() => {
    onScroll();
    window.addEventListener("resize", onScroll);
    return () => window.removeEventListener("resize", onScroll);
  }, [onScroll, items]);
  const goTo = (i: number) => {
    const el = track.current;
    if (el) el.scrollTo({ left: i * (el.clientWidth + GAP), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  if (!items?.length) return null;
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="landing-testimonials-heading">
      <div className="mx-auto max-w-7xl text-center">
        <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{t.eyebrow}</p>
        <h2 id="landing-testimonials-heading" className="mt-4 text-3xl font-extrabold sm:text-4xl">{t.title}</h2>
        <Reveal>
          <ul ref={track} onScroll={onScroll} className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 text-left [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item, i) => {
              const text = pick(item.quote);
              const long = text.length > 160;
              const expanded = open.has(i);
              const stars = item.rating ?? null; // never invent a rating
              return (
                <li key={i} className="w-full shrink-0 snap-start md:w-[calc((100%-2.5rem)/3)]">
                  <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card">
                    {item.avatar
                      ? <img src={item.avatar} alt="" className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                      : <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary" aria-hidden="true">{initials(item.name)}</span>}
                    <blockquote id={`landing-testimonial-${i}`} className={`mt-4 flex-1 leading-7 text-muted-foreground ${long && !expanded ? "line-clamp-4" : ""}`}>“{text}”</blockquote>
                    {long && (
                      <button type="button" onClick={() => toggle(i)} aria-expanded={expanded} aria-controls={`landing-testimonial-${i}`} className="mt-2 self-start rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {expanded ? t.less : t.more}
                      </button>
                    )}
                    <figcaption className="mt-5">
                      <span className="block font-bold">{item.name}</span>
                      {stars != null && (
                        <span className="mt-1 flex" role="img" aria-label={t.rating(stars)}>
                          {[0, 1, 2, 3, 4].map((s) => <Star key={s} aria-hidden="true" className={`h-4 w-4 ${s < stars ? "fill-primary text-primary" : "text-muted-foreground/40"}`} />)}
                        </span>
                      )}
                      {item.role && <span className="mt-1 block text-xs text-muted-foreground">{pick(item.role)}</span>}
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </ul>
        </Reveal>
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} type="button" aria-label={t.goTo(i + 1)} aria-current={page === i || undefined} onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${page === i ? "w-6 bg-primary" : "w-2 bg-primary/25"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
