import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Zap, Trophy, ChevronRight, Play, RotateCcw, CalendarDays, Library, ChevronDown, Clock3,
} from 'lucide-react';
import { useXPStats } from '@/hooks/useCareerPrep';
import {
  useJourneys, useActiveEnrolment, useJourneyPlan, useEnrol, journeyPosition,
} from '@/hooks/useJourney';
import { useDailyChallenge } from '@/hooks/useDailyChallenge';
import { useJourneyQuestionPool, useJourneyDailyChallenge } from '@/hooks/useJourneyScope';
import { useNextUp } from '@/hooks/useNextUp';
import { useTopicProgress } from '@/hooks/useTopics';
import JourneyOffers from './JourneyOffers';
import { JourneyPanelSkeleton } from '@/components/ui/skeletons';
import JourneyTimeline from './JourneyTimeline';
import ClaimProfileCard from './ClaimProfileCard';
import { useDueReviews, usePostponeReview } from '@/hooks/useReviewSchedule';
import LearnerRhythmCard from './LearnerRhythmCard';
import { CURRENT_LEVELS, TARGET_ROLES, WEEKLY_TIME, recommendLearningPlan, type CurrentLevel, type LearningPreferences, type TargetRole, type WeeklyTime } from '@/domain/learningPlan';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { track } from '@/services/funnel';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLang, useT } from '@/i18n/lang';
import { RevealGroup, RevealItem } from '@/pages/course-details/motion';

