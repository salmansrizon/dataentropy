import { Link } from "react-router-dom";
import { Layout } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import SectionShell from "./SectionShell";
import { RevealGroup, RevealItem } from "./motion";
import type { Course } from "./types";

const T = {
  en: { eyebrow: "Keep going", title: "You may also like", free: "FREE", explore: "Explore →" },
  bn: { eyebrow: "এগিয়ে চলুন", title: "আরও যা ভালো লাগতে পারে", free: "বিনামূল্যে", explore: "দেখুন →" },
};

export default function RelatedCourses({ courses }: { courses: Course[] }) {
  const t = useT(T);
  const { num } = useLang();
  if (courses.length === 0) return null;
  return (
    <SectionShell id="related" eyebrow={t.eyebrow} title={t.title}>
      <RevealGroup className="grid gap-5 sm:grid-cols-3">
        {courses.map((rc) => (
          <RevealItem key={rc.id}><div className="group h-full overflow-hidden rounded-2xl border border-border bg-card shadow-card transition duration-200 hover:-translate-y-1">
            <Link to={`/course/${rc.id}`} className="block aspect-video overflow-hidden bg-muted">
              {rc.banner_image ? <img src={rc.banner_image} alt={rc.title} className="h-full w-full object-cover" loading="lazy" decoding="async" /> : <div className="flex h-full w-full items-center justify-center bg-secondary"><Layout className="h-6 w-6 text-muted-foreground" /></div>}
            </Link>
            <div className="space-y-3 p-4">
              <Link to={`/course/${rc.id}`} className="line-clamp-2 block text-sm font-bold leading-snug text-foreground hover:text-brand-blue">{rc.title}</Link>
              <div className="flex items-center justify-between gap-2">
                {rc.discounted_price ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-foreground">৳{num(Number(rc.discounted_price))}</span>
                    <span className="text-xs text-muted-foreground line-through">৳{num(Number(rc.price))}</span>
                  </div>
                ) : (
                  <span className="text-sm font-black text-foreground">{rc.is_free ? t.free : `৳${num(Number(rc.price))}`}</span>
                )}
                <Link to={`/course/${rc.id}`} className="text-sm font-semibold text-brand-blue hover:underline">{t.explore}</Link>
              </div>
            </div>
          </div></RevealItem>
        ))}
      </RevealGroup>
    </SectionShell>
  );
}
