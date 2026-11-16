import * as React from 'react';
const { useState, useEffect, useRef, useCallback, useMemo } = React;
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useLang, useT } from '@/i18n/lang';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  ChevronLeft, 
  Database, 
  Layout, 
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles,
  Trophy,
  Share2,
  Timer,
  Award,
  Star,
  BookOpen,
  RotateCcw,
  XCircle,
  Info,
  History,
  Lightbulb
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toPng } from 'html-to-image';
import { useQuestion, useSubmitCode, useSubmissions } from '@/hooks/useCareerPrep';
import Navbar from '@/components/Navbar';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from 'next-themes';
import { defineCustomThemes } from '@/design-system/monacoTheme';
import { useToast } from '@/hooks/use-toast';
import { useMissionRunner } from './sql-challenge/modules/MissionRunner';
import { useQueryExecutor } from './sql-challenge/modules/QueryExecutor';
import { useTimerController } from './sql-challenge/modules/TimerController';
import { useResultRenderer } from './sql-challenge/modules/ResultRenderer';
import { bootPGlite, getPGliteInstance } from './sql-challenge/modules/PGliteEngine';
import { validateSubmission } from './sql-challenge/modules/SubmissionValidator';
import { getHintEscalationState } from './sql-challenge/modules/HintEscalation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuestionTopics } from '@/hooks/useTopics';
import TopicCard from '@/components/careerprep/TopicCard';
import { track, trackOnce } from '@/services/funnel';
import { recordReviewResult } from '@/services/reviewSchedule';
import { recordLearningActivity } from '@/services/learningActivity';
import { explainFailedAttempt, type LearningFeedback } from '@/domain/learningFeedback';

