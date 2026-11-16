import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLang, useT, type Bi } from "@/i18n/lang";
import { RevealGroup, RevealItem } from "@/pages/course-details/motion";
import { USE_SAMPLE, sampleTestimonials } from "@/content/sampleContent";

const T = {
  en: { eyebrow: "Learner stories", title: "What our learners say", more: "Read more", less: "Show less" },
  bn: { eyebrow: "শিক্ষার্থীদের গল্প", title: "শিক্ষার্থীরা যা বলছেন", more: "আরও পড়ুন", less: "কম দেখুন" },
};

interface Item { name: string; role?: Bi | null; quote: Bi; avatar?: string | null }

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

export default function HomeTestimonials() {
  const t = useT(T);
  const { pick } = useLang();
  const [items, setItems] = useState<Item[] | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(i)) next.delete(i); else next.add(i);
    return next;
  });

  useEffect(() => {
    let alive = true;
    void supabase.from("testimonials").select("client_name,client_role,company,content,testimonial,avatar_url").order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => {
        if (!alive) return;
        const real: Item[] = (data ?? [])
          .map((r) => ({ name: r.client_name, role: [r.client_role, r.company].filter(Boolean).join(" · ") || null, quote: r.testimonial || r.content || "", avatar: r.avatar_url }))
          .filter((r) => r.quote);
        setItems(real.length ? real : USE_SAMPLE ? sampleTestimonials : []);
      }, () => alive && setItems(USE_SAMPLE ? sampleTestimonials : []));
    return () => { alive = false; };
  }, []);

  if (!items?.length) return null;
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24" aria-labelledby="home-testimonials-heading">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm font-bold text-primary">{t.eyebrow}</p>
        <h2 id="home-testimonials-heading" className="mt-3 text-3xl font-extrabold sm:text-5xl">{t.title}</h2>
        <RevealGroup className="mt-10 grid items-start gap-5 md:grid-cols-3">
          {items.map((item, i) => (
            <RevealItem key={i}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition duration-200 hover:-translate-y-1 motion-reduce:transform-none">
                <Quote className="h-6 w-6 text-primary" aria-hidden="true" />
                {(() => {
                  const text = pick(item.quote);
                  // ponytail: length heuristic for "long"; measure overflow if short quotes ever get a needless button
                  const long = text.length > 220;
                  const expanded = open.has(i);
                  return (
                    <>
                      <blockquote id={`testimonial-${i}`} className={`mt-4 flex-1 leading-7 text-muted-foreground ${long && !expanded ? "line-clamp-5" : ""}`}>{text}</blockquote>
                      {long && (
                        <button type="button" onClick={() => toggle(i)} aria-expanded={expanded} aria-controls={`testimonial-${i}`} className="mt-2 self-start rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          {expanded ? t.less : t.more}
                        </button>
                      )}
                    </>
                  );
                })()}
                <figcaption className="mt-6 flex items-center gap-3">
                  {item.avatar
                    ? <img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" />
                    : <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary" aria-hidden="true">{initials(item.name)}</span>}
                  <span>
                    <span className="block text-sm font-bold">{item.name}</span>
                    {item.role && <span className="block text-xs text-muted-foreground">{pick(item.role)}</span>}
                  </span>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
