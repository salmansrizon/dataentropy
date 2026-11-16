import { useState } from "react";
import { LivePulse } from "@/components/LivePulse";
import { isLiveNow } from "@/lib/liveWindow";
import { CalendarDays, Play, User } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { Reveal, RevealGroup, RevealItem } from "./motion";
import { SECTION_IDS } from "./types";
import { useCountdown } from "./useCountdown";

const T = {
  en: { eyebrow: "Try before you join", title: "Free demo classes", play: "Play video", liveDemo: "Live demo", by: "by", book: "Book free seat", startsIn: "Starts in", d: "d", h: "h", m: "m", s: "s" },
  bn: { eyebrow: "জয়েন করার আগে দেখুন", title: "ফ্রি ডেমো ক্লাস", play: "ভিডিও চালান", liveDemo: "লাইভ ডেমো", by: "প্রশিক্ষক", book: "ফ্রি সিট বুক করুন", startsIn: "শুরু হতে বাকি", d: "দিন", h: "ঘ", m: "মি", s: "সে" },
};

const ytId = (url: string) => url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];

function VideoCard({ id, title, instructor, play }: { id: string; title: string; instructor?: string; play: string }) {
  const [on, setOn] = useState(false);
  const { lang } = useLang();
  const t = useT(T);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition duration-200 hover:-translate-y-1">
      <div className="relative aspect-video bg-secondary">
        {on ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&hl=${lang}`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button type="button" onClick={() => setOn(true)} aria-label={`${play}: ${title}`} className="group absolute inset-0 w-full">
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={title} loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition group-hover:bg-foreground/30">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground shadow-brand"><Play className="h-6 w-6 fill-current" aria-hidden="true" /></span>
            </span>
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        {instructor && <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><User className="h-3.5 w-3.5" aria-hidden="true" />{t.by} {instructor}</p>}
      </div>
    </div>
  );
}

const DemoClasses = ({ demo }: { demo?: SalesPage["demo_classes"] }) => {
  const t = useT(T);
  const { pick, num, date } = useLang();
  const live = demo?.live_demo;
  const left = useCountdown(live?.starts_at);
  const videos = (demo?.videos ?? []).map((v) => ({ v, id: ytId(v.video_url) })).filter((x): x is { v: typeof x.v; id: string } => !!x.id);
  if (!videos.length && !live) return null;
  const pad = (n: number) => (n < 10 ? num(0) : "") + num(n);

  return (
    <SectionShell id={SECTION_IDS.demo} eyebrow={t.eyebrow} title={t.title}>
      {live && (
        <Reveal className="mb-6">
          <div className="rounded-2xl border border-border bg-brand-surface p-6 shadow-card">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-bold text-primary-foreground"><LivePulse live={!!live.starts_at && isLiveNow(live.starts_at)} />{t.liveDemo}</span>
            <h3 className="mt-3 text-xl font-bold text-foreground">{pick(live.topic)}</h3>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {live.starts_at && <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-brand-blue" aria-hidden="true" />{date(live.starts_at, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>}
              {live.instructor && <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-brand-blue" aria-hidden="true" />{pick(live.instructor)}</span>}
              {left && <span className="font-semibold tabular-nums text-foreground">{t.startsIn} {num(left.days)}{t.d} {pad(left.hours)}:{pad(left.minutes)}:{pad(left.seconds)}</span>}
            </div>
            {live.booking_url && (
              <a href={live.booking_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full bg-brand-blue px-5 py-2 text-sm font-semibold text-primary-foreground shadow-brand transition hover:bg-brand-blue-hover">
                {t.book}
              </a>
            )}
          </div>
        </Reveal>
      )}
      {videos.length > 0 && (
        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map(({ v, id }, i) => (
            <RevealItem key={i}><VideoCard id={id} title={pick(v.title)} instructor={pick(v.instructor)} play={t.play} /></RevealItem>
          ))}
        </RevealGroup>
      )}
    </SectionShell>
  );
};

export default DemoClasses;
