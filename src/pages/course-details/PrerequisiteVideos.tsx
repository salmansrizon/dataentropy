import { useState } from "react";
import { ExternalLink, PlayCircle } from "lucide-react";
import { useLang, useT } from "@/i18n/lang";
import type { SalesPage } from "./salesPage";
import SectionShell from "./SectionShell";
import { RevealGroup, RevealItem } from "./motion";

const T = {
  en: { title: "Free prep videos", viewAll: "View all", play: "Play" },
  bn: { title: "ফ্রি প্রস্তুতি ভিডিও", viewAll: "সব দেখুন", play: "চালু করুন" },
};

const ytId = (u: string) => u.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];

const PrerequisiteVideos = ({ data }: { data?: SalesPage["prerequisite_videos"] }) => {
  const t = useT(T);
  const { pick, num } = useLang();
  const [playing, setPlaying] = useState<number | null>(null);
  if (!data?.videos.length) return null;
  return (
    <SectionShell id="prerequisites" title={data.title ? pick(data.title) : t.title}>
      <RevealGroup className="grid gap-4 md:grid-cols-2">
        {data.videos.map((v, i) => {
          const id = ytId(v.video_url);
          const title = pick(v.title);
          return (
            <RevealItem key={i}>
              <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card transition duration-200 hover:-translate-y-1">
                <div className="relative aspect-video bg-secondary">
                  {id && playing === i ? (
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
                      title={title}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  ) : id ? (
                    <button type="button" onClick={() => setPlaying(i)} aria-label={`${t.play}: ${title}`} className="group absolute inset-0 h-full w-full">
                      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                      <PlayCircle aria-hidden className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue text-primary-foreground transition group-hover:scale-110" />
                    </button>
                  ) : (
                    <a href={v.video_url} target="_blank" rel="noopener noreferrer" aria-label={`${t.play}: ${title}`} className="absolute inset-0 flex items-center justify-center text-brand-blue">
                      <PlayCircle aria-hidden className="h-14 w-14" />
                    </a>
                  )}
                </div>
                <h3 className="p-4 text-sm font-semibold text-foreground">
                  <span className="text-brand-blue">{num(i + 1)}.</span> {title}
                </h3>
              </article>
            </RevealItem>
          );
        })}
      </RevealGroup>
      {data.view_all_url && (
        <a href={data.view_all_url} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:text-brand-blue-hover">
          {t.viewAll} <ExternalLink aria-hidden className="h-4 w-4" />
        </a>
      )}
    </SectionShell>
  );
};

export default PrerequisiteVideos;
