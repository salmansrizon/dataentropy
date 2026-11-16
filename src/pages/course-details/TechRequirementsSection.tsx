import { CheckCircle2 } from "lucide-react";
import { useT } from "@/i18n/lang";
import SectionShell from "./SectionShell";
import { RevealGroup, RevealItem } from "./motion";

const T = {
  en: { eyebrow: "Tools & prerequisites", title: "What you'll use", requirements: "Requirements" },
  bn: { eyebrow: "টুলস ও পূর্বশর্ত", title: "যা যা ব্যবহার করবেন", requirements: "প্রয়োজনীয়তা" },
};

interface TechRequirementsSectionProps {
  technologies: string[];
  requirements?: string[];
}

const TechRequirementsSection = ({ technologies, requirements = [] }: TechRequirementsSectionProps) => {
  const t = useT(T);
  if (!technologies.length && !requirements.length) return null;
  return (
    <SectionShell id="tools" eyebrow={t.eyebrow} title={t.title}>
      {technologies.length > 0 && (
        <RevealGroup className="flex flex-wrap gap-2">
          {technologies.map((tech, i) => (
            <RevealItem key={i}><span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1.5 text-sm font-semibold text-foreground">
              {tech}
            </span></RevealItem>
          ))}
        </RevealGroup>
      )}
      {requirements.length > 0 && (
        <div className={technologies.length ? "mt-8" : ""}>
          <h3 className="mb-4 text-lg font-semibold text-foreground">{t.requirements}</h3>
          <ul className="space-y-3">
            {requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionShell>
  );
};

export default TechRequirementsSection;
