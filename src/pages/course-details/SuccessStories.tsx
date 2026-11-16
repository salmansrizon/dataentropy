import { Quote } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { RevealGroup, RevealItem } from "./motion";

const T = { en: { eyebrow: "Success stories", title: "Learners who made the leap", at: "at" }, bn: { eyebrow: "সফলতার গল্প", title: "যারা সফল হয়েছেন", at: "—" } };

const SuccessStories = ({ stories }: { stories?: SalesPage["success_stories"] }) => {
  const t = useT(T);
  const { pick } = useLang();
  if (!stories?.length) return null;
  return (
    <SectionShell id="stories" eyebrow={t.eyebrow} title={t.title}>
      <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stories.map((s, i) => {
          const role = [s.role ? pick(s.role) : "", s.company ?? ""].filter(Boolean).join(` ${t.at} `);
          return (
            <RevealItem key={`${s.name}-${i}`}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition duration-200 hover:-translate-y-1">
                <Quote aria-hidden className="mb-3 h-6 w-6 text-brand-blue" />
                <blockquote className="flex-1 text-sm text-foreground">{pick(s.quote)}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  {s.avatar_url ? (
                    <img src={s.avatar_url} alt={s.name} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-sm font-bold text-brand-blue">
                      {s.name.trim().slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">{s.name}</span>
                    {role && <span className="block text-xs text-muted-foreground">{role}</span>}
                  </span>
                </figcaption>
              </figure>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </SectionShell>
  );
};

export default SuccessStories;
