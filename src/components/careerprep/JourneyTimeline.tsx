import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, CircleDot, Flag, GraduationCap, Lock, Map } from 'lucide-react';
import { useTopicProgress } from '@/hooks/useTopics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { JourneyStage } from '@/hooks/useJourney';

interface Props {
  plan: JourneyStage[];
  currentWeek: number;
  journeySlug?: string;
}

const JourneyTimeline = ({ plan, currentWeek, journeySlug }: Props) => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { passed: passedTopics } = useTopicProgress();

  let weekCursor = 0;
  const stages = plan.map((stage) => {
    const start = weekCursor + 1;
    const end = weekCursor + (stage.duration_weeks ?? 0);
    weekCursor = end;
    return { ...stage, start, end };
  });

  const orderedTopics = stages.flatMap((stage) => stage.topics);
  const completedTopics = orderedTopics.filter((topic) => passedTopics.has(topic.id)).length;
  const totalTopics = orderedTopics.length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const nextTopicId = orderedTopics.find((topic) => !passedTopics.has(topic.id))?.id;

  return (
    <div>
      <div
        className="mb-5 flex flex-wrap items-end justify-between gap-2"
        role="progressbar"
        aria-label="Journey Topic progress"
        aria-valuemin={0}
        aria-valuemax={Math.max(totalTopics, 1)}
        aria-valuenow={completedTopics}
        aria-valuetext={`${completedTopics} of ${totalTopics} Topics completed`}
      >
        <div>
          <p className="text-sm font-extrabold text-foreground">Learning progress</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{completedTopics} of {totalTopics} Topics completed</p>
        </div>
        <p className="text-sm font-extrabold tabular-nums text-primary">{progressPercent}%</p>
      </div>

      <ol className="relative space-y-1">
        <span aria-hidden="true" className="absolute bottom-4 left-[15px] top-4 w-0.5 bg-border" />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-4 left-[15px] top-4 w-0.5 origin-top bg-primary"
          initial={reduceMotion ? false : { scaleY: 0 }}
          animate={{ scaleY: progressPercent / 100 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.38, ease: 'easeOut' }}
        />

        {stages.map((stage, index) => {
          const hasTopics = stage.topics.length > 0;
          const completedInStage = stage.topics.filter((topic) => passedTopics.has(topic.id)).length;
          const stageDone = hasTopics && completedInStage === stage.topics.length;
          const stageCurrent = stage.topics.some((topic) => topic.id === nextTopicId);
          const scheduleCurrent = currentWeek >= stage.start && currentWeek <= stage.end;
          const roadmapPublished = stage.roadmap?.status === 'published';

          return (
            <motion.li key={stage.id} initial={reduceMotion ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }} className="relative flex gap-4 pb-4">
              <span
                className={`relative z-10 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200 ${stageDone ? 'border-success bg-success-soft text-success-strong' : stageCurrent ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'}`}
                aria-label={stageDone ? 'Stage complete' : stageCurrent ? 'Stage in progress' : 'Stage upcoming'}
              >
                {stageDone ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : !stage.is_assessable ? <GraduationCap className="h-4 w-4" aria-hidden="true" /> : hasTopics ? <span className="text-xs font-black">{index + 1}</span> : <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`font-semibold ${stageCurrent ? 'text-foreground' : ''}`}>{stage.title}</p>
                  {stageCurrent && <Badge className="border-0 bg-primary/10 text-xs text-primary">In progress</Badge>}
                  {stageDone && <Badge className="border-0 bg-success-soft text-xs text-success-strong">Complete</Badge>}
                  {scheduleCurrent && !stageCurrent && !stageDone && <Badge variant="outline" className="text-xs">This week</Badge>}
                  {!stage.is_assessable && <Badge variant="outline" className="text-xs">not assessable here - Course</Badge>}
                  {!hasTopics && stage.is_assessable && <Badge variant="outline" className="text-xs">coming soon</Badge>}
                </div>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {stage.start === stage.end ? `Week ${stage.start}` : `Weeks ${stage.start}-${stage.end}`}
                  {' · '}{stage.duration_weeks}w{hasTopics ? ` · ${completedInStage}/${stage.topics.length} complete` : ''}
                </p>

                {hasTopics && (
                  <ul className="mt-2 space-y-1">
                    {stage.topics.map((topic) => {
                      const topicDone = passedTopics.has(topic.id);
                      const topicNext = topic.id === nextTopicId;
                      return (
                        <li key={topic.id}>
                          <button
                            onClick={() => navigate(`/career-prep/topic/${topic.slug}`)}
                            className="flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {topicDone ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" /> : topicNext ? <CircleDot className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                            <span className={`min-w-0 flex-1 leading-snug ${topicDone ? 'text-muted-foreground line-through' : topicNext ? 'font-semibold text-foreground' : ''}`}>{topic.title}</span>
                            {topicNext && <span className="shrink-0 text-xs font-bold text-primary">Next</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {roadmapPublished && stage.roadmap && (
                  <Button size="sm" variant="outline" className="mt-2 min-h-11 gap-1.5 rounded-full px-3 text-xs" onClick={() => navigate(`/roadmaps/${stage.roadmap!.slug}`)}>
                    <Map className="h-3.5 w-3.5" aria-hidden="true" /> View full roadmap
                  </Button>
                )}
              </div>
            </motion.li>
          );
        })}

        <li className="relative flex gap-4">
          <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 ${progressPercent === 100 ? 'border-success bg-success-soft text-success-strong' : 'border-dashed border-border bg-background text-muted-foreground'}`}>
            <Flag className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div className="pt-1">
            <p className="text-sm font-semibold">Final assessment &amp; certificate</p>
            <p className="text-xs text-muted-foreground">{weekCursor > 0 ? `Week ${weekCursor}` : 'At the end'} · timed, covers the assessed portion</p>
            {journeySlug && (
              <Button size="sm" variant="outline" className="mt-2 min-h-11 gap-1.5 rounded-full px-3 text-xs" onClick={() => navigate(`/career-prep/assessment/${journeySlug}`)}>
                <Flag className="h-3.5 w-3.5" aria-hidden="true" /> Take the assessment
              </Button>
            )}
          </div>
        </li>
      </ol>
    </div>
  );
};

export default JourneyTimeline;
