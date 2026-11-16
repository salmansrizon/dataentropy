import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang, useT } from "@/i18n/lang";
import { CountUp, Reveal } from "@/pages/course-details/motion";
import { USE_SAMPLE, samplePartners, sampleStats } from "@/content/sampleContent";

const T = {
  en: { title: "Trusted by learners and teams", partners: "Our learners work at" },
  bn: { title: "শিক্ষার্থী ও টিমের আস্থা", partners: "আমাদের শিক্ষার্থীরা কাজ করছেন" },
};

type Logo = { id: string; name: string; logo_url: string };

export default function PartnerStrip() {
  const t = useT(T);
  const { num, pick } = useLang();
  const [logos, setLogos] = useState<Logo[] | null>(null);

  useEffect(() => {
    let live = true;
    supabase
      .from("brand_logos")
      .select("id,name,logo_url")
      .eq("is_visible", true)
      .order("order_index", { ascending: true })
      .then(({ data }) => live && setLogos(data ?? []));
    return () => {
      live = false;
    };
  }, []);

  const stats = USE_SAMPLE ? sampleStats : [];
  const chips = logos?.length ? [] : USE_SAMPLE ? samplePartners : [];
  if (logos === null || (!stats.length && !logos.length && !chips.length)) return null;

  return (
    <section aria-labelledby="partner-strip-title" className="px-4 py-12 sm:px-6 sm:py-16">
      <Reveal className="mx-auto max-w-7xl rounded-2xl border border-border bg-card p-6 shadow-card sm:p-10">
        <h2 id="partner-strip-title" className="text-center text-xl font-extrabold sm:text-2xl">{t.title}</h2>
        {stats.length > 0 && (
          <dl className="mt-8 grid gap-6 sm:grid-cols-3">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col-reverse text-center">
                <dt className="mt-1 text-sm font-semibold text-muted-foreground">{pick(s.label)}</dt>
                <dd className="text-4xl font-black text-primary">
                  <CountUp value={s.value} format={num} />
                  {s.suffix}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {(logos.length > 0 || chips.length > 0) && (
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-center text-sm font-semibold text-muted-foreground">{t.partners}</p>
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-4">
              {logos.map((l) => (
                <li key={l.id}>
                  <img src={l.logo_url} alt={l.name} loading="lazy" decoding="async" className="h-10 w-auto object-contain" />
                </li>
              ))}
              {chips.map((c) => (
                <li key={c} className="rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-semibold text-foreground">{c}</li>
              ))}
            </ul>
          </div>
        )}
      </Reveal>
    </section>
  );
}
