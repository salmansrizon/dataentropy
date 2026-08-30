export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30, 60] as const;

export interface ReviewState {
  intervalIndex: number;
  ease: number;
  attempts: number;
  lapses: number;
}

export interface ReviewDecision extends ReviewState {
  dueAt: Date;
  result: 'correct' | 'incorrect' | 'postponed';
}

export function shouldUpdateReview(hasSchedule: boolean, result: ReviewDecision['result'], isDue: boolean): boolean {
  if (!hasSchedule) return result === 'correct';
  if (result === 'correct') return isDue;
  return true;
}

export function nextReview(
  current: ReviewState | null,
  result: ReviewDecision['result'],
  now = new Date(),
): ReviewDecision {
  const base = current ?? { intervalIndex: -1, ease: 2.3, attempts: 0, lapses: 0 };
  const intervalIndex = result === 'correct'
    ? Math.min(base.intervalIndex + 1, REVIEW_INTERVAL_DAYS.length - 1)
    : result === 'incorrect' ? 0 : Math.max(0, base.intervalIndex);
  const ease = result === 'incorrect' ? Math.max(1.3, Math.round((base.ease - 0.2) * 100) / 100) : base.ease;
  const days = result === 'postponed' ? 1 : REVIEW_INTERVAL_DAYS[intervalIndex];
  const dueAt = new Date(now);
  dueAt.setUTCDate(dueAt.getUTCDate() + days);
  return {
    intervalIndex,
    ease,
    attempts: base.attempts + (result === 'postponed' ? 0 : 1),
    lapses: base.lapses + (result === 'incorrect' ? 1 : 0),
    dueAt,
    result,
  };
}
