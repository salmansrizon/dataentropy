import { useState } from "react";
import { motion } from "framer-motion";
import { useLang, useT } from "@/i18n/lang";
import {
  Play, Lock, CheckCircle2, FileText, MonitorPlay, Award, Pin, CheckSquare,
  GraduationCap, Rocket, BookOpen, Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { CourseContent, CourseSection } from "./types";

const contentTypeIcons: Record<string, typeof MonitorPlay> = {
  video: MonitorPlay,
  lecture: GraduationCap,
  quiz: CheckSquare,
  assignment: Award,
  project: Rocket,
  lesson: BookOpen,
  text: FileText,
};

const T = {
  en: {
    content: "Course Content", complete: "complete", progress: "Course lesson progress", section: "Section", lessons: "lessons", preview: "Preview",
    play: "Play", unlock: "Enroll to unlock this video", incomplete: "Mark incomplete", markDone: "Mark lesson complete", none: "No content available.",
  },
  bn: {
    content: "কোর্স কনটেন্ট", complete: "সম্পন্ন", progress: "কোর্স পাঠের অগ্রগতি", section: "সেকশন", lessons: "টি পাঠ", preview: "প্রিভিউ",
    play: "চালান", unlock: "ভিডিও আনলক করতে ভর্তি হন", incomplete: "অসম্পূর্ণ হিসেবে চিহ্নিত করুন", markDone: "পাঠ সম্পন্ন করুন", none: "কোনো কনটেন্ট নেই।",
  },
};

function TypeIcon({ type }: { type: string }) {
  const Icon = contentTypeIcons[type] ?? Layout;
  return <Icon className="w-4 h-4 text-muted-foreground shrink-0" />;
}

export interface LessonPlayerProps {
  sections: CourseSection[];
  openLesson: string;
  onOpenLessonChange: (id: string) => void;
  isUnlocked: (item: CourseContent) => boolean;
  completedIds: ReadonlySet<unknown>;
  saving: boolean;
  markOpened: (id: string) => void;
  setCompleted: (id: string, done: boolean) => void;
  /** Show the completion header + progress bar (enrolled learners). */
  showProgress: boolean;
}

/** Section -> lesson accordion. Behavior moved verbatim from CourseDetails. */
export default function LessonPlayer({
  sections, openLesson, onOpenLessonChange, isUnlocked, completedIds, saving, markOpened, setCompleted, showProgress,
}: LessonPlayerProps) {
  const t = useT(T);
  const { num } = useLang();
  const [playingLessons, setPlayingLessons] = useState<Set<string>>(new Set());
  const all = sections.flatMap((s) => s.contents ?? []);
  const total = all.length;
  const completed = all.filter((i) => completedIds.has(i.id)).length;

  return (
    <div id="course-content" className="scroll-mt-32 bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-card">
      {showProgress && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{t.content}</h2>
            <p className="text-sm text-muted-foreground">{num(completed)}/{num(total)} {t.complete}</p>
          </div>
          {total > 0 && <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={t.progress} aria-valuemin={0} aria-valuemax={total} aria-valuenow={completed}><motion.div className="h-full rounded-full bg-primary" initial={false} animate={{ width: `${completed / total * 100}%` }} transition={{ duration: 0.25 }} /></div>}
        </>
      )}
      <div className="w-full relative pl-0 sm:pl-6 overflow-hidden">
        <div className="absolute left-[31px] sm:left-[39px] top-4 bottom-4 w-[2px] bg-border z-0 hidden sm:block"></div>
        <div className="space-y-6 relative z-10">
          {sections.length > 0 ? (
            sections.map((section, sIndex) => (
              <div key={section.id} className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border"><Pin className="w-4 h-4 rotate-45" /></div>
                  <div>
                    <h3 className="font-bold text-foreground text-base sm:text-lg leading-tight">{section.title}</h3>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mt-0.5">{t.section} {num(sIndex + 1)} · {num(section.contents?.length ?? 0)} {t.lessons}</p>
                  </div>
                </div>
                <Accordion type="single" collapsible value={openLesson} onValueChange={(value) => { onOpenLessonChange(value); const item = section.contents?.find((c) => c.id === value); if (item && isUnlocked(item)) markOpened(item.id); }} className="w-full space-y-3">
                  {section.contents?.map((item) => {
                    const unlocked = isUnlocked(item);
                    return (
                      <AccordionItem key={item.id} value={item.id} className="bg-background border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-card transition-all group/item">
                        <AccordionTrigger className="w-full hover:no-underline px-4 py-4">
                          <div className="flex items-center gap-4 flex-1 text-left pr-2">
                            <div className="hidden sm:flex relative items-center justify-center w-6 shrink-0"><div className="w-3 h-3 rounded-full border-2 border-foreground bg-background z-10" /></div>
                            <div className="flex-1 select-none pr-4">
                              <p className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-2 group-hover/item:text-primary transition-colors">
                                <TypeIcon type={item.content_type} /> <span className="line-clamp-1">{item.title}</span>
                                {!showProgress && item.is_free && <span className="ml-1 shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{t.preview}</span>}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 pl-4 shrink-0 mr-4">
                              {completedIds.has(item.id) ? <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="h-4 w-4" /></div> : unlocked ? <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Play className="w-3.5 h-3.5 text-primary fill-current" /></div> : <Lock className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 sm:px-14 pb-4 pt-0">
                          <div className="space-y-3 border-l-2 border-border pl-6 py-2 mt-2 bg-secondary/40 rounded-r-lg relative">
                            {item.description && <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{item.description}</p>}
                            {(() => {
                              const videoUrl = (item.content_data as any)?.video_url;
                              if (!videoUrl) return null;
                              const ytId = videoUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
                              if (!ytId) return null;
                              if (unlocked) {
                                const isPlaying = playingLessons.has(item.id);
                                return (
                                  <div className="mt-3 rounded-xl overflow-hidden border border-border shadow-sm bg-scrim">
                                    <div className="relative w-full overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                                      {isPlaying ? (
                                        <>
                                          <iframe
                                            src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&showinfo=0&controls=1&fs=1&iv_load_policy=3&cc_load_policy=0&playsinline=1&autoplay=1`}
                                            className="absolute inset-0 w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            title={item.title}
                                          />
                                          {/* Mask YouTube chrome (top title bar & bottom watch-on-yt) */}
                                          <div className="absolute top-0 left-0 right-0 h-14 bg-scrim pointer-events-none z-10" />
                                          <div className="absolute bottom-0 right-0 h-12 w-40 bg-scrim pointer-events-none z-10" />
                                        </>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setPlayingLessons((prev) => new Set(prev).add(item.id))}
                                          className="absolute inset-0 w-full h-full group/play"
                                          aria-label={`${t.play} ${item.title}`}
                                        >
                                          <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-scrim/30 group-hover/play:bg-scrim/40 transition-colors" />
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-pop ring-4 ring-primary-foreground/20 group-hover/play:scale-110 transition-transform">
                                              <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
                                            </div>
                                          </div>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div className="mt-3 rounded-xl overflow-hidden border border-border shadow-sm relative">
                                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                    <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={item.title} className="absolute inset-0 w-full h-full object-cover blur-sm brightness-50" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
                                      <Lock className="w-8 h-8 text-muted-foreground" />
                                      <p className="text-sm font-semibold text-foreground">{t.unlock}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                            {unlocked && <Button variant={completedIds.has(item.id) ? 'outline' : 'default'} className="min-h-11 rounded-full" disabled={saving} onClick={() => setCompleted(item.id, !completedIds.has(item.id))}>{completedIds.has(item.id) ? t.incomplete : t.markDone}</Button>}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            ))
          ) : (<div className="text-center py-12">{t.none}</div>)}
        </div>
      </div>
    </div>
  );
}