const T = {
  en: {
    recommended: 'Your recommended journey', selectedRole: 'Selected role', choose: 'Choose a journey',
    noJourney: (role: string) => `No published Journey for ${role} yet.`,
    chooseWork: 'Choose the work you want to do.',
    built: (role: string, n: string, m: string, d: string) => `Built for your ${role} goal: ${n} focused sessions of about ${m} minutes, starting with ${d} practice.`,
    saved: (role: string) => `Your ${role} selection is saved. We’ll show this path when it is published.`,
    explore: 'Explore the paths below. You can change direction later without losing completed topic progress.',
    sessionsWeek: (n: string) => `${n} sessions/week`, startAt: (d: string) => `Start at ${d}`,
    fallbackDesc: 'Build your skills through focused topics, practice, and checkpoints.',
    startRec: 'Start recommended path', startPath: 'Start path',
    progressNext: 'Progress & next step', close: 'Close', viewOthers: 'View other journeys',
    weekOf: (w: string, t: string) => `Week ${w} of ${t}`, justStarted: 'Just started',
    topicsDone: (d: string, t: string) => `${d} of ${t} topics`,
    startColon: 'Start: ', continueColon: 'Continue: ',
    allPassed: 'Every topic passed — the final assessment is next.',
    switching: 'Switching archives your current plan rather than deleting it — topic progress is kept and carries across any plan that shares a topic.',
    level: (n: string) => `Level ${n}`, xpTo: (x: string, l: string) => `${x} XP to level ${l}`,
    yourPlan: 'Your plan', weeksTotal: (n: string) => `${n} weeks total`,
    doNow: 'Do now · Today\u2019s question', reviewDue: 'Review due',
    reviewHelp: 'Retrieve these without notes first. A correct attempt schedules the next review farther out.',
    tomorrow: 'Tomorrow', practiseQ: (t: string) => `Practise ${t} questions`, justPractise: 'Just practise questions',
    fromPlan: (n: string) => `${n} questions and case studies from your plan — browse and filter.`,
    noJourneyNeeded: (n: string) => `${n} questions and case studies — browse and filter, no Journey needed.`,
    reviewPractice: 'Review & practice', retry: 'Checkpoint to retry',
    rhythm: 'Your weekly rhythm and profile', deeper: 'Go deeper when it helps',
    optional: 'Optional courses, live sessions, and resources matched to your current journey.',
  },
  bn: {
    recommended: 'আপনার জন্য সুপারিশকৃত জার্নি', selectedRole: 'নির্বাচিত রোল', choose: 'একটি জার্নি বেছে নিন',
    noJourney: (role: string) => `${role} রোলের জন্য এখনও কোনো জার্নি প্রকাশিত হয়নি।`,
    chooseWork: 'যে কাজটি করতে চান, সেটি বেছে নিন।',
    built: (role: string, n: string, m: string, d: string) => `আপনার ${role} লক্ষ্যের জন্য সাজানো: সপ্তাহে ${n}টি ফোকাসড সেশন, প্রতিটি প্রায় ${m} মিনিটের, শুরু হবে ${d} প্র্যাকটিস দিয়ে।`,
    saved: (role: string) => `আপনার ${role} নির্বাচন সংরক্ষিত হয়েছে। পথটি প্রকাশিত হলে এখানে দেখানো হবে।`,
    explore: 'নিচের পথগুলো দেখুন। পরে দিক বদলালেও সম্পন্ন টপিকের অগ্রগতি হারাবে না।',
    sessionsWeek: (n: string) => `সপ্তাহে ${n}টি সেশন`, startAt: (d: string) => `শুরু: ${d}`,
    fallbackDesc: 'ফোকাসড টপিক, প্র্যাকটিস ও চেকপয়েন্টের মাধ্যমে দক্ষতা গড়ে তুলুন।',
    startRec: 'সুপারিশকৃত পথ শুরু করুন', startPath: 'পথ শুরু করুন',
    progressNext: 'অগ্রগতি ও পরবর্তী ধাপ', close: 'বন্ধ করুন', viewOthers: 'অন্য জার্নি দেখুন',
    weekOf: (w: string, t: string) => `${t} সপ্তাহের মধ্যে ${w} সপ্তাহ`, justStarted: 'মাত্র শুরু হয়েছে',
    topicsDone: (d: string, t: string) => `${t}টির মধ্যে ${d}টি টপিক`,
    startColon: 'শুরু করুন: ', continueColon: 'চালিয়ে যান: ',
    allPassed: 'সব টপিক পাস — এবার চূড়ান্ত মূল্যায়ন।',
    switching: 'জার্নি বদলালে বর্তমান প্ল্যান মুছে যায় না, আর্কাইভ হয় — টপিকের অগ্রগতি থেকে যায় এবং একই টপিক থাকা যেকোনো প্ল্যানে কাজে লাগে।',
    level: (n: string) => `লেভেল ${n}`, xpTo: (x: string, l: string) => `লেভেল ${l} পর্যন্ত আর ${x} XP`,
    yourPlan: 'আপনার প্ল্যান', weeksTotal: (n: string) => `মোট ${n} সপ্তাহ`,
    doNow: 'এখনই করুন · আজকের প্রশ্ন', reviewDue: 'রিভিউয়ের সময় হয়েছে',
    reviewHelp: 'আগে নোট না দেখে মনে করার চেষ্টা করুন। সঠিক উত্তর দিলে পরের রিভিউ আরও দূরে সরে যাবে।',
    tomorrow: 'আগামীকাল', practiseQ: (t: string) => `${t} প্রশ্ন প্র্যাকটিস করুন`, justPractise: 'শুধু প্রশ্ন প্র্যাকটিস করুন',
    fromPlan: (n: string) => `আপনার প্ল্যানের ${n}টি প্রশ্ন ও কেস স্টাডি — ব্রাউজ ও ফিল্টার করুন।`,
    noJourneyNeeded: (n: string) => `${n}টি প্রশ্ন ও কেস স্টাডি — ব্রাউজ ও ফিল্টার করুন, জার্নি ছাড়াই।`,
    reviewPractice: 'রিভিউ ও প্র্যাকটিস', retry: 'আবার দেওয়ার মতো চেকপয়েন্ট',
    rhythm: 'আপনার সাপ্তাহিক রুটিন ও প্রোফাইল', deeper: 'আরও গভীরে যেতে চাইলে',
    optional: 'আপনার বর্তমান জার্নির সাথে মানানসই ঐচ্ছিক কোর্স, লাইভ সেশন ও রিসোর্স।',
  },
};

// Variant A — "Journey First". The plan leads the page, and the Library sits on
// its own route behind a card, so a learner picks structure or practice.
//
// The Journey card is skipped when nothing is published, so the page degrades to
// the Library card rather than showing an empty personalization shell (§6).

/** Only the fields this panel reads. The Repository returns every column as
 *  optional, so a structural type keeps the call site honest without casting. */
interface QuestionLike {
  id?: string;
  slug?: string;
  title?: string;
  industry?: string;
  difficulty?: string;
  parent_id?: string | null;
}

interface Props {
  /** Top-level questions, already loaded by the page. */
  questions: QuestionLike[];
  onOpenQuestion: (slug: string) => void;
}

