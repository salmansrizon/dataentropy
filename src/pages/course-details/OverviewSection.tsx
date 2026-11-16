import { CheckCircle2, UserCheck } from "lucide-react";
import { useT } from "@/i18n/lang";
import SectionShell from "./SectionShell";
import { RevealGroup, RevealItem } from "./motion";
import { SECTION_IDS, type Course } from "./types";

const card = "rounded-2xl border border-border bg-card p-6 shadow-card";

const T = {
  en: { eyebrow: "Overview", title: "About this course", learn: "What you'll learn", audience: "Who this course is for", master: (x: string) => `Master ${x} concepts and build projects.` },
  bn: { eyebrow: "ওভারভিউ", title: "এই কোর্স সম্পর্কে", learn: "আপনি যা শিখবেন", audience: "এই কোর্স কাদের জন্য", master: (x: string) => `${x}-এর ধারণাগুলো আয়ত্ত করুন এবং প্রজেক্ট তৈরি করুন।` },
};

const OverviewSection = ({ course }: { course: Course }) => {
  const t = useT(T);
  const learn: { title?: string; description: string }[] = course.what_you_will_learn?.length
    ? course.what_you_will_learn
    : course.learning_outcomes?.length
      ? course.learning_outcomes.map((description) => ({ description }))
      : (course.technologies ?? []).map((tech) => ({ description: t.master(tech) }));

  return (
    <SectionShell id={SECTION_IDS.overview} eyebrow={t.eyebrow} title={t.title}>
      <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{course.description}</p>

      {learn.length > 0 && (
        <div className={`${card} mt-8 transition duration-200 hover:-translate-y-1`}>
          <h3 className="mb-4 text-lg font-semibold text-foreground">{t.learn}</h3>
          <RevealGroup className="grid gap-4 sm:grid-cols-2">
            {learn.map((item, i) => (
              <RevealItem key={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {item.title && <strong className="block font-bold text-foreground">{item.title}</strong>}
                  {item.description}
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      )}

      {!!course.target_audience?.length && (
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold text-foreground">{t.audience}</h3>
          <ul className="space-y-3">
            {course.target_audience.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-blue" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionShell>
  );
};

export default OverviewSection;
