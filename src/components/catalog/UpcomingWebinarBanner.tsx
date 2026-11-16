import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Youtube, Radio } from "lucide-react";
import LottieAnimation from "@/components/LottieAnimation";
import { useLang, useT } from "@/i18n/lang";
import { Reveal } from "@/pages/course-details/motion";
import { hasYouTube, hrefFor, type Webinar } from "./items";

const T = {
  en: { pill: "Upcoming Webinar", cta: "Save Your Seat", bst: "BST", yt: "Live on YouTube", online: "Live online" },
  bn: { pill: "আসন্ন ওয়েবিনার", cta: "আপনার সিট নিশ্চিত করুন", bst: "বিএসটি", yt: "ইউটিউবে লাইভ", online: "অনলাইনে লাইভ" },
};

export default function UpcomingWebinarBanner({ webinar: w }: { webinar: Webinar }) {
  const t = useT(T);
  const { lang, date } = useLang();
  const time = new Date(w.webinar_date).toLocaleTimeString(lang === "bn" ? "bn-BD" : "en-US", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Dhaka" });
  const yt = hasYouTube(w);
  return (
    <Reveal className="container mx-auto px-4 pb-16">
      <div className="grid items-center gap-8 rounded-3xl bg-brand-surface p-8 md:grid-cols-[1.3fr_1fr] md:p-12">
        <div>
          <span className="mb-4 inline-flex rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary-foreground">{t.pill}</span>
          <h2 className="mb-2 text-2xl font-extrabold tracking-tight md:text-3xl">{w.title}</h2>
          {w.description && <p className="mb-6 line-clamp-1 text-muted-foreground">{w.description}</p>}
          <Link to={hrefFor("webinar", w.id)} className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            {t.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-card text-primary shadow-sm"><CalendarDays className="h-5 w-5" aria-hidden="true" /></span>
              <span><b className="block">{date(w.webinar_date, { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" })}</b><span className="text-muted-foreground">{time} ({t.bst})</span></span>
            </div>
            <div className="flex items-center gap-2 font-semibold">
              {yt ? <Youtube className="h-5 w-5 text-primary" aria-hidden="true" /> : <Radio className="h-5 w-5 text-primary" aria-hidden="true" />}
              {yt ? t.yt : t.online}
            </div>
          </div>
        </div>
        <LottieAnimation src="/animations/learning-journey.json" className="mx-auto hidden aspect-square w-full max-w-xs md:block" />
      </div>
    </Reveal>
  );
}