const JourneyPanel = ({ questions, onOpenQuestion }: Props) => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const t = useT(T);
  const { num } = useLang();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const { journeys, loading: journeysLoading } = useJourneys();
  const { enrolment } = useActiveEnrolment();
  const { plan } = useJourneyPlan(enrolment?.journey_id);
  const enrol = useEnrol();
  const stats = useXPStats();
  // Everything below is scoped to the enrolled Journey. A learner who picked AI
  // Engineering gets AI practice, an AI daily challenge and an AI queue — being
  // handed a window-functions drill reads as the product forgetting what they
  // chose.
  const { pool } = useJourneyQuestionPool(enrolment?.journey_id);
  const { daily: globalDaily } = useDailyChallenge();
  const { daily: journeyDaily } = useJourneyDailyChallenge(enrolment?.journey_id);
  const poolSlugs = new Set(pool.map((q) => q.slug));
  const { items: nextUp } = useNextUp(3, enrolment ? poolSlugs : undefined);
  const { reviews } = useDueReviews();
  const postpone = usePostponeReview();
  const dueReviews = reviews.filter((review) => !enrolment || poolSlugs.has(review.slug)).slice(0, 3);

  // The global deck still serves anyone who has not chosen a plan yet.
  const daily = enrolment
    ? (journeyDaily ? { question: journeyDaily } : null)
    : globalDaily;
  const { passed: passedTopics } = useTopicProgress();

  // Topic progress, not XP progress: what the learner is asking is "how far
  // through the plan am I", and XP answers a different question.
  const planTopics = plan.flatMap((stage) => stage.topics);
  const doneCount = planTopics.filter((t) => passedTopics.has(t.id)).length;
  const nextTopic = planTopics.find((t) => !passedTopics.has(t.id)) ?? null;
  const planPct = planTopics.length ? Math.round((doneCount / planTopics.length) * 100) : 0;

  const journey = journeys.find((j) => j.id === enrolment?.journey_id);
  const roleParam = searchParams.get('role');
  const levelParam = searchParams.get('level');
  const timeParam = searchParams.get('time');
  const preferredRole = TARGET_ROLES.includes(roleParam as TargetRole) ? roleParam as TargetRole : null;
  const preferredLevel = CURRENT_LEVELS.includes(levelParam as CurrentLevel) ? levelParam as CurrentLevel : null;
  const preferredTime = WEEKLY_TIME.includes(timeParam as WeeklyTime) ? timeParam as WeeklyTime : null;
  const preferences: LearningPreferences | null = preferredRole && preferredLevel && preferredTime
    ? { role: preferredRole, level: preferredLevel, time: preferredTime }
    : null;
  const recommendation = useMemo(() => preferences ? recommendLearningPlan(preferences, journeys) : null, [preferences, journeys]);
  const recommendedJourney = journeys.find((candidate) => candidate.id === recommendation?.journey?.id);
  const { pool: recommendedPool } = useJourneyQuestionPool(recommendedJourney?.id);
  const orderedJourneys = recommendedJourney
    ? [recommendedJourney, ...journeys.filter((candidate) => candidate.id !== recommendedJourney.id)]
    : journeys;
  const visibleJourneys = preferences
    ? (recommendedJourney ? [recommendedJourney] : [])
    : orderedJourneys;
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showPlan, setShowPlan] = useState(true);

  useEffect(() => {
    if (!preferences || !session?.user?.id || !recommendation) return;
    void (supabase as any).from('profiles').upsert({
      id: session.user.id,
      target_role: preferences.role,
      current_level: preferences.level,
      weekly_minutes: recommendation.sessionsPerWeek * recommendation.minutesPerSession,
      weekly_session_goal: recommendation.sessionsPerWeek,
    });
  }, [preferences, recommendation, session?.user?.id]);

  const startRecommendation = () => {
    if (!recommendedJourney || !recommendation) return;
    const firstQuestion = recommendedPool.find((question) => question.difficulty === recommendation.difficulty) ?? recommendedPool[0];
    void track({ event: 'journey_selected', surface: 'lobby', subjectType: 'journey', subjectId: recommendedJourney.id, journeyId: recommendedJourney.id, metadata: { ...preferences, starting_mode: recommendation.startingMode } });
    enrol.mutate(recommendedJourney.id, { onSuccess: () => firstQuestion ? navigate(`/career-prep/solve/${firstQuestion.slug}`) : navigate('/career-prep') });
  };

  // The plan is the whole page here, so an empty frame while it loads reads as
  // a broken page. A skeleton of the same shape holds the space instead.
  if (journeysLoading) return <JourneyPanelSkeleton />;

  // No early return on "no Journeys": the Library card below is the other way
  // in, and it must survive an empty Journey list. Only the Journey/intake card
  // is conditional.
  return (
    <section className="container max-w-7xl mx-auto px-4 pb-4">
      {journeys.length === 0 ? null : journey && !preferences ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-bold text-muted-foreground">
                  {t.progressNext}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-extrabold">{journey.title}</h2>
                  {/* Switching is a real need — people change target roles — but it
                      must not compete with Continue, so it is a quiet link beside
                      the title rather than a button in the action row. */}
                  <button
                    onClick={() => setShowSwitcher((v) => !v)}
                    className="min-h-11 px-2 text-sm font-bold text-muted-foreground underline underline-offset-4 hover:text-primary"
                  >
                    {showSwitcher ? t.close : t.viewOthers}
                  </button>
                </div>
                {(() => {
                  const { week, totalWeeks } = journeyPosition(plan, enrolment?.started_at);
                  return (
                    <p className="text-sm text-muted-foreground">
                      {totalWeeks > 0 ? t.weekOf(num(week), num(totalWeeks)) : t.justStarted}
                    </p>
                  );
                })()}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Zap className="h-4 w-4 text-primary" />{num(stats.xp)}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <Trophy className="h-4 w-4 text-success" />
                  {stats.levelName ?? t.level(num(stats.level))}
                </span>
              </div>
            </div>
            {planTopics.length > 0 && (
              <>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-bold">
                    {t.topicsDone(num(doneCount), num(planTopics.length))}
                  </span>
                  <span className="text-muted-foreground">{num(planPct)}%</span>
                </div>
                <Progress value={planPct} className="h-2" />

                {/* One button, always pointing at the next unfinished Topic.
                    A plan the learner has to re-find their place in is a plan
                    that quietly stops being followed. */}
                {nextTopic && (
                  <Button
                    className="mt-4 w-full justify-between gap-3 rounded-full sm:w-auto"
                    onClick={() => navigate(`/career-prep/topic/${nextTopic.slug}`)}
                  >
                    <span className="truncate">
                      {doneCount === 0 ? t.startColon : t.continueColon}{nextTopic.title}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </Button>
                )}
                {!nextTopic && (
                  <p className="mt-3 text-sm font-bold text-success">
                    {t.allPassed}
                  </p>
                )}
              </>
            )}

            {showSwitcher && (
              <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                <p className="mb-2 text-xs text-muted-foreground">
                  {t.switching}
                </p>
                <div className="flex flex-wrap gap-2">
                  {journeys
                    .filter((j) => j.id !== journey.id)
                    .map((j) => (
                      <Button
                        key={j.id}
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={enrol.isPending}
                        onClick={() => enrol.mutate(j.id, { onSuccess: () => setShowSwitcher(false) })}
                      >
                        {j.title}
                      </Button>
                    ))}
                </div>
              </div>
            )}

            <div className="mt-4 border-t border-border pt-3">
              <Progress value={Math.round(stats.levelProgress * 100)} className="h-1.5" />
              {stats.nextLevelXp !== null && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.xpTo(num(stats.nextLevelXp - stats.xp), num(stats.level + 1))}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="path-catalog">
          <CardContent className="p-8">
            <p className="text-sm font-bold text-primary">{recommendedJourney ? t.recommended : preferences ? t.selectedRole : t.choose}</p>
            <h2 className="mb-2 mt-1 text-2xl font-extrabold">{recommendedJourney?.title ?? (preferredRole ? t.noJourney(preferredRole) : t.chooseWork)}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {recommendedJourney
                ? t.built(String(preferredRole), num(recommendation?.sessionsPerWeek ?? 0), num(recommendation?.minutesPerSession ?? 0), (recommendation?.difficulty ?? '').toLowerCase())
                : preferences
                  ? t.saved(String(preferredRole))
                  : t.explore}
            </p>
            {recommendedJourney && recommendation && (
              <motion.div initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-5 flex max-w-lg flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-primary"><Clock3 className="mr-1 inline h-3.5 w-3.5" />{t.sessionsWeek(num(recommendation.sessionsPerWeek))}</span>
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-primary">{recommendation.startingMode.replace('-', ' ')}</span>
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-primary">{t.startAt(recommendation.difficulty)}</span>
              </motion.div>
            )}
            <RevealGroup className="path-options">
              {visibleJourneys.map((j, index) => (
                <RevealItem key={j.id}>
                <button className="path-option group w-full" disabled={enrol.isPending}
                  onClick={() => recommendedJourney?.id === j.id ? startRecommendation() : enrol.mutate(j.id)}>
                  <span className="path-option-number" aria-hidden="true">{num(index + 1).padStart(2, num(0))}</span>
                  <span><span className="path-option-title">{j.title}</span>
                    <span className="path-option-description">{j.description || j.goal || t.fallbackDesc}</span>
                  </span>
                  <span className="path-option-action">{recommendedJourney?.id === j.id ? t.startRec : t.startPath}<ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" /></span>
                </button>
                </RevealItem>
              ))}
            </RevealGroup>
          </CardContent>
        </Card>
      )}

      {journey && plan.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <button className="mb-2 flex min-h-11 w-full items-center justify-between gap-2 text-left" onClick={() => setShowPlan((value) => !value)} aria-expanded={showPlan} aria-controls="journey-timeline">
              <h3 className="text-sm font-bold text-muted-foreground">
                {t.yourPlan}
              </h3>
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                {t.weeksTotal(num(plan.reduce((n, r) => n + (r.duration_weeks ?? 0), 0)))}
                <ChevronDown className={`h-4 w-4 transition-transform ${showPlan ? 'rotate-180' : ''}`} />
              </span>
            </button>
            <AnimatePresence initial={false}>{showPlan && <motion.div id="journey-timeline" initial={reduceMotion ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}><JourneyTimeline plan={plan} currentWeek={journeyPosition(plan, enrolment?.started_at).week} journeySlug={journey.slug} /></motion.div>}</AnimatePresence>
          </CardContent>
        </Card>
      )}

      {daily?.question && (
        <motion.button initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => onOpenQuestion(daily.question!.slug)}
          className="mb-6 flex min-h-16 w-full items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left shadow-card transition-colors hover:bg-primary/10"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><CalendarDays className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-primary">{t.doNow}</span><span className="block line-clamp-2 text-sm font-bold leading-snug">{daily.question.title}</span><span className="block truncate text-xs text-muted-foreground">{daily.question.industry} · {daily.question.difficulty}</span></span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </motion.button>
      )}

      {dueReviews.length > 0 && (
        <div className="mb-6 rounded-2xl border border-warning/30 bg-warning-soft p-4">
          <h3 className="text-sm font-bold text-warning-foreground">{t.reviewDue}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t.reviewHelp}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {dueReviews.map((review) => (
              <div key={review.slug} className="flex min-h-14 items-center gap-2 rounded-xl border border-warning/30 bg-card p-2">
              <button onClick={() => onOpenQuestion(review.slug)} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left transition-colors hover:bg-warning-soft">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warning-soft text-warning"><RotateCcw className="h-4 w-4" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1"><span className="block line-clamp-2 text-sm font-bold">{review.title}</span><span className="block truncate text-xs text-muted-foreground">{review.industry} · {review.difficulty}</span></span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
              <Button size="sm" variant="ghost" className="min-h-11 shrink-0 px-2 text-xs" disabled={postpone.isPending} onClick={() => postpone.mutate(review)}>{t.tomorrow}</Button>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* The other way in. A learner with a screening next week wants to drill
          questions, not enrol in a 12-week plan — so the choice is explicit
          rather than the Library being buried. */}
      <button
        onClick={() => navigate(journey ? `/career-prep/library?journey=${journey.slug}` : '/career-prep/library')}
        className="mb-6 flex min-h-14 w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-muted/50"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
          <Library className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">
            {journey ? t.practiseQ(journey.title) : t.justPractise}
          </span>
          <span className="block text-sm leading-5 text-muted-foreground">
            {journey
              ? t.fromPlan(num(pool.length))
              : t.noJourneyNeeded(num(questions.filter((q) => !q.parent_id).length))}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {nextUp.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-bold text-muted-foreground">
            {t.reviewPractice}
          </h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {nextUp.map((item) => (
              <button
                key={`${item.kind}-${item.slug}-${item.step_slug ?? ''}`}
                onClick={() =>
                  item.kind === 'retry' && item.roadmap_slug
                    ? navigate(`/roadmaps/${item.roadmap_slug}`)
                    : onOpenQuestion(item.slug)
                }
                className="flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50"
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                  item.kind === 'retry' ? 'bg-warning-soft text-warning' : 'bg-primary/10 text-primary'
                }`}>
                  {item.kind === 'retry' ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block line-clamp-2 text-sm font-bold leading-snug">{item.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.kind === 'retry'
                      ? t.retry
                      : `${item.industry} · ${item.difficulty}`}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}


      <details className="path-extras">
        <summary>{t.rhythm}</summary>
        <LearnerRhythmCard initialGoal={recommendation?.sessionsPerWeek ?? 2} dueReviewCount={dueReviews.length} />
        <ClaimProfileCard />
      </details>
      <div className="mb-3 mt-8">
        <h3 className="text-sm font-bold text-muted-foreground">{t.deeper}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t.optional}</p>
      </div>
      <JourneyOffers journeyId={journey?.id ?? journeys[0]?.id} />

    </section>
  );
};

export default JourneyPanel;
