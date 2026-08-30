import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Circle,
  Code2,
  Layers3,
  Lightbulb,
  ListChecks,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Topic, TopicQuestion, TopicSection } from '@/hooks/useTopics';

type StepId = 'learn' | 'explore' | 'recall' | 'practice' | 'apply' | 'checkpoint' | 'toolkit';

interface StepDefinition {
  id: StepId;
  label: string;
  eyebrow: string;
  icon: typeof BookOpen;
}

interface Props {
  topic: Topic;
  sections: TopicSection[];
  practice: TopicQuestion[];
  caseStudies: TopicQuestion[];
  isDone: boolean;
  hasCheckpoint: boolean;
  toolkit: ReactNode;
  nextTopic?: { slug: string; title: string } | null;
  onOpenQuestion: (slug: string) => void;
  onOpenCheckpoint: () => void;
  onOpenNext: () => void;
}

const BASE_STEPS: StepDefinition[] = [
  { id: 'learn', label: 'Learn', eyebrow: 'Build the idea', icon: BookOpen },
  { id: 'explore', label: 'Explore', eyebrow: 'See it in action', icon: Layers3 },
  { id: 'recall', label: 'Recall', eyebrow: 'Retrieve from memory', icon: Brain },
  { id: 'practice', label: 'Practise', eyebrow: 'Try it yourself', icon: Code2 },
  { id: 'apply', label: 'Apply', eyebrow: 'Use it in context', icon: BriefcaseBusiness },
  { id: 'checkpoint', label: 'Checkpoint', eyebrow: 'Prove your understanding', icon: Target },
  { id: 'toolkit', label: 'Toolkit', eyebrow: 'Go deeper', icon: Wrench },
];

const storageKey = (topicId: string) => `dataentropy:learning-board:${topicId}:v1`;

function readCompleted(topicId: string): StepId[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey(topicId)) ?? '[]');
    return Array.isArray(saved) ? saved.filter((value): value is StepId => BASE_STEPS.some((step) => step.id === value)) : [];
  } catch {
    return [];
  }
}