const T = {
  en: {
    timeUp: 'Time Up!', timeUpDesc: 'Finalizing current step.',
    envNote: 'Environment Note', envNoteDesc: 'Database state might be inherited from previous step.',
    pyStarter: '# Define the requested function here\n',
    sqlStarter: '-- Write your SQL query here\n',
    stepOk: 'Step Verified', stepOkDesc: 'Proceeding to next mission step.',
    cleared: 'Challenge Cleared', clearedDesc: 'Perfect solution provided!',
    missionComplete: 'Mission Complete', finalized: 'Finalized ',
    xp: 'XP', time: 'Time', score: 'Score', breakdown: 'Breakdown', elite: 'ELITE', weight: 'Weight: ',
    done: 'Done', snapshot: 'Snapshot', success: 'Success', snapSaved: 'Snapshot saved!', retryFailed: 'Retry Failed Steps',
    tabs: { description: 'description', schema: 'schema', topic: 'topic', submission: 'submission' },
    stdEnv: 'Standard environment.',
    policy: 'Submission Policy',
    policyIntro: 'Your query will be validated by executing it against our test database and comparing the result set with the expected solution. Both result sets are sorted and stringified before comparison — ',
    policyBold: 'row order does not matter', policyEnd: '.',
    p1: 'Each failed attempt reveals a progressive hint (if available).',
    p2: 'The full solution is revealed after 5 failed attempts.',
    p3a: 'Every attempt is recorded, but only ', p3b: 'correct', p3c: ' submissions earn XP.',
    p4: 'Your output must match the expected columns and data exactly.',
    history: 'Submission History', accepted: 'ACCEPTED', failed: 'FAILED', noSubs: 'No submissions yet for this question.',
    briefing: 'Mission Briefing', decision: 'Decision Logic Required', selectSolution: 'Select Solution',
    terminal: 'Terminal', run: 'Run', stdout: 'STDOUT', noOutput: '(no output)', ret: 'return: ', awaiting: 'Awaiting Instructions',
    step: 'Mission Step ', level1: 'LEVEL 1', submit: 'Submit',
    panes: { problem: 'problem', code: 'code', output: 'output' },
    failedTitle: 'Mission Failed',
    failedDesc: "Your solution doesn't match the expected output. Review your query and try again — the attempt is recorded, but no XP is deducted.",
    nextClue: 'Next clue: ', reviewTopic: 'Review the exact Topic section',
    solutionRevealed: 'Solution Revealed', correct: 'Correct: ',
    noHints: (n: number, nn: string) => `No hints available. Solution reveals after ${nn} more attempt${n !== 1 ? 's' : ''}.`,
    hintsUnlocked: (a: string, b: string, n: number) => `${a}/${b} Hint${n !== 1 ? 's' : ''} Unlocked`,
    nextHint: (n: number, nn: string) => `Next hint unlocks after ${nn} more failed attempt${n !== 1 ? 's' : ''}`,
    hintSoon: 'Hint unlocks after 1 more failed attempt', retry: 'Retry',
  },
  bn: {
    timeUp: 'সময় শেষ!', timeUpDesc: 'বর্তমান ধাপ শেষ করা হচ্ছে।',
    envNote: 'পরিবেশ নোট', envNoteDesc: 'আগের ধাপের ডেটাবেস অবস্থা থেকে যেতে পারে।',
    pyStarter: '# এখানে প্রয়োজনীয় ফাংশনটি লিখুন\n',
    sqlStarter: '-- এখানে আপনার SQL কোয়েরি লিখুন\n',
    stepOk: 'ধাপ যাচাই হয়েছে', stepOkDesc: 'পরবর্তী মিশন ধাপে যাচ্ছি।',
    cleared: 'চ্যালেঞ্জ সম্পন্ন', clearedDesc: 'নিখুঁত সমাধান!',
    missionComplete: 'মিশন সম্পন্ন', finalized: 'শেষ হয়েছে: ',
    xp: 'XP', time: 'সময়', score: 'স্কোর', breakdown: 'ধাপভিত্তিক ফল', elite: 'এলিট', weight: 'ওজন: ',
    done: 'সম্পন্ন', snapshot: 'স্ন্যাপশট', success: 'সফল', snapSaved: 'স্ন্যাপশট সেভ হয়েছে!', retryFailed: 'ব্যর্থ ধাপগুলো আবার করুন',
    tabs: { description: 'সমস্যা', schema: 'স্কিমা', topic: 'টপিক', submission: 'সাবমিশন' },
    stdEnv: 'স্ট্যান্ডার্ড পরিবেশ।',
    policy: 'সাবমিশন নীতি',
    policyIntro: 'আপনার কোয়েরি আমাদের টেস্ট ডেটাবেসে চালিয়ে ফলাফলকে প্রত্যাশিত সমাধানের সাথে মিলিয়ে যাচাই করা হবে। তুলনার আগে দুটি ফলাফলই সাজিয়ে স্ট্রিং করা হয় — ',
    policyBold: 'সারির ক্রম গুরুত্বপূর্ণ নয়', policyEnd: '।',
    p1: 'প্রতিটি ভুল চেষ্টায় ধাপে ধাপে একটি হিন্ট দেখানো হয় (থাকলে)।',
    p2: '৫টি ভুল চেষ্টার পর পূর্ণ সমাধান দেখানো হয়।',
    p3a: 'প্রতিটি চেষ্টা রেকর্ড হয়, তবে শুধু ', p3b: 'সঠিক', p3c: ' সাবমিশনেই XP পাওয়া যায়।',
    p4: 'আপনার আউটপুটের কলাম ও ডেটা প্রত্যাশিতের সাথে হুবহু মিলতে হবে।',
    history: 'সাবমিশন ইতিহাস', accepted: 'গৃহীত', failed: 'ব্যর্থ', noSubs: 'এই প্রশ্নে এখনো কোনো সাবমিশন নেই।',
    briefing: 'মিশন ব্রিফিং', decision: 'সিদ্ধান্তমূলক যুক্তি দরকার', selectSolution: 'সমাধান বেছে নিন',
    terminal: 'টার্মিনাল', run: 'চালান', stdout: 'STDOUT', noOutput: '(কোনো আউটপুট নেই)', ret: 'return: ', awaiting: 'নির্দেশনার অপেক্ষায়',
    step: 'মিশন ধাপ ', level1: 'লেভেল ১', submit: 'সাবমিট',
    panes: { problem: 'সমস্যা', code: 'কোড', output: 'আউটপুট' },
    failedTitle: 'মিশন ব্যর্থ',
    failedDesc: 'আপনার সমাধান প্রত্যাশিত আউটপুটের সাথে মেলেনি। কোয়েরিটি দেখে আবার চেষ্টা করুন — চেষ্টাটি রেকর্ড হয়েছে, তবে XP কাটা হয়নি।',
    nextClue: 'পরবর্তী ইঙ্গিত: ', reviewTopic: 'টপিকের সংশ্লিষ্ট অংশটি দেখুন',
    solutionRevealed: 'সমাধান দেখানো হয়েছে', correct: 'সঠিক: ',
    noHints: (_n: number, nn: string) => `কোনো হিন্ট নেই। আরও ${nn}টি চেষ্টার পর সমাধান দেখানো হবে।`,
    hintsUnlocked: (a: string, b: string) => `${a}/${b}টি হিন্ট আনলক হয়েছে`,
    nextHint: (_n: number, nn: string) => `আরও ${nn}টি ভুল চেষ্টার পর পরবর্তী হিন্ট আনলক হবে`,
    hintSoon: 'আরও ১টি ভুল চেষ্টার পর হিন্ট আনলক হবে', retry: 'আবার চেষ্টা',
  },
};

// ── Performance Memoization ──────────────────────────────────────────────
const MemoizedMarkdown = React.memo(({ content }: { content: string }) => (
  <div className="prose prose-sm max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-table:text-sm prose-th:bg-muted/50 prose-th:p-3 prose-td:p-3 prose-h1:text-xl prose-h1:font-black prose-h2:text-lg prose-h2:font-black prose-h3:text-base prose-h3:font-bold prose-strong:text-foreground prose-headings:text-foreground prose-a:text-primary text-muted-foreground whitespace-pre-wrap leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
));
MemoizedMarkdown.displayName = 'MemoizedMarkdown';

