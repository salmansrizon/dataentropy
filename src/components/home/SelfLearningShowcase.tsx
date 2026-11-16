import { Link } from "react-router-dom";
import { ArrowRight, Award, BookOpen, Code2, LineChart, Map } from "lucide-react";
import WorkflowAnimation from "./WorkflowAnimation";
import { useLang, useT } from "@/i18n/lang";
import { CountUp, RevealGroup, RevealItem } from "@/pages/course-details/motion";

const T = {
  en: {
    eyebrow: "Learn at your own pace",
    title: "Self-paced tools, free to explore",
    sub: "No cohort to wait for. Practice, plan your path and track progress whenever you have time.",
    tools: "tools",
    toolsLabel: "self-paced tools in one place",
    items: [
      { title: "Career Prep topics", desc: "Browse a library of interview and skill topics and study at your own speed.", cta: "Open library" },
      { title: "SQL & Python practice", desc: "Write real queries and code, and get instant feedback on every attempt.", cta: "Start practicing" },
      { title: "Career roadmaps", desc: "Follow a clear step-by-step path toward the data role you want.", cta: "See roadmaps" },
      { title: "Assessments & certificates", desc: "Test yourself and earn certificates anyone can verify at /verify.", cta: "Take an assessment" },
      { title: "Progress in My Learning", desc: "See what you finished and pick up exactly where you left off.", cta: "Open My Learning" },
    ],
  },
  bn: {
    eyebrow: "নিজের গতিতে শিখুন",
    title: "নিজের গতিতে শেখার টুল, ফ্রিতে দেখুন",
    sub: "ব্যাচের অপেক্ষা নেই। সময় পেলেই প্র্যাকটিস করুন, পথ ঠিক করুন, অগ্রগতি দেখুন।",
    tools: "টুল",
    toolsLabel: "নিজের গতিতে শেখার টুল এক জায়গায়",
    items: [
      { title: "ক্যারিয়ার প্রেপ টপিক", desc: "ইন্টারভিউ ও স্কিলের টপিক লাইব্রেরি থেকে নিজের গতিতে পড়ুন।", cta: "লাইব্রেরি খুলুন" },
      { title: "SQL ও Python প্র্যাকটিস", desc: "সত্যিকারের কোয়েরি ও কোড লিখুন, প্রতিটি চেষ্টায় সঙ্গে সঙ্গে ফিডব্যাক পান।", cta: "প্র্যাকটিস শুরু করুন" },
      { title: "ক্যারিয়ার রোডম্যাপ", desc: "পছন্দের ডেটা ক্যারিয়ারের জন্য ধাপে ধাপে স্পষ্ট পথ অনুসরণ করুন।", cta: "রোডম্যাপ দেখুন" },
      { title: "অ্যাসেসমেন্ট ও সার্টিফিকেট", desc: "নিজেকে যাচাই করুন এবং /verify এ যাচাইযোগ্য সার্টিফিকেট অর্জন করুন।", cta: "অ্যাসেসমেন্ট দিন" },
      { title: "মাই লার্নিংয়ে অগ্রগতি", desc: "কতটা শেষ করেছেন দেখুন এবং যেখানে থেমেছিলেন সেখান থেকে শুরু করুন।", cta: "মাই লার্নিং খুলুন" },
    ],
  },
};

const META = [
  { to: "/career-prep/library", Icon: BookOpen },
  { to: "/career-prep", Icon: Code2 },
  { to: "/roadmaps", Icon: Map },
  { to: "/career-prep", Icon: Award },
  { to: "/my-learning", Icon: LineChart },
];

export default function SelfLearningShowcase() {
  const t = useT(T);
  const { num } = useLang();
  return (
    <section aria-labelledby="self-learning-title" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{t.eyebrow}</p>
        <h2 id="self-learning-title" className="mt-4 text-3xl font-extrabold sm:text-4xl">{t.title}</h2>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{t.sub}</p>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-2">
          <div>
            <div aria-hidden="true" className="rounded-3xl border border-brand-border bg-brand-surface bg-brand-grid p-6">
              <WorkflowAnimation />
            </div>
            <p className="mt-4 flex items-baseline justify-center gap-3 text-muted-foreground">
              <CountUp value={t.items.length} format={num} className="text-4xl font-extrabold text-primary" />
              <span className="text-sm font-semibold">{t.toolsLabel}</span>
            </p>
          </div>

          <RevealGroup className="grid gap-4">
            {t.items.map((it, i) => {
              const { to, Icon } = META[i];
              return (
                <RevealItem key={it.title}>
                  <Link
                    to={to}
                    className="group flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition duration-200 hover:-translate-y-1 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="block">
                      <h3 className="text-base font-bold text-foreground">{it.title}</h3>
                      <span className="mt-1 block text-sm text-muted-foreground">{it.desc}</span>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        {it.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:transform-none" aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