export default function TopicLearningBoard({
  topic,
  sections,
  practice,
  caseStudies,
  isDone,
  hasCheckpoint,
  toolkit,
  nextTopic,
  onOpenQuestion,
  onOpenCheckpoint,
  onOpenNext,
}: Props) {
  const reduceMotion = useReducedMotion();
  const steps = useMemo(
    () => BASE_STEPS.filter((step) => step.id !== 'apply' || caseStudies.length > 0),
    [caseStudies.length],
  );
  const [completed, setCompleted] = useState<Set<StepId>>(() => new Set(readCompleted(topic.id)));
  const [activeId, setActiveId] = useState<StepId>(() => {
    const saved = new Set(readCompleted(topic.id));
    return steps.find((step) => !saved.has(step.id))?.id ?? 'toolkit';
  });
  const [sectionIndex, setSectionIndex] = useState(0);
  const [recallRevealed, setRecallRevealed] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const saved = new Set(readCompleted(topic.id));
    setCompleted(saved);
    setActiveId(steps.find((step) => !saved.has(step.id))?.id ?? 'toolkit');
    setSectionIndex(0);
    setRecallRevealed(false);
  }, [steps, topic.id]);

  useEffect(() => {
    if (!isDone || completed.has('checkpoint')) return;
    setCompleted((current) => {
      const next = new Set(current).add('checkpoint');
      window.localStorage.setItem(storageKey(topic.id), JSON.stringify([...next]));
      return next;
    });
    setActiveId('toolkit');
    setAnnouncement('Checkpoint complete. Toolkit is now highlighted.');
  }, [completed, isDone, topic.id]);

  const activeIndex = Math.max(0, steps.findIndex((step) => step.id === activeId));
  const activeStep = steps[activeIndex];
  const completeCount = steps.filter((step) => completed.has(step.id)).length;
  const progress = Math.round((completeCount / steps.length) * 100);

  const completeStep = (id: StepId) => {
    const currentIndex = steps.findIndex((step) => step.id === id);
    const nextStep = steps[currentIndex + 1];
    setCompleted((current) => {
      const next = new Set(current).add(id);
      window.localStorage.setItem(storageKey(topic.id), JSON.stringify([...next]));
      return next;
    });
    if (nextStep) {
      setActiveId(nextStep.id);
      setAnnouncement(`${steps[currentIndex].label} complete. ${nextStep.label} is now highlighted.`);
    }
  };

  const goBack = () => {
    const previous = steps[activeIndex - 1];
    if (previous) setActiveId(previous.id);
  };

  const commonFinish = (label = 'Complete step') => (
    <Button className="min-h-11 gap-2 rounded-full px-5" onClick={() => completeStep(activeId)}>
      {label}<ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Button>
  );

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-card shadow-[0_24px_80px_-36px_hsl(var(--primary)/0.42)]" aria-labelledby="learning-board-title">
      <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-card to-secondary/30 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Interactive learning board
            </div>
            <h2 id="learning-board-title" className="mt-1 text-xl font-black tracking-tight sm:text-2xl">One clear step at a time</h2>
          </div>
          <div className="min-w-36">
            <div className="mb-1.5 flex justify-between text-xs font-bold"><span>{completeCount}/{steps.length} steps</span><span>{progress}%</span></div>
            <Progress value={progress} className="h-2 w-40 max-w-full" aria-label={`${progress}% of board steps complete`} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav className="border-b border-border/70 bg-muted/25 p-3 lg:border-b-0 lg:border-r lg:p-4" aria-label="Topic learning steps">
          <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const done = completed.has(step.id) || (step.id === 'checkpoint' && isDone);
              const active = step.id === activeId;
              const nextUp = !done && index === steps.findIndex((candidate) => !completed.has(candidate.id));
              return (
                <li key={step.id} className="shrink-0 lg:w-full">
                  <button
                    type="button"
                    onClick={() => setActiveId(step.id)}
                    aria-label={`Step ${index + 1}: ${step.label}${done ? ', complete' : active ? ', current' : ''}`}
                    aria-current={active ? 'step' : undefined}
                    className={`group flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                      active
                        ? 'border-primary/50 bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                        : done
                          ? 'border-success/25 bg-success-soft/50 hover:border-success/45'
                          : nextUp
                            ? 'border-primary/35 bg-primary/10 hover:bg-primary/15'
                            : 'border-transparent hover:border-border hover:bg-card'
                    }`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${active ? 'bg-primary-foreground/15' : done ? 'bg-success/15 text-success' : 'bg-card text-muted-foreground'}`}>
                      {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider opacity-75">Step {index + 1}</span>
                      <span className="block text-sm font-extrabold">{step.label}</span>
                    </span>
                    {nextUp && !active ? <span className="ml-auto hidden h-2 w-2 rounded-full bg-primary lg:block" aria-label="Up next" /> : null}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="min-w-0 p-4 sm:p-6 lg:min-h-[34rem] lg:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{activeStep.eyebrow}</p>
              <h3 className="mt-1 text-2xl font-black tracking-tight">{activeStep.label}</h3>
            </div>
            {completed.has(activeId) ? <Badge className="border-0 bg-success-soft text-success-strong"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Done</Badge> : null}
          </div>

          <AnimatePresence initial={false}>
            <motion.div
              key={activeId}
              initial={reduceMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
            >
              {activeId === 'learn' ? (
                <LearnStage topic={topic} onComplete={() => completeStep('learn')} />
              ) : activeId === 'explore' ? (
                <ExploreStage sections={sections} index={sectionIndex} setIndex={setSectionIndex} onComplete={() => completeStep('explore')} reduceMotion={!!reduceMotion} />
              ) : activeId === 'recall' ? (
                <RecallStage topic={topic} revealed={recallRevealed} setRevealed={setRecallRevealed} onComplete={() => completeStep('recall')} reduceMotion={!!reduceMotion} />
              ) : activeId === 'practice' ? (
                <QuestionStage questions={practice} empty="No practice is attached yet. You can still continue." onOpen={onOpenQuestion} icon="practice" footer={commonFinish(practice.length ? 'I finished practising' : 'Continue')} />
              ) : activeId === 'apply' ? (
                <QuestionStage questions={caseStudies} empty="No case study is attached yet." onOpen={onOpenQuestion} icon="case" footer={commonFinish('I explored the case')} />
              ) : activeId === 'checkpoint' ? (
                <CheckpointStage isDone={isDone} hasCheckpoint={hasCheckpoint} onOpen={onOpenCheckpoint} onContinue={() => completeStep('checkpoint')} />
              ) : (
                <div>
                  <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="font-bold">Keep learning without losing your place.</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Open references, ask a mentor, or choose a deeper resource. These are optional and do not block your progress.</p>
                  </div>
                  {toolkit}
                  <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="outline" className="min-h-11 rounded-full" onClick={() => completeStep('toolkit')} disabled={completed.has('toolkit')}>
                      {completed.has('toolkit') ? <><Check className="mr-2 h-4 w-4" />Toolkit explored</> : 'Mark toolkit explored'}
                    </Button>
                    {nextTopic ? <Button className="min-h-11 justify-between gap-3 rounded-full" onClick={onOpenNext}>Next topic: {nextTopic.title}<ArrowRight className="h-4 w-4" /></Button> : null}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4">
            <Button variant="ghost" className="min-h-11 gap-2 rounded-full" onClick={goBack} disabled={activeIndex === 0}>
              <ArrowLeft className="h-4 w-4" />Previous
            </Button>
            <p className="hidden text-xs text-muted-foreground sm:block">Step {activeIndex + 1} of {steps.length}</p>
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </section>
  );
}

function LearnStage({ topic, onComplete }: { topic: Topic; onComplete: () => void }) {
  const cards = [
    { label: 'What it is', body: topic.what_it_is, icon: Lightbulb },
    { label: 'Why it matters', body: topic.why_it_matters, icon: Target },
    { label: 'How it works', body: topic.how_it_works, icon: Layers3 },
    { label: 'In plain terms', body: topic.analogy, icon: Sparkles },
  ];
  const [open, setOpen] = useState(0);
  return (
    <div>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Tap each splash card to switch the lens. The idea stays compact while you control the depth.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {cards.map(({ label, body, icon: Icon }, index) => {
          const active = index === open;
          return (
            <button key={label} type="button" onClick={() => setOpen(index)} aria-expanded={active}
              className={`min-h-28 rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active ? 'border-primary/45 bg-primary/5 shadow-card' : 'border-border bg-card hover:border-primary/25'}`}>
              <div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><Icon className="h-5 w-5" /></span><span className="font-extrabold">{label}</span></div>
              <AnimatePresence initial={false}>{active ? <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm leading-6 text-foreground/85">{body}</motion.p> : <p className="mt-3 text-xs text-muted-foreground">Tap to reveal</p>}</AnimatePresence>
            </button>
          );
        })}
      </div>
      <Button className="mt-5 min-h-11 gap-2 rounded-full" onClick={onComplete}>I understand the idea<ArrowRight className="h-4 w-4" /></Button>
    </div>
  );
}

function ExploreStage({ sections, index, setIndex, onComplete, reduceMotion }: { sections: TopicSection[]; index: number; setIndex: (index: number) => void; onComplete: () => void; reduceMotion: boolean }) {
  if (!sections.length) return <EmptyStage message="No deep-dive cards are attached yet." action="Continue to recall" onAction={onComplete} />;
  const section = sections[Math.min(index, sections.length - 1)];
  const last = index >= sections.length - 1;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Card {index + 1} of {sections.length}</p><div className="flex gap-1" aria-hidden="true">{sections.map((item, dot) => <span key={item.id} className={`h-1.5 rounded-full transition-all ${dot === index ? 'w-7 bg-primary' : dot < index ? 'w-3 bg-success' : 'w-3 bg-muted'}`} />)}</div></div>
      <AnimatePresence>
        <motion.article key={section.id} initial={reduceMotion ? false : { opacity: 0, scale: 0.98, rotate: 0.4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }} transition={{ duration: reduceMotion ? 0 : 0.22 }} className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-secondary/30 p-5 shadow-card sm:p-7">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">{section.section_type.replaceAll('_', ' ')}</span>
          <h4 className="mt-2 text-xl font-black">{section.title}</h4>
          <p className="mt-4 whitespace-pre-line text-base leading-7 text-foreground/85">{section.body}</p>
          {section.takeaway ? <div className="mt-5 rounded-2xl border border-primary/20 bg-card/80 p-4"><p className="text-xs font-black uppercase tracking-wider text-primary">Takeaway</p><p className="mt-1 text-sm font-semibold leading-6">{section.takeaway}</p></div> : null}
        </motion.article>
      </AnimatePresence>
      <div className="mt-5 flex justify-between gap-2">
        <Button variant="outline" className="min-h-11 rounded-full" disabled={index === 0} onClick={() => setIndex(Math.max(0, index - 1))}><ArrowLeft className="mr-2 h-4 w-4" />Previous card</Button>
        <Button className="min-h-11 rounded-full" onClick={() => last ? onComplete() : setIndex(index + 1)}>{last ? 'Finish exploring' : 'Next card'}<ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function RecallStage({ topic, revealed, setRevealed, onComplete, reduceMotion }: { topic: Topic; revealed: boolean; setRevealed: (value: boolean) => void; onComplete: () => void; reduceMotion: boolean }) {
  return (
    <div>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Answer aloud before you flip the card. Retrieval is the interaction—not rereading.</p>
      <button type="button" onClick={() => setRevealed(!revealed)} aria-pressed={revealed} className="mt-4 block min-h-64 w-full rounded-3xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" style={{ perspective: 1000 }}>
        <motion.div animate={reduceMotion ? undefined : { rotateY: revealed ? 180 : 0 }} transition={{ duration: reduceMotion ? 0 : 0.35 }} className="relative min-h-64 w-full" style={{ transformStyle: 'preserve-3d' }}>
          <div className={`absolute inset-0 flex flex-col justify-between rounded-3xl border border-primary/30 bg-gradient-to-br from-primary to-primary/75 p-6 text-primary-foreground shadow-xl ${reduceMotion && revealed ? 'hidden' : ''}`} style={{ backfaceVisibility: 'hidden' }}>
            <Brain className="h-7 w-7" /><div><p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Recall prompt</p><h4 className="mt-2 text-xl font-black sm:text-2xl">Explain {topic.title} in one sentence, then name one decision it improves.</h4></div><p className="text-sm font-bold opacity-85">Tap to reveal the self-check</p>
          </div>
          <div className={`absolute inset-0 flex flex-col justify-between rounded-3xl border border-success/30 bg-success-soft p-6 ${reduceMotion && !revealed ? 'hidden' : ''}`} style={{ backfaceVisibility: 'hidden', transform: reduceMotion ? undefined : 'rotateY(180deg)' }}>
            <CheckCircle2 className="h-7 w-7 text-success" /><div><p className="text-xs font-black uppercase tracking-[0.2em] text-success">Self-check</p><p className="mt-2 text-base leading-7">A useful answer should connect the idea to this outcome: <strong>{topic.why_it_matters}</strong></p></div><p className="text-sm font-bold text-success">Tap to see the prompt again</p>
          </div>
        </motion.div>
      </button>
      <Button className="mt-5 min-h-11 rounded-full" disabled={!revealed} onClick={onComplete}>I recalled it without notes<ArrowRight className="ml-2 h-4 w-4" /></Button>
    </div>
  );
}

function QuestionStage({ questions, empty, onOpen, icon, footer }: { questions: TopicQuestion[]; empty: string; onOpen: (slug: string) => void; icon: 'practice' | 'case'; footer: ReactNode }) {
  const Icon = icon === 'practice' ? ListChecks : BriefcaseBusiness;
  return (
    <div>
      <p className="text-sm leading-6 text-muted-foreground">Open an activity, work it through, then return to this board. Your place is saved automatically.</p>
      {questions.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{questions.map((question, index) => <button key={question.id} onClick={() => onOpen(question.slug)} className="group min-h-24 rounded-2xl border border-border bg-card p-4 text-left transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-muted-foreground">Activity {index + 1} · {question.difficulty}</span><span className="mt-1 block font-extrabold leading-snug group-hover:text-primary">{question.title}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" /></div></button>)}</div> : <p className="mt-4 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</p>}
      <div className="mt-5">{footer}</div>
    </div>
  );
}

function CheckpointStage({ isDone, hasCheckpoint, onOpen, onContinue }: { isDone: boolean; hasCheckpoint: boolean; onOpen: () => void; onContinue: () => void }) {
  if (isDone) return <div className="rounded-3xl border border-success/30 bg-success-soft p-6 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success text-success-foreground"><CheckCircle2 className="h-7 w-7" /></span><h4 className="mt-4 text-xl font-black">Checkpoint passed</h4><p className="mt-2 text-sm text-muted-foreground">This topic is complete. Your progress has been saved.</p><Button className="mt-5 min-h-11 rounded-full" onClick={onContinue}>Open my toolkit<ArrowRight className="ml-2 h-4 w-4" /></Button></div>;
  if (!hasCheckpoint) return <EmptyStage message="This topic does not have a checkpoint yet." action="Continue to toolkit" onAction={onContinue} />;
  return <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 to-card p-6 sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="h-5 w-5" /></span><h4 className="mt-4 text-xl font-black">Ready to prove it?</h4><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">One multiple-choice question closes this topic. A wrong answer does not remove anything you have earned—you can review and try again.</p><Button className="mt-5 min-h-11 rounded-full" onClick={onOpen}>Answer checkpoint<Target className="ml-2 h-4 w-4" /></Button></div>;
}

function EmptyStage({ message, action, onAction }: { message: string; action: string; onAction: () => void }) {
  return <div className="rounded-3xl border border-dashed p-8 text-center"><Circle className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">{message}</p><Button className="mt-5 min-h-11 rounded-full" onClick={onAction}>{action}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>;
}
