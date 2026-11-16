import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Timer, Trophy, ArrowLeft, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import {
  ASSESSMENT_MINUTES, useStartAssessment, useAssessmentQuestions,
  useSubmitAssessment, type AssessmentResult,
} from '@/hooks/useAssessment';
import { useJourneys } from '@/hooks/useJourney';
import { motion, useReducedMotion } from 'framer-motion';
import { useLang, useT } from '@/i18n/lang';
import { CountUp, RevealGroup, RevealItem } from '@/pages/course-details/motion';

const T = {
  en: {
    passed: 'Passed', notThis: 'Not this time', of: 'of', issued: 'Your certificate has been issued.',
    failed: 'The pass mark is 70%. Nothing is lost — your progress and XP are untouched.',
    certIssued: 'Certificate issued', certBody: 'Anyone can check it at the verification link — it states exactly what was assessed.', viewCert: 'View my certificate',
    back: 'Back to Career Prep', cp: 'Career Prep', final: 'Final assessment', journey: 'Journey',
    r1: (m: string) => `· 12 questions, ${m} minutes`, r2: '· The questions are chosen by the server, not by you', r3: '· Answers are graded server-side',
    r4: '· Pass mark is 70%', r5: '· Running out of time submits what you have answered', start: 'Start the assessment', timer: 'The timer starts as soon as you begin.',
    submit: 'Submit', submitAssessment: 'Submit assessment',
  },
  bn: {
    passed: 'পাস', notThis: 'এবার হয়নি', of: 'এর মধ্যে', issued: 'আপনার সার্টিফিকেট ইস্যু করা হয়েছে।',
    failed: 'পাস মার্ক ৭০%। কিছুই হারায়নি — আপনার অগ্রগতি ও XP অক্ষুণ্ণ আছে।',
    certIssued: 'সার্টিফিকেট ইস্যু হয়েছে', certBody: 'ভেরিফিকেশন লিংকে যে কেউ যাচাই করতে পারবেন — কী মূল্যায়ন করা হয়েছিল তা সেখানে স্পষ্ট লেখা আছে।', viewCert: 'আমার সার্টিফিকেট দেখুন',
    back: 'Career Prep-এ ফিরুন', cp: 'Career Prep', final: 'চূড়ান্ত মূল্যায়ন', journey: 'জার্নি',
    r1: (m: string) => `· ১২টি প্রশ্ন, ${m} মিনিট`, r2: '· প্রশ্ন সার্ভার বাছাই করে, আপনি নন', r3: '· উত্তর সার্ভারে মূল্যায়ন হয়',
    r4: '· পাস মার্ক ৭০%', r5: '· সময় শেষ হলে যা উত্তর দিয়েছেন সেটাই জমা হবে', start: 'মূল্যায়ন শুরু করুন', timer: 'শুরু করার সাথে সাথেই টাইমার চালু হবে।',
    submit: 'জমা দিন', submitAssessment: 'মূল্যায়ন জমা দিন',
  },
};

/**
 * The timed final assessment.
 *
 * The timer is a display of a server-recorded start time, not the thing that
 * decides anything — the attempt row holds `started_at`, and grading happens in
 * the database. Running out of time submits what is answered rather than
 * discarding the attempt: losing an hour's work to a dropped connection would be
 * a far worse failure than a slightly generous clock.
 */
const AssessmentPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const t = useT(T);
  const { num } = useLang();
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { journeys } = useJourneys();
  const journey = journeys.find((j) => j.slug === slug);

  const start = useStartAssessment();
  const submit = useSubmitAssessment();

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const { questions, loading } = useAssessmentQuestions(attemptId);

  useEffect(() => {
    if (!endsAt || result) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endsAt, result]);

  const remaining = endsAt ? Math.max(0, endsAt - now) : 0;
  const answered = Object.keys(answers).length;

  const finish = useMemo(
    () => async () => {
      if (!attemptId || submit.isPending) return;
      const res = await submit.mutateAsync({ attemptId, answers });
      setResult(res);
    },
    [attemptId, answers, submit],
  );

  // Time up: submit what exists rather than losing the attempt.
  useEffect(() => {
    if (endsAt && remaining === 0 && !result && attemptId) void finish();
  }, [endsAt, remaining, result, attemptId, finish]);

  const begin = async () => {
    if (!journey) return;
    const res = await start.mutateAsync(journey.id);
    setAttemptId(res.attemptId);
    setEndsAt(Date.now() + ASSESSMENT_MINUTES * 60 * 1000);
  };

  const mm = String(Math.floor(remaining / 60000)).padStart(2, '0');
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 pb-20 pt-28">
        {/* ── Result ─────────────────────────────────────────────────────── */}
        {result ? (
          <motion.div className="text-center" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className={`mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full ${result.passed ? 'bg-success-soft' : 'bg-muted'}`}>
              {result.passed
                ? <Trophy className="h-10 w-10 text-success" />
                : <AlertCircle className="h-10 w-10 text-muted-foreground" />}
            </div>
            <h1 className="text-3xl font-extrabold">
              {result.passed ? t.passed : t.notThis} — <CountUp value={result.score} format={num} /> {t.of} {num(result.total)}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {result.passed
                ? t.issued
                : t.failed}
            </p>

            {result.certificate_id && (
              <Card className="mt-6 text-left">
                <CardContent className="p-5">
                  <p className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-success">
                    <ShieldCheck className="h-3.5 w-3.5" /> {t.certIssued}
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {t.certBody}
                  </p>
                  <Button className="w-full rounded-full" onClick={() => navigate(`/verify/${result.certificate_id}`)}>
                    {t.viewCert}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Button asChild variant="ghost" className="mt-4 rounded-full">
              <Link to="/career-prep">{t.back}</Link>
            </Button>
          </motion.div>
        ) : !attemptId ? (
          /* ── Entry ───────────────────────────────────────────────────── */
          <motion.div className="text-center" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 gap-1.5">
              <Link to="/career-prep"><ArrowLeft className="h-4 w-4" /> {t.cp}</Link>
            </Button>
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-primary/10">
              <Timer className="h-8 w-8 text-primary" />
            </div>
            <h1 className="page-heading text-2xl font-bold">{t.final}</h1>
            <p className="mb-6 text-muted-foreground">{journey?.title ?? t.journey}</p>

            <Card className="mb-6 text-left">
              <CardContent className="space-y-2 p-5 text-sm">
                <p>{t.r1(num(ASSESSMENT_MINUTES))}</p>
                <p>{t.r2}</p>
                <p>{t.r3}</p>
                <p>{t.r4}</p>
                <p>{t.r5}</p>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full rounded-full" disabled={!journey || start.isPending} onClick={begin}>
              {start.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t.start}
            </Button>
            {start.isError && (
              <p className="mt-3 text-xs text-danger">{(start.error as Error).message}</p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">{t.timer}</p>
          </motion.div>
        ) : (
          /* ── Paper ───────────────────────────────────────────────────── */
          <>
            <div className="sticky top-16 z-20 mb-6 flex items-center justify-between gap-4 rounded-2xl border bg-background/95 p-3 backdrop-blur">
              <span className="inline-flex items-center gap-2 font-mono text-lg font-bold">
                <Timer className={`h-4 w-4 ${remaining < 5 * 60000 ? 'text-danger' : 'text-primary'}`} />
                {[...`${mm}:${ss}`].map((c) => (c === ':' ? c : num(Number(c)))).join('')}
              </span>
              <div className="flex flex-1 items-center gap-3">
                <Progress value={(answered / Math.max(questions.length, 1)) * 100} className="h-1.5" />
                <span className="shrink-0 text-xs text-muted-foreground">{num(answered)}/{num(questions.length)}</span>
              </div>
              <Button size="sm" className="rounded-full" disabled={submit.isPending} onClick={finish}>
                {t.submit}
              </Button>
            </div>

            {loading ? (
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary opacity-40" />
            ) : (
              <RevealGroup className="space-y-6">
                {questions.map((q, i) => (
                  <RevealItem key={q.id}>
                    <Card>
                      <CardContent className="p-5">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xs font-black text-muted-foreground">{num(i + 1)}</span>
                          <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                          <Badge variant="outline" className="text-[10px]">{q.industry}</Badge>
                        </div>
                        <p className="mb-1 font-bold">{q.title}</p>
                        {q.content_md && (
                          <p className="mb-3 whitespace-pre-wrap text-sm text-muted-foreground">{q.content_md}</p>
                        )}
                        <div className="space-y-2">
                          {q.options.map((o) => (
                            <button
                              key={o.label}
                              onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.label }))}
                              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${
                                answers[q.id] === o.label
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border text-xs font-bold">
                                {o.label}
                              </span>
                              <span className="flex-1">{o.text}</span>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </RevealItem>
                ))}
              </RevealGroup>
            )}

            <Button className="mt-6 w-full rounded-full" size="lg" disabled={submit.isPending} onClick={finish}>
              {submit.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t.submitAssessment}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
