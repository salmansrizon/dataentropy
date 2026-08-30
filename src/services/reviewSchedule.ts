import { supabase } from '@/integrations/supabase/client';
import { nextReview, shouldUpdateReview, type ReviewDecision } from '@/domain/adaptiveReview';

const REVIEW_KEY = 'careerprep_review_schedule_v2';

export interface ScheduledReview {
  questionId: string;
  slug: string;
  title: string;
  industry: string;
  difficulty: string;
  intervalIndex: number;
  ease: number;
  attempts: number;
  lapses: number;
  dueAt: string;
  lastReviewedAt: string;
}

export type ReviewItem = Pick<ScheduledReview, 'questionId' | 'slug' | 'title' | 'industry' | 'difficulty'>;

function readLocal(): ScheduledReview[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(REVIEW_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(items: ScheduledReview[]): void {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(items));
}

function toReviewState(review: ScheduledReview | { interval_index: number; ease: number | string; attempts: number; lapses: number } | null) {
  if (!review) return null;
  return 'intervalIndex' in review
    ? { intervalIndex: review.intervalIndex, ease: review.ease, attempts: review.attempts, lapses: review.lapses }
    : { intervalIndex: review.interval_index, ease: Number(review.ease), attempts: review.attempts, lapses: review.lapses };
}

function scheduledReview(item: ReviewItem, decision: ReviewDecision, now: Date): ScheduledReview {
  return {
    ...item,
    intervalIndex: decision.intervalIndex,
    ease: decision.ease,
    attempts: decision.attempts,
    lapses: decision.lapses,
    dueAt: decision.dueAt.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

function writeLocalDecision(item: ReviewItem, decision: ReviewDecision, now: Date): ScheduledReview {
  const schedule = readLocal();
  const updated = scheduledReview(item, decision, now);
  writeLocal([...schedule.filter((review) => review.questionId !== item.questionId), updated]);
  return updated;
}

export async function recordReviewResult(item: ReviewItem, result: ReviewDecision['result'], now = new Date()): Promise<{ scheduled: boolean; wasDue: boolean; nextDueAt?: string }> {
  const localExisting = readLocal().find((review) => review.questionId === item.questionId);
  try {
    const { data: auth } = await supabase.auth.getSession();
    const userId = auth.session?.user?.id;
    if (!userId) throw new Error('No learner session');
    const { data: stored } = await (supabase as any).from('learning_review_schedule')
      .select('interval_index, ease, attempts, lapses, due_at').eq('user_id', userId).eq('question_id', item.questionId).maybeSingle();
    const existing = stored ?? localExisting;
    const serverWasDue = !!stored && new Date(stored.due_at).getTime() <= now.getTime();
    const localWasDue = !!localExisting && new Date(localExisting.dueAt).getTime() <= now.getTime();
    if (!shouldUpdateReview(Boolean(existing), result, serverWasDue || localWasDue)) {
      if (!existing) return { scheduled: false, wasDue: false };
      const existingDueAt = stored?.due_at ?? localExisting?.dueAt;
      return { scheduled: true, wasDue: false, nextDueAt: existingDueAt };
    }
    const decision = nextReview(toReviewState(existing), result, now);
    writeLocalDecision(item, decision, now);
    await (supabase as any).from('learning_review_schedule').upsert({
      user_id: userId, question_id: item.questionId, interval_index: decision.intervalIndex, ease: decision.ease,
      attempts: decision.attempts, lapses: decision.lapses, last_result: result, due_at: decision.dueAt.toISOString(),
      last_reviewed_at: now.toISOString(), updated_at: now.toISOString(),
    }, { onConflict: 'user_id,question_id' });
    return { scheduled: true, wasDue: serverWasDue || localWasDue, nextDueAt: decision.dueAt.toISOString() };
  } catch {
    const localWasDue = !!localExisting && new Date(localExisting.dueAt).getTime() <= now.getTime();
    if (!shouldUpdateReview(Boolean(localExisting), result, localWasDue)) {
      return localExisting
        ? { scheduled: true, wasDue: false, nextDueAt: localExisting.dueAt }
        : { scheduled: false, wasDue: false };
    }
    const decision = nextReview(toReviewState(localExisting), result, now);
    const local = writeLocalDecision(item, decision, now);
    return { scheduled: true, wasDue: localWasDue, nextDueAt: local.dueAt };
  }
}

export async function loadDueReviews(now = new Date()): Promise<ScheduledReview[]> {
  try {
    const { data: auth } = await supabase.auth.getSession();
    const userId = auth.session?.user?.id;
    if (!userId) throw new Error('No learner session');
    const { data, error } = await (supabase as any).from('learning_review_schedule')
      .select('question_id, interval_index, ease, attempts, lapses, due_at, last_reviewed_at, question:careerprep_questions(slug,title,industry,difficulty)')
      .eq('user_id', userId).lte('due_at', now.toISOString()).order('due_at').limit(20);
    if (error) throw error;
    return (data ?? []).filter((row: any) => row.question).map((row: any) => ({
      questionId: row.question_id, slug: row.question.slug, title: row.question.title,
      industry: row.question.industry ?? 'Data skills', difficulty: row.question.difficulty ?? 'Mixed',
      intervalIndex: row.interval_index, ease: Number(row.ease), attempts: row.attempts, lapses: row.lapses,
      dueAt: row.due_at, lastReviewedAt: row.last_reviewed_at,
    }));
  } catch {
    return readLocal().filter((review) => new Date(review.dueAt).getTime() <= now.getTime()).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  }
}

export async function postponeReview(review: ScheduledReview, now = new Date()): Promise<void> {
  await recordReviewResult(review, 'postponed', now);
}
