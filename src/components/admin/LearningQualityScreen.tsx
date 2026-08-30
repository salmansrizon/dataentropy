import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Activity, BookOpenCheck, RotateCcw, Users, Clock3, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RowSkeleton } from '@/components/ui/skeletons';

interface Summary {
  events: Record<string, number>;
  commerce_events: Record<string, number>;
  weekly_successful_learners: number;
  active_learners: number;
  due_reviews: number;
  completed_lessons: number;
  course_resumers: number;
  d1_returners: number;
  d7_returners: number;
  d28_returners: number;
  question_quality: { question_id: string; attempts: number; correct: number; success_rate: number }[];
}

const eventLabels = ['landing_viewed','diagnostic_completed','journey_selected','attempt_submitted','learning_item_completed','review_completed','checkout_submitted'] as const;

export default function LearningQualityScreen() {
  const [days, setDays] = useState(30);
  const reduceMotion = useReducedMotion();
  const query = useQuery({
    queryKey: ['learning-growth-summary', days],
    queryFn: async () => { const { data, error } = await (supabase as any).rpc('learning_growth_summary', { p_days: days }); if (error) throw error; return data as Summary; },
  });
  if (query.isLoading) return <RowSkeleton count={6} />;
  if (query.error) return <div className="rounded-xl border border-danger/30 bg-danger-soft p-5 text-sm text-danger">Learning analytics need the latest Supabase migration before this dashboard can load.</div>;
  const data = query.data!;
  const eventPeak = Math.max(1, ...eventLabels.map((event) => data.events?.[event] ?? 0));
  const cards = [
    ['Weekly successful learners', data.weekly_successful_learners, TrendingUp],
    ['Active learners', data.active_learners, Users],
    ['Lessons completed', data.completed_lessons, BookOpenCheck],
    ['Reviews due', data.due_reviews, RotateCcw],
    ['Course resumers', data.course_resumers, Activity],
  ] as const;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-extrabold">Learning quality</h2><p className="text-sm text-muted-foreground">Learning, return, and conversion guardrails—not clicks alone.</p></div><div className="flex gap-2">{[7,30,90].map((value) => <Button key={value} size="sm" className="rounded-full" variant={days === value ? 'default' : 'outline'} onClick={() => setDays(value)}>{value}d</Button>)}</div></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map(([label, value, Icon], index) => <motion.div key={label} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .035 }}><Card className="h-full"><CardContent className="p-4"><Icon className="h-5 w-5 text-primary" /><p className="mt-3 text-3xl font-extrabold tabular-nums">{value ?? 0}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></CardContent></Card></motion.div>)}</div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
        <Card><CardContent className="p-5"><h3 className="font-extrabold">Activation and learning loop</h3><div className="mt-5 space-y-3">{eventLabels.map((event) => { const value = data.events?.[event] ?? 0; return <div key={event}><div className="mb-1 flex justify-between text-xs"><span>{event.replaceAll('_',' ')}</span><strong>{value}</strong></div><div className="h-2 overflow-hidden rounded-full bg-muted"><motion.div className="h-full rounded-full bg-primary" initial={reduceMotion ? false : { width: 0 }} animate={{ width: `${value / eventPeak * 100}%` }} transition={{ duration: .3 }} /></div></div>; })}</div></CardContent></Card>
        <Card><CardContent className="p-5"><h3 className="font-extrabold">Behavior-derived return</h3><p className="mt-1 text-xs text-muted-foreground">Calculated from server-timestamped learning activity.</p><div className="mt-5 grid grid-cols-3 gap-2">{[['D1',data.d1_returners],['D7',data.d7_returners],['D28',data.d28_returners]].map(([label,value]) => <div key={label as string} className="rounded-xl bg-secondary p-3 text-center"><Clock3 className="mx-auto h-4 w-4 text-primary" /><p className="mt-2 text-2xl font-extrabold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}</div></CardContent></Card>
      </div>
      <Card><CardContent className="p-5"><h3 className="font-extrabold">Verified commerce outcomes</h3><p className="mt-1 text-xs text-muted-foreground">Payment outcomes come from administrator enrollment decisions, not browser claims.</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{[['Payments verified', data.commerce_events?.payment_verified ?? 0], ['Payments refunded', data.commerce_events?.payment_refunded ?? 0]].map(([label,value]) => <div key={label as string} className="rounded-xl border bg-secondary/40 p-4"><p className="text-2xl font-extrabold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}</div></CardContent></Card>
      <Card><CardContent className="p-5"><h3 className="font-extrabold">Questions needing an author review</h3><p className="mt-1 text-xs text-muted-foreground">High-volume items with unusually low or high success rates deserve a content check.</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr className="border-b text-xs text-muted-foreground"><th className="py-2">Question ID</th><th>Attempts</th><th>Correct</th><th>Success</th></tr></thead><tbody>{(data.question_quality ?? []).map((row) => <tr key={row.question_id} className="border-b last:border-0"><td className="max-w-64 truncate py-3 font-mono text-xs">{row.question_id}</td><td>{row.attempts}</td><td>{row.correct}</td><td className="font-bold">{row.success_rate}%</td></tr>)}</tbody></table></div></CardContent></Card>
    </div>
  );
}