const MemoizedNavbar = React.memo(Navbar);
MemoizedNavbar.displayName = 'MemoizedNavbar';

const SQLChallenge = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const t = useT(T);
  const { lang, num } = useLang();
  const { question, children, loading: qLoading } = useQuestion(slug || '');
  const { logSubmission, isSubmitting } = useSubmitCode();

  // ── Mission State (from useMissionRunner hook) ───────────────────────────
  const { missionQueue, cursorIdx, isMissionComplete, currentQuestion, advanceMission, resetMission } = useMissionRunner(question, children);
  const currentQ = currentQuestion || question;
  const { topics } = useQuestionTopics(currentQ?.id);

  // ── Database / Execution State ───────────────────────────────────────────
  const { submissions, loading: sLoading, refresh: refreshSubmissions } = useSubmissions(currentQ?.id || '');
  const [code, setCode] = useState('');
  const [mcqAnswer, setMcqAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'booting' | 'seeding' | 'ready' | 'error'>('idle');

  // Use extracted modules
  const { execute, executePython, isExecuting, results: queryResult } = useQueryExecutor();
  const { timeLeft, totalMistakes, formatTime, recordMistake, getTimeTaken } = useTimerController(question?.time_limit_secs);
  const { missionResults, recordMissionResults, shareResults, downloadShareImage, setShowShareDialog } = useResultRenderer();
  const [activeTab, setActiveTab] = useState<'description' | 'schema' | 'topic' | 'submission'>('description');
  const [mobilePane, setMobilePane] = useState<'problem' | 'code' | 'output'>('problem');
  const resultsRef = useRef<HTMLDivElement>(null);

  // ── Timer & Metrics ───────────────────────────────────────────────────
  const missionStartTime = useRef<number>(Date.now());

  const [stepResults, setStepResults] = useState<Record<number, boolean>>({});
  const [showFailedDialog, setShowFailedDialog] = useState(false);
  const [failCount, setFailCount] = useState<Record<number, number>>({});
  const [lastFeedback, setLastFeedback] = useState<LearningFeedback | null>(null);

  // Mission queue building and timer initialization are owned by
  // useMissionRunner/useTimerController's own effects (watching question/children
  // and question?.time_limit_secs respectively) — only the per-mission-load
  // bookkeeping specific to this page lives here.
  useEffect(() => {
    if (!qLoading && question) {
      setStepResults({});
      missionStartTime.current = Date.now();
    }
  }, [qLoading, question]);

  // Countdown itself is owned by useTimerController; this only reacts once time runs out.
  useEffect(() => {
    if (timeLeft === 0 && !isMissionComplete && status === 'ready') {
      toast({ title: t.timeUp, description: t.timeUpDesc, variant: 'destructive' });
      setStepResults(prev => ({ ...prev, [cursorIdx]: false }));
      advanceMission();
    }
  }, [timeLeft, isMissionComplete, status]);

  useEffect(() => {
    const seed = async () => {
      if (!currentQ || currentQ.question_type === 'mcq') {
        if (currentQ?.question_type === 'mcq') setStatus('ready');
        return;
      }

      if (currentQ.language === 'python') {
        setCode(t.pyStarter);
        setStatus('ready');
        return;
      }

      setStatus('seeding');
      try {
        await bootPGlite(currentQ.schema_sql || '', currentQ.initial_sql || '');
        const tableName = extractFirstTable(currentQ.schema_sql || 'your_table');
        setCode(`${t.sqlStarter}SELECT * FROM ${tableName};`);
        setStatus('ready');
      } catch (err: any) {
        console.warn('Seeding warning:', err);
        // If it's just a duplicate key/table error, we can still proceed if the tables exist
        if (err.message?.includes('already exists') || err.message?.includes('duplicate key')) {
          setStatus('ready');
        } else {
          setStatus('ready'); // Still mark as ready so user can try to fix SQL
          toast({ title: t.envNote, description: t.envNoteDesc, variant: 'default' });
        }
      }
    };
    seed();
  }, [currentQ?.id]);

  const handleRun = useCallback(() => {
    if (!code.trim()) return;
    if (currentQ?.language === 'python') executePython(code);
    else execute(code);
    // On a phone the result lands in a pane that is not on screen.
    setMobilePane('output');
  }, [code, currentQ?.language, execute, executePython]);

  const [attemptsRecord, setAttemptsRecord] = useState<Record<number, number>>({});

  const handleAdvance = () => {
    if (cursorIdx < missionQueue.length - 1) {
      advanceMission();
      setActiveTab('description');
      setMcqAnswer(null);
    } else {
      const timeTaken = Math.floor((Date.now() - missionStartTime.current) / 1000);
      const correctSteps = missionQueue.filter((_, idx) => stepResults[idx]).length;

      recordMissionResults(correctSteps, missionQueue.length, timeTaken, totalMistakes);
      advanceMission();
    }
  };

  const handleSubmit = async () => {
    if (!currentQ) return;
    const pg = getPGliteInstance();
    const isMultiStep = missionQueue.length > 1;
    const isCorrect = await validateSubmission(pg, code, currentQ, mcqAnswer);
    let expectedRows: number | undefined;
    let actualRows: number | undefined;
    let executionError: string | undefined;
    if (pg && currentQ.language !== 'python' && currentQ.question_type !== 'mcq' && currentQ.solution_sql) {
      try { expectedRows = (await pg.query(currentQ.solution_sql)).rows.length; } catch { expectedRows = undefined; }
      try { actualRows = (await pg.query(code)).rows.length; } catch (error) { executionError = error instanceof Error ? error.message : 'The query could not run.'; }
    }

    const currentIdx = cursorIdx;

    // Log every submission, pass or fail. Streak, XP, success rate and the
    // struggle trigger all derive from this table, so a failure that never
    // lands is a failure that never happened.
    await logSubmission(
      currentQ.id,
      currentQ.question_type === 'mcq' ? `Choice: ${mcqAnswer}` : code,
      isCorrect,
      queryResult?.executionTime || 0,
    );

    refreshSubmissions();

    void track({
      event: 'attempt_submitted',
      surface: 'workspace',
      subjectType: 'question',
      subjectId: currentQ.id,
      metadata: { correct: isCorrect, difficulty: currentQ.difficulty, industry: currentQ.industry, hint_level: failCount[currentIdx] ?? 0 },
    });
    void recordLearningActivity({ type: 'attempt', subjectId: currentQ.id, successful: isCorrect, durationSeconds: getTimeTaken(), metadata: { hint_level: failCount[currentIdx] ?? 0, difficulty: currentQ.difficulty } });
    if (!isCorrect) {
      void track({ event: 'struggled', surface: 'workspace', subjectType: 'question', subjectId: currentQ.id });
    }
    const review = await recordReviewResult({
        questionId: currentQ.id,
        slug: currentQ.slug,
        title: currentQ.title,
        industry: currentQ.industry ?? 'Data skills',
        difficulty: currentQ.difficulty ?? 'Mixed',
      }, isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) {
      if (review.scheduled) void track({
          event: review.wasDue ? 'review_completed' : 'review_scheduled',
          surface: 'workspace',
          subjectType: 'question',
          subjectId: currentQ.id,
          metadata: { next_due_at: review.nextDueAt },
        });
      // First success is the funnel's conversion moment — count it once.
      void trackOnce('solved', { event: 'solved', surface: 'workspace', subjectType: 'question', subjectId: currentQ.id });
      void track({ event: 'learning_item_completed', surface: 'workspace', subjectType: 'question', subjectId: currentQ.id, metadata: { next_due_at: review.nextDueAt } });
      if (review.wasDue) void recordLearningActivity({ type: 'review', subjectId: currentQ.id, successful: true });
      setLastFeedback(null);
    } else {
      setLastFeedback(explainFailedAttempt({ sql: code, actualRows, expectedRows, errorMessage: executionError }));
    }

    if (isCorrect) {
      setStepResults(prev => ({ ...prev, [currentIdx]: true }));
      
      if (isMultiStep) {
        toast({ title: t.stepOk, description: t.stepOkDesc });
        handleAdvance();
      } else {
        toast({ title: t.cleared, description: t.clearedDesc });
        handleAdvance();
      }
    } else {
      // Increment fail count and show Mission Failed dialog
      recordMistake();
      setFailCount(prev => ({ ...prev, [currentIdx]: (prev[currentIdx] || 0) + 1 }));
      setShowFailedDialog(true);
    }
  };

  if (qLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-background"><Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" /></div>
  );

  if (isMissionComplete) return (
    <MotionConfig reducedMotion="user">
    <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground p-8 relative overflow-hidden">
       <div className="absolute inset-0 pointer-events-none overflow-hidden">
       </div>
       <div className="relative z-10 w-full max-w-md text-center">
          <div ref={resultsRef} className="p-8 space-y-6 bg-card/60 backdrop-blur-2xl border border-border/80 rounded-[32px] shadow-2xl">
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="w-16 h-16 bg-success rounded-2xl flex items-center justify-center mb-4 mx-auto"><CheckCircle2 className="w-8 h-8 text-success-foreground" /></motion.div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase tracking-tight italic text-foreground">{t.missionComplete}</h2>
                <p className="text-[11px] text-muted-foreground font-medium px-4">{t.finalized}<span className="text-primary font-bold uppercase">{question?.title}</span>.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 {[
                   { label: t.xp, value: `+${num(missionResults?.xpEarned || 0)}`, icon: <Star className="w-3.5 h-3.5 text-warning" /> },
                   { label: t.time, value: formatTime(missionResults?.timeTaken || 0), icon: <Timer className="w-3.5 h-3.5 text-accent" /> },
                   { label: t.score, value: `${num(missionResults?.accuracy || 0)}%`, icon: <CheckCircle2 className="w-3.5 h-3.5 text-success" /> }
                 ].map((stat, i) => (
                   <div key={i} className="bg-background/40 p-3 rounded-xl border border-border/40 flex flex-col items-center">
                      <div className="mb-0.5 opacity-80">{stat.icon}</div>
                      <span className="text-sm font-black text-foreground">{stat.value}</span>
                      <span className="text-[7px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                   </div>
                 ))}
              </div>
              <div className="text-left space-y-2 bg-muted/20 p-4 rounded-2xl border border-border/30">
                 <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">{t.breakdown}</h4>
                 <div className="space-y-1.5 font-mono">
                     {missionQueue.map((q, i) => {
                       const isCorrect = stepResults[i] !== false;
                       return (
                         <div key={q.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-background/30 group hover:bg-background/50 transition-colors">
                            <div className="flex items-center gap-2 overflow-hidden">
                               {isCorrect ? (
                                 <CheckCircle2 className="w-2.5 h-2.5 text-success shrink-0" />
                               ) : (
                                 <AlertCircle className="w-2.5 h-2.5 text-destructive shrink-0" />
                               )}
                               <span className={`text-[9px] font-bold truncate ${isCorrect ? 'text-foreground/80' : 'text-destructive'}`}>{q.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               {(q.weight || 1) > 1 && <span className="text-[7px] font-black px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">{t.elite}</span>}
                               <span className="text-[7px] font-black opacity-30 select-none uppercase tracking-widest whitespace-nowrap">{t.weight}{num(q.weight || 1)}</span>
                            </div>
                         </div>
                       );
                     })}
                 </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                 <div className="flex gap-3">
                    <Button onClick={() => navigate('/career-prep')} className="flex-1 h-11 text-xs font-black rounded-xl shadow-lg shadow-primary/20 gap-2 uppercase tracking-widest">{t.done}</Button>
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-border hover:bg-muted text-foreground/70 text-xs font-black gap-2 transition-all active:scale-95" onClick={() => { if (resultsRef.current) toPng(resultsRef.current, { cacheBust: true, backgroundColor: `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--card')})` }).then(url => { const l = document.createElement('a'); l.download = `mission-${slug}.png`; l.href = url; l.click(); toast({ title: t.success, description: t.snapSaved }); }); }}>
                      <Share2 className="w-4 h-4" /> {t.snapshot}
                    </Button>
                 </div>
                 {Object.values(stepResults).includes(false) && (
                   <Button variant="ghost" className="h-11 w-full rounded-xl border border-dashed border-destructive/30 text-destructive/80 hover:bg-destructive/5 text-xs font-black uppercase tracking-widest gap-2" onClick={() => {
                     resetMission();
                     setStepResults({});
                     missionStartTime.current = Date.now();
                   }}>
                     <RotateCcw className="w-4 h-4" /> {t.retryFailed}
                   </Button>
                 )}
              </div>
          </div>
       </div>
    </div>
    </MotionConfig>
  );

  const envReady = status === 'ready';
  const envBooting = status === 'booting' || status === 'seeding';
  const isSingleQuestion = missionQueue.length === 1;
  const showsEditor = currentQ?.question_type === 'code' || currentQ?.question_type === 'case_study';
  const problemPane = (
              <div className="h-full flex flex-col bg-card md:border-r border-border">
                <div className="h-12 shrink-0 border-b flex items-center px-4 md:px-6 gap-6 md:gap-8 bg-muted/20 backdrop-blur-md">
                  {(['description', 'schema', ...(topics.length > 0 ? ['topic' as const] : []), 'submission'] as const).map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab as any)} 
                      className={`h-full text-[10px] font-black uppercase tracking-[0.25em] transition-all relative ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {t.tabs[tab]}
                      {activeTab === tab && (
                        <motion.div 
                          layoutId="panel-tab-underline"
                          className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                        />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-auto p-4 md:p-6">
                  {activeTab === 'description' ? <MemoizedMarkdown content={currentQ?.content_md || question?.content_md || ''} /> : 
activeTab === 'schema' ? <pre className="bg-muted rounded-xl p-5 border border-border font-mono text-[11px] text-muted-foreground overflow-x-auto">{currentQ?.schema_sql || t.stdEnv}</pre> :
                    activeTab === 'topic' ? (
                      // The theory behind this question, in the pane that already
                      // holds the problem. No XP, no gate — reading is free.
                      <div className="space-y-3">
                        {topics.map(c => <TopicCard key={c.id} topic={c} surface="workspace" defaultOpen />)}
                      </div>
                    ) :
                    <div className="space-y-6 p-4">
                      <div className="bg-muted/40 rounded-2xl border border-border/60 p-6 space-y-3">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground">{t.policy}</span>
                        </div>
                        <div className="text-[12px] text-muted-foreground leading-relaxed space-y-2">
                          <p>{t.policyIntro}<strong className="text-foreground">{t.policyBold}</strong>{t.policyEnd}</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>{t.p1}</li>
                            <li>{t.p2}</li>
                            <li>{t.p3a}<strong className="text-foreground">{t.p3b}</strong>{t.p3c}</li>
                            <li>{t.p4}</li>
                          </ul>
                        </div>
                      </div>
                      {submissions.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <History className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">{t.history} ({num(submissions.length)})</span>
                          </div>
                          {submissions.map(sub => (
                            <div key={sub.id} className="p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="flex justify-between items-center mb-3">
                                <Badge className={sub.is_correct ? 'bg-success/10 text-success border-0' : 'bg-destructive/10 text-destructive border-0'}>{sub.is_correct ? t.accepted : t.failed}</Badge>
                                <span className="text-[9px] font-mono text-muted-foreground">{new Date(sub.created_at).toLocaleString(lang === 'bn' ? 'bn-BD' : undefined)}</span>
                              </div>
                              <pre className="text-[11px] font-mono text-foreground/80 bg-muted/50 p-3 rounded-lg border border-border/50 overflow-x-auto whitespace-pre-wrap">{sub.submitted_code}</pre>
                            </div>
                          ))}
                        </div>
                      )}
                      {submissions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                          <Send className="w-8 h-8 opacity-20" />
                          <p className="text-[11px] font-medium">{t.noSubs}</p>
                        </div>
                      )}
                    </div>}
                </div>
              </div>
  );

  const mcqPane = currentQ ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-auto relative">
                       <div className="max-w-xl w-full space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-700 pb-12 mt-4 md:mt-12">
                          <div className="space-y-6">
                             <div className="flex flex-col items-center text-center space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20"><Sparkles className="w-3 h-3 text-primary" /><span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">{t.briefing}</span></div>
                                <h3 className="text-2xl font-black text-foreground leading-tight italic uppercase tracking-tighter">{t.decision}</h3>
                             </div>
                             <div className="bg-muted/30 p-5 md:p-8 rounded-3xl md:rounded-[32px] border border-border/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5"><BookOpen className="w-20 h-20 -rotate-12" /></div>
                                <MemoizedMarkdown content={currentQ?.problem_statement || currentQ?.description || ''} />
                             </div>
                          </div>
                          <div className="space-y-4">
                             <div className="flex items-center gap-4 px-2"><div className="h-px flex-1 bg-border/50" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{t.selectSolution}</span><div className="h-px flex-1 bg-border/50" /></div>
                             <div className="flex flex-col gap-3">
{currentQ.options?.map((opt: any, idx: number) => {
                                   const optionLabel = opt.label || String.fromCharCode(65 + idx);
                                   return (
                                   <button key={`${currentQ.id}-${idx}`} onClick={() => setMcqAnswer(optionLabel)} className={`flex items-start gap-4 p-5 rounded-3xl border-2 transition-all duration-300 text-left relative ${mcqAnswer === optionLabel ? 'border-primary bg-primary/5 shadow-xl' : 'border-border/50 bg-card/30 hover:border-primary/30'}`}>
                                     <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${mcqAnswer === optionLabel ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{optionLabel}</div>
                                     <div className="pt-2 text-[14px] font-bold text-foreground">{opt.text}</div>
                                   </button>
                                   );
                                 })}
                             </div>
                          </div>
                       </div>
                    </div>
  ) : null;

  const editorPane = (
                         <div className="h-full flex flex-col relative">
                           <div className="h-8 shrink-0 flex items-center px-4 justify-between bg-muted/50 border-b border-border">
                             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"><Layout className="w-3.5 h-3.5 text-primary" />{t.terminal}</div>
                             <Button size="sm" onClick={handleRun} disabled={!envReady || isExecuting} variant="ghost" className="h-6 px-3 text-[10px] font-black uppercase tracking-widest gap-1.5 text-primary hover:bg-primary/10 rounded-lg">
                               {envBooting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" fill="currentColor" />}
                               {t.run}
                             </Button>
                           </div>
                           <div className="flex-1"><Editor height="100%" language={currentQ?.language === 'python' ? 'python' : 'sql'} theme=" mission-dark" beforeMount={defineCustomThemes} value={code} onChange={v => setCode(v || '')} options={{ minimap: { enabled: false }, fontSize: 15, padding: { top: 20, bottom: 20 }, wordWrap: 'on' }} /></div>
                         </div>
  );

  const outputPane = (
                         <div className="h-full flex flex-col bg-card">
                            <div className="h-9 shrink-0 flex items-center justify-between px-4 bg-muted/50 border-b border-border"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary"><span className="w-1.5 h-1.5 rounded-full bg-primary" />{t.stdout}</div>{queryResult?.executionTime !== undefined && <span className="text-[9px] font-mono text-muted-foreground">{num(Number(queryResult.executionTime.toFixed(1)))}ms</span>}</div>
                            <div className="flex-1 overflow-auto p-5 font-mono text-[12px]">
                              <AnimatePresence mode="wait" initial={false}>
                              <motion.div key={`${queryResult?.executionTime ?? 'none'}-${queryResult?.error ? 'e' : 'o'}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="h-full">
                               {queryResult?.error ? <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 whitespace-pre-wrap">{queryResult.error}</div> : queryResult?.stdout !== undefined ? (
                                 <div className="space-y-4">
                                   <pre className="whitespace-pre-wrap text-foreground/80">{queryResult.stdout || t.noOutput}</pre>
                                   {queryResult.returnValue !== null && queryResult.returnValue !== undefined && <pre className="whitespace-pre-wrap text-primary">{`${t.ret}${JSON.stringify(queryResult.returnValue)}`}</pre>}
                                 </div>
                               ) : (queryResult?.rows.length || 0) > 0 ? (
                                 <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
                                    <table className="w-full text-left">
                                      <thead className="bg-muted/50 border-b border-border"><tr>{queryResult.columns.map(col => <th key={col} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{col}</th>)}</tr></thead>
                                      <tbody>{queryResult.rows.map((row, i) => <tr key={i} className="border-b border-border/50 hover:bg-muted/30">{queryResult.columns.map(col => <td key={col} className="px-4 py-3 text-foreground/80">{String(row[col])}</td>)}</tr>)}</tbody>
                                    </table>
                                 </div>
                               ) : <div className="h-full flex items-center justify-center opacity-20"><span className="font-black uppercase tracking-[0.5em] text-[10px]">{t.awaiting}</span></div>}
                              </motion.div>
                              </AnimatePresence>
                            </div>
                         </div>
  );


  return (
    <MotionConfig reducedMotion="user">
    <div className="workspace-shell flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden relative">
      <MemoizedNavbar />
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      </div>
      <div className="flex-1 flex flex-col relative z-10 pt-16 overflow-hidden">
        <div className="h-2 shrink-0 flex gap-1.5 px-3 py-1 bg-muted/30 border-b border-border/50">
          {missionQueue.map((_, idx) => {
            const isCompleted = idx < cursorIdx;
            const isCurrent = idx === cursorIdx;
            const wasCorrect = stepResults[idx];

            let colorClass = 'bg-transparent';
            if (isCurrent) colorClass = 'bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]';
            else if (isCompleted) colorClass = wasCorrect ? 'bg-success' : 'bg-destructive';

            return (
              <div key={idx} className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: isCompleted || isCurrent ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`h-full rounded-full ${colorClass}`}
                />
              </div>
            );
          })}
        </div>

        <header className="h-16 shrink-0 border-b bg-background/50 backdrop-blur-2xl flex items-center justify-between px-6 z-40 border-primary/5">
           <div className="flex items-center gap-2 md:gap-5 min-w-0">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-all hover:bg-primary/5 rounded-xl px-1 md:px-2 shrink-0" onClick={() => navigate('/career-prep')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                <Badge className="hidden sm:inline-flex bg-primary/10 text-primary border-primary/30 text-[9px] font-black uppercase tracking-[0.2em] h-5 px-2.5 shrink-0">{t.step}{num(cursorIdx + 1)}</Badge>
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-sm md:text-xl font-black tracking-tight text-foreground uppercase italic truncate pr-2">
                    {currentQ?.title || question?.title}
                  </h1>
                </div>
                {!isMobile && (
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-border/50 text-muted-foreground h-5 px-2 bg-muted/30 shrink-0">
                    {currentQ?.difficulty || t.level1}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {timeLeft !== null && (
              <div className="hidden sm:flex bg-card/40 px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-primary/10 items-center gap-2 group transition-all hover:bg-primary/5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] md:text-xs font-mono font-black text-foreground tracking-tighter">{formatTime(timeLeft)}</span>
              </div>
            )}

            {showsEditor && (
              <Button size="sm" onClick={handleRun} disabled={!envReady || isExecuting} className="bg-primary/10 hover:bg-primary/20 text-primary h-9 px-3 rounded-xl font-black text-[10px] uppercase gap-2 border border-primary/20 transition-all active:scale-95">
                {envBooting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" fill="currentColor" />}
                <span>{t.run}</span>
              </Button>
            )}

            {/* An MCQ with nothing picked must not submit: now that every attempt is
                stored, two idle clicks would persist two failures and trip the
                struggle trigger. */}
            <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || (showsEditor && !envReady) || (currentQ?.question_type === 'mcq' && !mcqAnswer)} className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 rounded-xl font-black text-[10px] uppercase gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95 group">
              <Send className="w-3.5 h-3.5" />
              <span>{t.submit}</span>
            </Button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          {isMobile ? (
            /* One pane at a time on a phone. Three stacked resizable panes left
               Monaco about 130px tall — the three-pane split is a desktop shape. */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden">
                {currentQ?.question_type === 'mcq'
                  ? mcqPane
                  : mobilePane === 'problem' ? problemPane
                  : mobilePane === 'code' ? editorPane
                  : outputPane}
              </div>
              {currentQ?.question_type !== 'mcq' && (
                <div className="h-14 shrink-0 grid grid-cols-3 border-t border-border bg-card">
                  {(['problem', 'code', 'output'] as const).map(pane => (
                    <button
                      key={pane}
                      onClick={() => setMobilePane(pane)}
                      className={`h-full text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${mobilePane === pane ? 'text-primary bg-primary/10 border-t-2 border-primary' : 'text-muted-foreground'}`}
                    >
                      {t.panes[pane]}
                      {pane === 'output' && queryResult?.error && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-destructive align-middle" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <PanelGroup direction="horizontal">
              <Panel defaultSize={30} minSize={20}>{problemPane}</Panel>
              <PanelResizeHandle className="w-[1px] bg-border hover:bg-primary/40 transition-colors z-50 cursor-col-resize" />
              <Panel defaultSize={30} minSize={20}>
                <div className="h-full flex flex-col bg-background relative z-10">
                  {currentQ?.question_type === 'mcq' ? mcqPane : (
                    <PanelGroup direction="vertical">
                      <Panel defaultSize={65} minSize={30}>{editorPane}</Panel>
                      <PanelResizeHandle className="h-[1px] bg-border hover:bg-primary/40 transition-colors z-50 cursor-row-resize" />
                      <Panel defaultSize={35} minSize={20}>{outputPane}</Panel>
                    </PanelGroup>
                  )}
                </div>
              </Panel>
            </PanelGroup>
          )}
        </div>
      </div>
      {/* Mission Failed Dialog */}
      <Dialog open={showFailedDialog} onOpenChange={setShowFailedDialog}>
        <DialogContent className="sm:max-w-md bg-card border-destructive/30">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-3 mx-auto border border-destructive/20">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic text-destructive">
              {t.failedTitle}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {t.failedDesc}
            </DialogDescription>
          </DialogHeader>

          {lastFeedback && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="rounded-xl border border-warning/25 bg-warning-soft p-4" role="status" aria-live="polite">
              <p className="text-sm font-extrabold text-warning-foreground">{lastFeedback.title}</p>
              {lastFeedback.difference && <p className="mt-1 text-sm text-foreground">{lastFeedback.difference}</p>}
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.nextClue}{lastFeedback.clue}</p>
              {topics[0] && <Button variant="link" className="mt-1 h-auto min-h-11 px-0" onClick={() => navigate(`/career-prep/topic/${topics[0].slug}`)}>{t.reviewTopic}</Button>}
            </motion.div>
          )}

          {/* Progressive Hints */}
          {(() => {
            const fails = failCount[cursorIdx] || 0;
            const hints = currentQ?.hints || [];
            const hintState = getHintEscalationState(fails, hints.length, !!currentQ?.solution_sql);

            const solutionBlock = (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-primary">
                  <Sparkles className="w-3 h-3" /> {t.solutionRevealed}
                </div>
                <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap bg-muted/50 p-3 rounded-lg border border-border/50">
                  {currentQ?.question_type === 'mcq' ? `${t.correct}${currentQ.correct_option}` : currentQ?.solution_sql}
                </pre>
              </div>
            );

            switch (hintState.kind) {
              case 'no-hints-solution-revealed':
                return solutionBlock;

              case 'no-hints-waiting':
                return (
                  <p className="text-center text-[10px] text-muted-foreground font-medium">
                    {t.noHints(hintState.attemptsRemaining, num(hintState.attemptsRemaining))}
                  </p>
                );

              case 'hints-revealed':
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">
                      <AlertCircle className="w-3 h-3 text-warning" />
                      {t.hintsUnlocked(num(hintState.revealedCount), num(hintState.totalHints), hintState.revealedCount)}
                    </div>
                    <div className="space-y-2">
                      {hints.slice(0, hintState.revealedCount).map((hint: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-warning/5 border border-warning/20 rounded-xl p-3 flex items-start gap-3"
                        >
                          <span className="shrink-0 w-6 h-6 rounded-lg bg-warning/10 text-warning flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                          <p className="text-sm text-foreground/80 pt-0.5">{hint}</p>
                        </motion.div>
                      ))}
                    </div>
                    {hintState.nextHintAt && (
                      <p className="text-center text-[10px] text-muted-foreground font-medium">
                        {t.nextHint(hintState.nextHintAt, num(hintState.nextHintAt))}
                      </p>
                    )}
                    {hintState.solutionRevealed && <div className="mt-2">{solutionBlock}</div>}
                  </div>
                );

              case 'awaiting-first-hint':
              default:
                return (
                  <p className="text-center text-[10px] text-muted-foreground font-medium">
                    <Lightbulb className="mr-1 inline h-3.5 w-3.5 text-warning" /> {t.hintSoon}
                  </p>
                );
            }
          })()}

          <div className="flex flex-col gap-3 pt-2">
            <Button
              onClick={() => setShowFailedDialog(false)}
              className="w-full h-11 rounded-xl font-black text-xs uppercase tracking-widest gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t.retry}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </MotionConfig>
  );
};

function extractFirstTable(schemaSql: string): string {
  const match = schemaSql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
  return match ? match[1] : 'your_table';
}

export default SQLChallenge;
