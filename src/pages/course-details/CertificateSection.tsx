import { Award } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { Reveal } from "./motion";
import { SECTION_IDS } from "./types";

const T = {
  en: { eyebrow: "Certificate", title: "Certificate of completion", alt: "Sample course certificate" },
  bn: { eyebrow: "সার্টিফিকেট", title: "কোর্স সম্পন্নের সার্টিফিকেট", alt: "কোর্স সার্টিফিকেটের নমুনা" },
};

const CertificateSection = ({ certificate }: { certificate?: SalesPage["certificate"] }) => {
  const t = useT(T);
  const { pick } = useLang();
  if (!certificate || (!certificate.image_url && !certificate.points.length)) return null;
  return (
    <SectionShell id={SECTION_IDS.certificate} eyebrow={t.eyebrow} title={t.title}>
      <Reveal>
        <div className="grid items-center gap-8 md:grid-cols-2">
          {certificate.image_url && (
            <img
              src={certificate.image_url}
              alt={t.alt}
              loading="lazy"
              className="w-full rounded-2xl border border-border shadow-brand transition duration-300 hover:rotate-1"
            />
          )}
          <ul className="space-y-4">
            {certificate.points.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <Award className="h-4 w-4" />
                </span>
                <span className="pt-1.5 text-foreground">{pick(p)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </SectionShell>
  );
};

export default CertificateSection;
