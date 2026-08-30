const REVIEW_KEY = 'careerprep_review_schedule_v1';
const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14] as const;

export interface ScheduledReview {
  slug: string;
  title: string;
  industry: string;
  difficulty: string;
  intervalIndex: number;
  dueAt: string;
  lastReviewedAt: string;
}

interface ReviewResult {
  wasDue: boolean;
  nextDueAt: string;
}

function readSchedule(): ScheduledReview[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(REVIEW_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSchedule(items: ScheduledReview[]): void {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(items));
}

/** A small, transparent v1 scheduler: 1 → 3 → 7 → 14 days after each success. */
export function recordSuccessfulReview(
  item: Pick<ScheduledReview, 'slug' | 'title' | 'industry' | 'difficulty'>,
  now = new Date(),
): ReviewResult {
  const schedule = readSchedule();
  const existing = schedule.find((review) => review.slug === item.slug);
  const wasDue = !!existing && new Date(existing.dueAt).getTime() <= now.getTime();
  const intervalIndex = existing
    ? Math.min(existing.intervalIndex + 1, REVIEW_INTERVAL_DAYS.length - 1)
    : 0;
  const nextDue = new Date(now);
  nextDue.setUTCDate(nextDue.getUTCDate() + REVIEW_INTERVAL_DAYS[intervalIndex]);

  const updated: ScheduledReview = {
    ...item,
    intervalIndex,
    dueAt: nextDue.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
  writeSchedule([...schedule.filter((review) => review.slug !== item.slug), updated]);
  return { wasDue, nextDueAt: updated.dueAt };
}

export function getDueReviews(now = new Date()): ScheduledReview[] {
  return readSchedule()
    .filter((review) => new Date(review.dueAt).getTime() <= now.getTime())
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}
