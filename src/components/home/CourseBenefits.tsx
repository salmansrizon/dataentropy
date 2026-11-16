import { Link } from "react-router-dom";
import { Award, BarChart3, FlaskConical, MessagesSquare, Video, Zap } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import { CountUp, Reveal, RevealGroup, RevealItem } from "@/pages/course-details/motion";
import { USE_SAMPLE, sampleStats } from "@/content/sampleContent";

const T = {
  en: {
    eyebrow: "Why learn with us",
    title: "What you get in our courses",
    mentor: "Book a mentor session",
    items: [
      { title: "Live and recorded lessons", body: "Join live classes, or catch up anytime with recordings." },
      { title: "Hands-on projects", body: "Build portfolio-ready projects on realistic data." },
      { title: "Practice with instant feedback", body: "Run your code and see right away what to fix." },
      { title: "Progress tracking", body: "See what you finished and what to do next." },
      { title: "Verifiable certificates", body: "Share a certificate anyone can verify online." },
      { title: "Mentor sessions", body: "Get one-on-one guidance on your path." },
    ],
  },
  bn: {
    eyebrow: "কেন আমাদের সাথে শিখবেন",
    title: "আমাদের কোর্সে আপনি যা পাবেন",
    mentor: "মেন্টর সেশন বুক করুন",
    items: [
      { title: "লাইভ ও রেকর্ডেড লেসন", body: "লাইভ ক্লাসে যোগ দিন, কিংবা রেকর্ডিং দেখে যেকোনো সময় এগিয়ে যান।" },
      { title: "হাতে-কলমে প্রজেক্ট", body: "বাস্তবসম্মত ডেটায় পোর্টফোলিওর উপযোগী প্রজেক্ট বানান।" },
      { title: "তাৎক্ষণিক ফিডব্যাকসহ প্র্যাকটিস", body: "কোড চালান, আর সঙ্গে সঙ্গে দেখুন কী ঠিক করতে হবে।" },
      { title: "প্রগ্রেস ট্র্যাকিং", body: "কতটা শেষ করেছেন আর পরে কী করবেন, সবই দেখুন।" },
      { title: "যাচাইযোগ্য সার্টিফিকেট", body: "যে কেউ অনলাইনে যাচাই করতে পারে এমন সার্টিফিকেট শেয়ার করুন।" },
      { title: "মেন্টর সেশন", body: "আপনার ক্যারিয়ার পথে এক-এক গাইডলাইন নিন।" },
    ],
  },
};

const icons = [Video, FlaskConical, Zap, BarChart3, Award, MessagesSquare];

export default function CourseBenefits() {
  const t = useT(T);
  const { num, pick } = useLang();
  // Stats live in PartnerStrip only; showing them twice on one page was noise.
  const stats: typeof sampleStats = [];

  return (
    <section aria-labelledby="course-benefits-title" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{t.eyebrow}</p>
        <h2 id="course-benefits-title" className="mt-4 text-3xl font-extrabold sm:text-4xl">{t.title}</h2>

        <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((it, i) => {
            const Icon = icons[i];
            return (
              <RevealItem key={it.title} className="h-full">
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-card transition duration-200 hover:-translate-y-1 motion-reduce:transform-none">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-foreground">{it.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
                  {i === 5 && (
                    <Link to="/book-session" className="mt-3 inline-block rounded text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {t.mentor}
                    </Link>
                  )}
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {stats.length > 0 && (
          <Reveal className="mt-10">
            <dl className="grid gap-6 rounded-2xl border border-border bg-secondary p-6 sm:grid-cols-3">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col-reverse text-center">
                  <dt className="mt-1 text-sm font-semibold text-muted-foreground">{pick(s.label)}</dt>
                  <dd className="text-3xl font-black text-primary">
                    <CountUp value={s.value} format={num} />
                    {s.suffix}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  );
}
