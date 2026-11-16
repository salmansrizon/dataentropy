import { Info, Linkedin, UserCircle } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import SectionShell from "./SectionShell";
import { SECTION_IDS, type Instructor } from "./types";

interface InstructorSectionProps {
  instructor: Instructor | null;
  updatedAt?: string;
}

const T = {
  en: { eyebrow: "Instructor", title: "Learn from", tba: "To be announced", profile: "VIEW PROFILE", updated: "Updated" },
  bn: { eyebrow: "প্রশিক্ষক", title: "যাঁর কাছে শিখবেন", tba: "শীঘ্রই জানানো হবে", profile: "প্রোফাইল দেখুন", updated: "হালনাগাদ" },
};

const InstructorSection = ({ instructor, updatedAt }: InstructorSectionProps) => {
  const t = useT(T);
  const { date } = useLang();
  return (
  <SectionShell id={SECTION_IDS.instructor} eyebrow={t.eyebrow} title={t.title}>
    <div className="flex flex-col gap-5 rounded-2xl transition duration-200 hover:-translate-y-1 border border-border bg-card p-6 shadow-card sm:flex-row sm:items-start">
      {instructor?.avatar_url ? (
        <img src={instructor.avatar_url} alt={instructor.name} className="h-20 w-20 shrink-0 rounded-full object-cover" />
      ) : (
        <UserCircle className="h-20 w-20 shrink-0 text-muted-foreground" />
      )}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-foreground">{instructor?.name || t.tba}</h3>
        {instructor?.specialization && (
          <p className="text-sm font-medium text-muted-foreground">{instructor.specialization}</p>
        )}
        {instructor?.bio && <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{instructor.bio}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {instructor?.linkedin_url && /^https?:\/\//i.test(instructor.linkedin_url) && (
            <a
              href={instructor.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-linkedin/20 bg-brand-linkedin/10 px-3 py-1 text-sm font-medium text-brand-linkedin transition-colors hover:bg-brand-linkedin hover:text-brand-linkedin-foreground"
            >
              <Linkedin className="h-4 w-4" />
              <span>{t.profile}</span>
            </a>
          )}
          {updatedAt && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted-foreground">
              <Info className="h-3 w-3" />
              {t.updated} {date(updatedAt, { month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  </SectionShell>
  );
};

export default InstructorSection;
