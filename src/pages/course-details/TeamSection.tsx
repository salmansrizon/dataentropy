import { BadgeCheck } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { RevealGroup, RevealItem } from "./motion";

const T = {
  en: { eyebrow: "Support team", title: "Teaching assistants", verified: "Verified" },
  bn: { eyebrow: "সাপোর্ট টিম", title: "টিচিং অ্যাসিস্ট্যান্ট", verified: "যাচাইকৃত" },
};

const TeamSection = ({ tas }: { tas?: SalesPage["teaching_assistants"] }) => {
  const t = useT(T);
  const { pick } = useLang();
  if (!tas?.length) return null;
  return (
    <SectionShell id="team" eyebrow={t.eyebrow} title={t.title}>
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tas.map((ta, i) => (
          <RevealItem key={`${ta.name}-${i}`}>
            <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-card transition duration-200 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                {ta.avatar_url ? (
                  <img src={ta.avatar_url} alt={ta.name} loading="lazy" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/10 font-bold text-brand-blue">
                    {ta.name.trim().slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="flex items-center gap-1 font-semibold text-foreground">
                    {ta.name}
                    <BadgeCheck className="h-4 w-4 shrink-0 text-brand-blue" aria-label={t.verified} />
                  </h3>
                  {ta.role && <p className="text-sm text-muted-foreground">{pick(ta.role)}</p>}
                </div>
              </div>
              {ta.bio && <p className="mt-4 text-sm text-muted-foreground">{pick(ta.bio)}</p>}
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
};

export default TeamSection;
