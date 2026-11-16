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
import { motion, useReducedMotion } from 'framer-motion';
import { useT, useLang } from '@/i18n/lang';
import { RevealGroup, RevealItem } from '@/pages/course-details/motion';
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

const T = {
  en: {
    steps: {
      learn: ['Learn', 'Build the idea'], explore: ['Explore', 'Read the parts in order'], recall: ['Recall', 'Retrieve from memory'],
      practice: ['Practise', 'Try it yourself'], apply: ['Apply', 'Use it in context'], checkpoint: ['Checkpoint', 'Prove your understanding'], toolkit: ['Toolkit', 'Go deeper'],
    } as Record<string, string[]>,
    cockpit: 'Learning cockpit', nextMove: 'Your next useful move',
    followCore: 'Follow the core Topic path first. Explore deeper resources after the next action is clear.',
    complete: (d: string, t: string) => `${d}/${t} complete`, seqAria: (p: string) => `${p}% of reading sequence complete`,
    navAria: 'Topic learning sequence', done: 'Done',
    checkpointDone: 'Checkpoint complete. Toolkit is ready.',
    stepDone: (l: string) => `${l} complete.`, stepDoneNext: (l: string, n: string) => `${l} complete. Continue with ${n}.`,
    emptyPractice: 'No practice is attached yet. Continue when ready.', emptyCase: 'No case study is attached yet. Continue when ready.',
    finishedPractising: 'I finished practising', continue: 'Continue', exploredCase: 'I explored the case',
    optReading: 'Optional deeper reading', optReadingBody: 'Use references, resources, and questions after completing the core sequence.',
    seqComplete: 'Sequence complete', markSeq: 'Mark sequence complete', nextTopic: 'Next topic: ',
    what: 'What it is', why: 'Why it matters', how: 'How it works', plain: 'In plain terms', understand: 'I understand the idea',
    noSections: 'No deep-dive sections are attached yet.', toRecall: 'Continue to recall', takeaway: 'Takeaway', finishReading: 'Finish reading this section',
    recallIntro: 'Answer aloud before revealing the self-check.', selfCheck: 'Self-check', recallPrompt: 'Recall prompt',
    answerFn: (title: string, why: string) => `A useful answer connects ${title} to: ${why}`,
    promptFn: (title: string) => `Explain ${title} in one sentence, then name one decision it improves.`,
    tapHide: 'Tap to hide the answer', tapReveal: 'Tap to reveal the self-check', recalled: 'I recalled it without notes',
    openActivity: 'Open an activity, work it through, then return to this reading sequence.', activity: (n: string, d: string) => `Activity ${n} · ${d}`,
    cpPassed: 'Checkpoint passed', cpPassedBody: 'This topic is complete. Your progress has been saved.', toToolkit: 'Continue to toolkit',
    noCp: 'This topic does not have a checkpoint yet.', ready: 'Ready to prove it?',
    cpBody: 'One multiple-choice question closes this topic. A wrong answer does not remove anything you have earned—you can review and try again.', answerCp: 'Answer checkpoint',
  },
  bn: {
    steps: {
      learn: ['শিখুন', 'ধারণাটি গড়ে তুলুন'], explore: ['এক্সপ্লোর', 'অংশগুলো ক্রমানুসারে পড়ুন'], recall: ['রিকল', 'মনে করার চেষ্টা করুন'],
      practice: ['প্র্যাকটিস', 'নিজে করে দেখুন'], apply: ['অ্যাপ্লাই', 'বাস্তব প্রেক্ষাপটে কাজে লাগান'], checkpoint: ['চেকপয়েন্ট', 'বোঝাপড়া যাচাই করুন'], toolkit: ['টুলকিট', 'আরও গভীরে যান'],
    },
    cockpit: 'লার্নিং ককপিট', nextMove: 'আপনার পরবর্তী কাজের ধাপ',
    followCore: 'আগে মূল টপিক-পথ অনুসরণ করুন। পরবর্তী ধাপ পরিষ্কার হলে আরও গভীর রিসোর্স দেখুন।',
    complete: (d: string, t: string) => `${t}টির মধ্যে ${d}টি সম্পন্ন`, seqAria: (p: string) => `পড়ার ধারাবাহিকতার ${p}% সম্পন্ন`,
    navAria: 'টপিক শেখার ধারা', done: 'সম্পন্ন',
    checkpointDone: 'চেকপয়েন্ট সম্পন্ন। টুলকিট প্রস্তুত।',
    stepDone: (l: string) => `${l} সম্পন্ন।`, stepDoneNext: (l: string, n: string) => `${l} সম্পন্ন। এবার ${n} করুন।`,
    emptyPractice: 'এখনও কোনো প্র্যাকটিস যুক্ত হয়নি। প্রস্তুত হলে এগিয়ে যান।', emptyCase: 'এখনও কোনো কেস স্টাডি যুক্ত হয়নি। প্রস্তুত হলে এগিয়ে যান।',
    finishedPractising: 'আমার প্র্যাকটিস শেষ', continue: 'এগিয়ে যান', exploredCase: 'কেসটি দেখেছি',
    optReading: 'ঐচ্ছিক গভীর পড়া', optReadingBody: 'মূল ধারা শেষ করার পর রেফারেন্স, রিসোর্স ও প্রশ্ন ব্যবহার করুন।',
    seqComplete: 'ধারা সম্পন্ন', markSeq: 'ধারা সম্পন্ন হিসেবে চিহ্নিত করুন', nextTopic: 'পরবর্তী টপিক: ',
    what: 'এটি কী', why: 'কেন গুরুত্বপূর্ণ', how: 'কীভাবে কাজ করে', plain: 'সহজ ভাষায়', understand: 'ধারণাটি বুঝেছি',
    noSections: 'এখনও কোনো বিস্তারিত অংশ যুক্ত হয়নি।', toRecall: 'রিকলে যান', takeaway: 'মূল কথা', finishReading: 'এই অংশের পড়া শেষ',
    recallIntro: 'সেলফ-চেক দেখার আগে মুখে উত্তর বলার চেষ্টা করুন।', selfCheck: 'সেলফ-চেক', recallPrompt: 'রিকল প্রম্পট',
    answerFn: (title: string, why: string) => `একটি ভালো উত্তর ${title}-কে এর সঙ্গে যুক্ত করে: ${why}`,
    promptFn: (title: string) => `${title} এক বাক্যে ব্যাখ্যা করুন, তারপর এটি কোন একটি সিদ্ধান্ত উন্নত করে তা বলুন।`,
    tapHide: 'উত্তর লুকাতে ট্যাপ করুন', tapReveal: 'সেলফ-চেক দেখতে ট্যাপ করুন', recalled: 'নোট না দেখেই মনে করতে পেরেছি',
    openActivity: 'একটি অ্যাক্টিভিটি খুলুন, সমাধান করুন, তারপর এই পড়ার ধারায় ফিরে আসুন।', activity: (n: string, d: string) => `অ্যাক্টিভিটি ${n} · ${d}`,
    cpPassed: 'চেকপয়েন্টে পাস', cpPassedBody: 'এই টপিক সম্পন্ন। আপনার অগ্রগতি সংরক্ষিত হয়েছে।', toToolkit: 'টুলকিটে যান',
    noCp: 'এই টপিকের এখনও কোনো চেকপয়েন্ট নেই।', ready: 'যাচাই করতে প্রস্তুত?',
    cpBody: 'একটি MCQ দিয়ে এই টপিক শেষ হয়। ভুল উত্তর দিলে অর্জিত কিছুই হারাবে না—রিভিউ করে আবার চেষ্টা করতে পারবেন।', answerCp: 'চেকপয়েন্টের উত্তর দিন',
  },
};

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
  const t = useT(T);
  const { num } = useLang();
  const reduce = useReducedMotion();
  const label = (id: string) => t.steps[id]?.[0] ?? id;
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
    setAnnouncement(t.checkpointDone);
  }, [completed, isDone, steps, topic.id, t]);

  const completeStep = (id: StepId) => {
    setCompleted((current) => {
      const next = new Set(current).add(id);
      window.localStorage.setItem(storageKey(topic.id), JSON.stringify([...next]));
      return next;
    });
    const index = steps.findIndex((step) => step.id === id);
    const nextStep = steps[index + 1];
    if (nextStep) setActiveStep(index + 1);
    setAnnouncement(nextStep ? t.stepDoneNext(label(id), label(nextStep.id)) : t.stepDone(label(id)));
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
    if (current.id === 'practice') return <QuestionStage questions={practice} empty={t.emptyPractice} onOpen={onOpenQuestion} icon="practice" footer={finish('practice', practice.length ? t.finishedPractising : t.continue)} />;
    if (current.id === 'apply') return <QuestionStage questions={caseStudies} empty={t.emptyCase} onOpen={onOpenQuestion} icon="case" footer={finish('apply', t.exploredCase)} />;
    if (current.id === 'checkpoint') return <CheckpointStage isDone={isDone} hasCheckpoint={hasCheckpoint} onOpen={onOpenCheckpoint} onContinue={() => completeStep('checkpoint')} />;
    return (
      <div>
        <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="font-bold">{t.optReading}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.optReadingBody}</p>
        </div>
        {toolkit}
        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" className="min-h-11 rounded-full" onClick={() => completeStep('toolkit')} disabled={completed.has('toolkit')}>
            {completed.has('toolkit') ? <><Check className="mr-2 h-4 w-4" />{t.seqComplete}</> : t.markSeq}
          </Button>
          {nextTopic ? <Button className="min-h-11 justify-between gap-3 rounded-full" onClick={onOpenNext}>{t.nextTopic}{nextTopic.title}<ArrowRight className="h-4 w-4" /></Button> : null}
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
              <Sparkles className="h-4 w-4" aria-hidden="true" /> {t.cockpit}
            </div>
            <h2 id="learning-board-title" className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">{t.nextMove}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t.followCore}</p>
            {routeContext ? <p className="mt-3 text-sm font-bold text-primary">{routeContext}</p> : null}
          </div>
          <div className="min-w-40 rounded-2xl border border-border bg-card/80 p-3">
            <div className="mb-1.5 flex justify-between text-xs font-bold"><span>{t.complete(num(completeCount), num(steps.length))}</span><span>{num(progress)}%</span></div>
            <Progress value={progress} className="h-2 w-44 max-w-full" aria-label={t.seqAria(String(progress))} />
          </div>
        </div>
        <nav className="mt-6 overflow-x-auto" aria-label={t.navAria}>
          <ol className="flex min-w-max gap-2">
            {steps.map((step, index) => {
              const done = completed.has(step.id) || (step.id === 'checkpoint' && isDone);
              const available = done || index === activeStep;
              return (
                <li key={step.id}>
                  <button type="button" disabled={!available} onClick={() => setActiveStep(index)} aria-current={index === activeStep ? 'step' : undefined} className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${index === activeStep ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary/40'} disabled:cursor-not-allowed disabled:opacity-60`}>
                    <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${done ? 'bg-success text-success-foreground' : index === activeStep ? 'bg-primary-foreground/20' : 'bg-muted text-muted-foreground'}`}>{done ? <Check className="h-3 w-3" /> : index + 1}</span>
                    {label(step.id)}
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
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{current ? t.steps[current.id]?.[1] : ''}</p>
              <h3 id="current-step-title" className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">{current ? label(current.id) : ''}</h3>
            </div>
          </div>
          {currentDone ? <Badge className="border-0 bg-success-soft text-success-strong"><CheckCircle2 className="mr-1 h-3.5 w-3.5" />{t.done}</Badge> : null}
        </div>
        <motion.div key={current?.id} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
          {renderCurrentStage()}
        </motion.div>
      </article>
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </section>
  );
}

function LearnStage({ topic, onComplete }: { topic: Topic; onComplete: () => void }) {
  const t = useT(T);
  const cards = [
    { label: t.what, body: topic.what_it_is, icon: Lightbulb },
    { label: t.why, body: topic.why_it_matters, icon: Target },
    { label: t.how, body: topic.how_it_works, icon: Layers3 },
    { label: t.plain, body: topic.analogy, icon: Sparkles },
  ];
  return (
    <div>
      <RevealGroup className="grid gap-3 sm:grid-cols-2">
        {cards.map(({ label, body, icon: Icon }) => (
          <RevealItem key={label} className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-primary"><Icon className="h-4 w-4" />{label}</div>
            <p className="mt-3 text-base leading-7 text-foreground/90">{body}</p>
          </RevealItem>
        ))}
      </RevealGroup>
      <Button className="mt-5 min-h-11 gap-2 rounded-full" onClick={onComplete}>{t.understand}<ArrowRight className="h-4 w-4" /></Button>
    </div>
  );
}

function ExploreStage({ sections, onComplete }: { sections: TopicSection[]; onComplete: () => void }) {
  const t = useT(T);
  if (!sections.length) return <EmptyStage message={t.noSections} action={t.toRecall} onAction={onComplete} />;
  return (
    <div>
      <div className="space-y-4">
        {sections.map((section, index) => (
          <article key={section.id} className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/30 p-5 sm:p-6">
            <div className="flex items-start gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">{index + 1}</span><div><p className="text-xs font-black uppercase tracking-[0.16em] text-primary">{section.section_type.replaceAll('_', ' ')}</p><h4 className="mt-1 text-xl font-black">{section.title}</h4></div></div>
            <p className="mt-4 whitespace-pre-line text-base leading-7 text-foreground/90">{section.body}</p>
            {section.diagram ? <TopicDiagram spec={section.diagram} /> : null}
            {section.takeaway ? <div className="mt-5 rounded-2xl border border-primary/20 bg-card/80 p-4"><p className="text-xs font-black uppercase tracking-wider text-primary">{t.takeaway}</p><p className="mt-1 text-sm font-semibold leading-6">{section.takeaway}</p></div> : null}
          </article>
        ))}
      </div>
      <Button className="mt-5 min-h-11 gap-2 rounded-full" onClick={onComplete}>{t.finishReading}<ArrowRight className="h-4 w-4" /></Button>
    </div>
  );
}

function RecallStage({ topic, revealed, setRevealed, onComplete }: { topic: Topic; revealed: boolean; setRevealed: (value: boolean) => void; onComplete: () => void }) {
  const t = useT(T);
  return (
    <div>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{t.recallIntro}</p>
      <button type="button" onClick={() => setRevealed(!revealed)} aria-pressed={revealed} className="mt-4 block w-full rounded-3xl border border-primary/30 bg-primary/5 p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Brain className="h-7 w-7 text-primary" />
        <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-primary">{revealed ? t.selfCheck : t.recallPrompt}</p>
        <p className="mt-2 text-xl font-black">{revealed ? t.answerFn(topic.title, topic.why_it_matters) : t.promptFn(topic.title)}</p>
        <p className="mt-4 text-sm font-bold text-muted-foreground">{revealed ? t.tapHide : t.tapReveal}</p>
      </button>
      <Button className="mt-5 min-h-11 rounded-full" disabled={!revealed} onClick={onComplete}>{t.recalled}<ArrowRight className="ml-2 h-4 w-4" /></Button>
    </div>
  );
}

function QuestionStage({ questions, empty, onOpen, icon, footer }: { questions: TopicQuestion[]; empty: string; onOpen: (slug: string) => void; icon: 'practice' | 'case'; footer: ReactNode }) {
  const t = useT(T);
  const { num } = useLang();
  const Icon = icon === 'practice' ? ListChecks : BriefcaseBusiness;
  return (
    <div>
      <p className="text-sm leading-6 text-muted-foreground">{t.openActivity}</p>
      {questions.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{questions.map((question, index) => <button key={question.id} onClick={() => onOpen(question.slug)} className="group min-h-24 rounded-2xl border border-border bg-card p-4 text-left transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-muted-foreground">{t.activity(num(index + 1), question.difficulty)}</span><span className="mt-1 block font-extrabold leading-snug group-hover:text-primary">{question.title}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" /></div></button>)}</div> : <p className="mt-4 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</p>}
      <div className="mt-5">{footer}</div>
    </div>
  );
}

function CheckpointStage({ isDone, hasCheckpoint, onOpen, onContinue }: { isDone: boolean; hasCheckpoint: boolean; onOpen: () => void; onContinue: () => void }) {
  const t = useT(T);
  if (isDone) return <div className="rounded-3xl border border-success/30 bg-success-soft p-6 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success text-success-foreground"><CheckCircle2 className="h-7 w-7" /></span><h4 className="mt-4 text-xl font-black">{t.cpPassed}</h4><p className="mt-2 text-sm text-muted-foreground">{t.cpPassedBody}</p><Button className="mt-5 min-h-11 rounded-full" onClick={onContinue}>{t.toToolkit}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>;
  if (!hasCheckpoint) return <EmptyStage message={t.noCp} action={t.toToolkit} onAction={onContinue} />;
  return <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 to-card p-6 sm:p-8"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground"><LockKeyhole className="h-5 w-5" /></span><h4 className="mt-4 text-xl font-black">{t.ready}</h4><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{t.cpBody}</p><Button className="mt-5 min-h-11 rounded-full" onClick={onOpen}>{t.answerCp}<Target className="ml-2 h-4 w-4" /></Button></div>;
}

function EmptyStage({ message, action, onAction }: { message: string; action: string; onAction: () => void }) {
  return <div className="rounded-3xl border border-dashed p-8 text-center"><Circle className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">{message}</p><Button className="mt-5 min-h-11 rounded-full" onClick={onAction}>{action}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>;
}
