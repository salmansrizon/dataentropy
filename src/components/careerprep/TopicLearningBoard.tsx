import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
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
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import TopicDiagram from './TopicDiagram';
import type { Topic, TopicQuestion, TopicSection } from '@/hooks/useTopics';

type StepId = 'learn' | 'explore' | 'recall' | 'practice' | 'apply' | 'checkpoint' | 'toolkit';

type Step = { id: StepId; label: string; eyebrow: string; icon: typeof BookOpen };

interface Props {
  topic: Topic;
  sections: TopicSection[];
  practice: TopicQuestion[];
  caseStudies: TopicQuestion[];
  isDone: boolean;
  hasCheckpoint: boolean;
  toolkit: ReactNode;
  nextTopic?: { slug: string; title: string } | null;
  routeContext?: string;
  onOpenQuestion: (slug: string) => void;
  onOpenCheckpoint: () => void;
  onOpenNext: () => void;
}

const BASE_STEPS: Step[] = [
  { id: 'learn', label: 'Learn', eyebrow: 'Build the idea', icon: BookOpen },
  { id: 'explore', label: 'Explore', eyebrow: 'Read the parts in order', icon: Layers3 },
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
  routeContext,
  onOpenQuestion,
  onOpenCheckpoint,
  onOpenNext,
}: Props) {
  const steps = useMemo(() => BASE_STEPS.filter((step) => step.id !== 'apply' || caseStudies.length > 0), [caseStudies.length]);
  const [completed, setCompleted] = useState<Set<StepId>>(() => new Set(readCompleted(topic.id)));
  const [activeStep, setActiveStep] = useState(() => {
    const saved = new Set(readCompleted(topic.id));
    const firstOpen = steps.findIndex((step) => !saved.has(step.id));
    return firstOpen === -1 ? Math.max(steps.length - 1, 0) : firstOpen;
  });
  const [recallRevealed, setRecallRevealed] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const saved = new Set(readCompleted(topic.id));
    const firstOpen = steps.findIndex((step) => !saved.has(step.id));
    setCompleted(saved);
    setActiveStep(firstOpen === -1 ? Math.max(steps.length - 1, 0) : firstOpen);
    setRecallRevealed(false);
  }, [steps, topic.id]);

  useEffect(() => {
    if (!isDone || completed.has('checkpoint')) return;
    setCompleted((current) => {
      const next = new Set(current).add('checkpoint');
      window.localStorage.setItem(storageKey(topic.id), JSON.stringify([...next]));
      return next;
    });
    setActiveStep(steps.findIndex((step) => step.id === 'toolkit'));
    setAnnouncement('Checkpoint complete. Toolkit is ready.');
  }, [completed, isDone, steps, topic.id]);

  const completeStep = (id: StepId) => {
    setCompleted((current) => {
      const next = new Set(current).add(id);
      window.localStorage.setItem(storageKey(topic.id), JSON.stringify([...next]));
      return next;
    });
    const index = steps.findIndex((step) => step.id === id);
    const nextStep = steps[index + 1];
    if (nextStep) setActiveStep(index + 1);
    setAnnouncement(nextStep ? `${steps[index].label} complete. Continue with ${nextStep.label}.` : `${steps[index].label} complete.`);
  };

  const completeCount = steps.filter((step) => completed.has(step.id) || (step.id === 'checkpoint' && isDone)).length;
  const progress = Math.round((completeCount / steps.length) * 100);
  const finish = (id: StepId, label: string) => (
    <Button className="min-h-11 gap-2 rounded-full px-5" onClick={() => completeStep(id)}>
      {label}<ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
  const current = steps[activeStep] ?? steps[0];
  const currentDone = current && (completed.has(current.id) || (current.id === 'checkpoint' && isDone));

  const renderCurrentStage = () => {
    if (!current) return null;
    if (current.id === 'learn') return <LearnStage topic={topic} onComplete={() => completeStep('learn')} />;
    if (current.id === 'explore') return <ExploreStage sections={sections} onComplete={() => completeStep('explore')} />;
    if (current.id === 'recall') return <RecallStage topic={topic} revealed={recallRevealed} setRevealed={setRecallRevealed} onComplete={() => completeStep('recall')} />;
    if (current.id === 'practice') return <QuestionStage questions={practice} empty="No practice is attached yet. Continue when ready." onOpen={onOpenQuestion} icon="practice" footer={finish('practice', practice.length ? 'I finished practising' : 'Continue')} />;
    if (current.id === 'apply') return <QuestionStage questions={caseStudies} empty="No case study is attached yet. Continue when ready." onOpen={onOpenQuestion} icon="case" footer={finish('apply', 'I explored the case')} />;
    if (current.id === 'checkpoint') return <CheckpointStage isDone={isDone} hasCheckpoint={hasCheckpoint} onOpen={onOpenCheckpoint} onContinue={() => completeStep('checkpoint')} />;
    return (
      <div>
        <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="font-bold">Optional deeper reading</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Use references, resources, and questions after completing the core sequence.</p>
        </div>
        {toolkit}
        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" className="min-h-11 rounded-full" onClick={() => completeStep('toolkit')} disabled={completed.has('toolkit')}>
            {completed.has('toolkit') ? <><Check className="mr-2 h-4 w-4" />Sequence complete</> : 'Mark sequence complete'}
          </Button>
          {nextTopic ? <Button className="min-h-11 justify-between gap-3 rounded-full" onClick={onOpenNext}>Next topic: {nextTopic.title}<ArrowRight className="h-4 w-4" /></Button> : null}
        </div>
      </div>
    );
  };

  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-card" aria-labelledby="learning-board-title">
      <header className="border-b border-border/70 bg-primary/5 px-4 py-6 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Learning cockpit
            </div>
            <h2 id="learning-board-title" className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">Your next useful move</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Follow the core Topic path first. Explore deeper resources after the next action is clear.</p>
            {routeContext ? <p className="mt-3 text-sm font-bold text-primary">{routeContext}</p> : null}
          </div>
          <div className="min-w-40 rounded-2xl border border-border bg-card/80 p-3">
            <div className="mb-1.5 flex justify-between text-xs font-bold"><span>{completeCount}/{steps.length} complete</span><span>{progress}%</span></div>
            <Progress value={progress} className="h-2 w-44 max-w-full" aria-label={`${progress}% of reading sequence complete`} />
          </div>
        </div>
        <nav className="mt-6 overflow-x-auto" aria-label="Topic learning sequence">
          <ol className="flex min-w-max gap-2">
            {steps.map((step, index) => {
              const done = completed.has(step.id) || (step.id === 'checkpoint' && isDone);
              const available = done || index === activeStep;
              return (
                <li key={step.id}>
                  <button type="button" disabled={!available} onClick={() => setActiveStep(index)} aria-current={index === activeStep ? 'step' : undefined} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === activeStep ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/40'} disabled:cursor-not-allowed disabled:opacity-60`}>
                    <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${done ? 'bg-success text-success-foreground' : index === activeStep ? 'bg-primary-foreground/20' : 'bg-muted text-muted-foreground'}`}>{done ? <Check className="h-3 w-3" /> : index + 1}</span>
                    {step.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </header>

      <article className="px-4 py-7 sm:px-8 sm:py-10" aria-labelledby="current-step-title">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-sm font-black text-primary">{activeStep + 1}</span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{current?.eyebrow}</p>
              <h3 id="current-step-title" className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{current?.label}</h3>
            </div>
          </div>
          {currentDone ? <Badge className="border-0 bg-success-soft text-success-strong"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />Done</Badge> : null}
        </div>
        {renderCurrentStage()}
      </article>
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
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map(({ label, body, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary"><Icon className="h-4 w-4" />{label}</div>
            <p className="mt-3 text-base leading-7 text-foreground/90">{body}</p>
          </div>
        ))}
      </div>
      <Button className="mt-5 min-h-11 gap-2 rounded-full" onClick={onComplete}>I understand the idea<ArrowRight className="h-4 w-4" /></Button>
    </div>
  );
}

function ExploreStage({ sections, onComplete }: { sections: TopicSection[]; onComplete: () => void }) {
  if (!sections.length) return <EmptyStage message="No deep-dive sections are attached yet." action="Continue to recall" onAction={onComplete} />;
  return (
    <div>
      <div className="space-y-4">
        {sections.map((section, index) => (
          <article key={section.id} className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/30 p-5 sm:p-6">
            <div className="flex items-start gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">{index + 1}</span><div><p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{section.section_type.replaceAll('_', ' ')}</p><h4 className="mt-1 text-xl font-black">{section.title}</h4></div></div>
            <p className="mt-4 whitespace-pre-line text-base leading-7 text-foreground/90">{section.body}</p>
            {section.diagram ? <TopicDiagram spec={section.diagram} /> : null}
            {section.takeaway ? <div className="mt-5 rounded-2xl border border-primary/20 bg-card/80 p-4"><p className="text-xs font-black uppercase tracking-wider text-primary">Takeaway</p><p className="mt-1 text-sm font-semibold leading-6">{section.takeaway}</p></div> : null}
          </article>
        ))}
      </div>
      <Button className="mt-5 min-h-11 gap-2 rounded-full" onClick={onComplete}>Finish reading this section<ArrowRight className="h-4 w-4" /></Button>
    </div>
  );
}

function RecallStage({ topic, revealed, setRevealed, onComplete }: { topic: Topic; revealed: boolean; setRevealed: (value: boolean) => void; onComplete: () => void }) {
  return (
    <div>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Answer aloud before revealing the self-check.</p>
      <button type="button" onClick={() => setRevealed(!revealed)} aria-pressed={revealed} className="mt-4 block w-full rounded-3xl border border-primary/30 bg-primary/5 p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Brain className="h-7 w-7 text-primary" />
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-primary">{revealed ? 'Self-check' : 'Recall prompt'}</p>
        <p className="mt-2 text-xl font-black">{revealed ? `A useful answer connects ${topic.title} to: ${topic.why_it_matters}` : `Explain ${topic.title} in one sentence, then name one decision it improves.`}</p>
        <p className="mt-4 text-sm font-bold text-muted-foreground">{revealed ? 'Tap to hide the answer' : 'Tap to reveal the self-check'}</p>
      </button>
      <Button className="mt-5 min-h-11 rounded-full" disabled={!revealed} onClick={onComplete}>I recalled it without notes<ArrowRight className="ml-2 h-4 w-4" /></Button>
    </div>
  );
}

function QuestionStage({ questions, empty, onOpen, icon, footer }: { questions: TopicQuestion[]; empty: string; onOpen: (slug: string) => void; icon: 'practice' | 'case'; footer: ReactNode }) {
  const Icon = icon === 'practice' ? ListChecks : BriefcaseBusiness;
  return (
    <div>
      <p className="text-sm leading-6 text-muted-foreground">Open an activity, work it through, then return to this reading sequence.</p>
      {questions.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{questions.map((question, index) => <button key={question.id} onClick={() => onOpen(question.slug)} className="group min-h-24 rounded-2xl border border-border bg-card p-4 text-left transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-muted-foreground">Activity {index + 1} · {question.difficulty}</span><span className="mt-1 block font-extrabold leading-snug group-hover:text-primary">{question.title}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" /></div></button>)}</div> : <p className="mt-4 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</p>}
      <div className="mt-5">{footer}</div>
    </div>
  );
}

function CheckpointStage({ isDone, hasCheckpoint, onOpen, onContinue }: { isDone: boolean; hasCheckpoint: boolean; onOpen: () => void; onContinue: () => void }) {
  if (isDone) return <div className="rounded-3xl border border-success/30 bg-success-soft p-6 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success text-success-foreground"><CheckCircle2 className="h-7 w-7" /></span><h4 className="mt-4 text-xl font-black">Checkpoint passed</h4><p className="mt-2 text-sm text-muted-foreground">This topic is complete. Your progress has been saved.</p><Button className="mt-5 min-h-11 rounded-full" onClick={onContinue}>Continue to toolkit<ArrowRight className="ml-2 h-4 w-4" /></Button></div>;
  if (!hasCheckpoint) return <EmptyStage message="This topic does not have a checkpoint yet." action="Continue to toolkit" onAction={onContinue} />;
  return <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 to-card p-6 sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="h-5 w-5" /></span><h4 className="mt-4 text-xl font-black">Ready to prove it?</h4><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">One multiple-choice question closes this topic. A wrong answer does not remove anything you have earned—you can review and try again.</p><Button className="mt-5 min-h-11 rounded-full" onClick={onOpen}>Answer checkpoint<Target className="ml-2 h-4 w-4" /></Button></div>;
}

function EmptyStage({ message, action, onAction }: { message: string; action: string; onAction: () => void }) {
  return <div className="rounded-3xl border border-dashed p-8 text-center"><Circle className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">{message}</p><Button className="mt-5 min-h-11 rounded-full" onClick={onAction}>{action}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>;
}
