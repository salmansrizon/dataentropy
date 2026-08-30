import { describe, expect, it } from 'vitest';
import { nextReview, shouldUpdateReview } from './adaptiveReview';

const now = new Date('2026-08-30T10:00:00Z');

describe('nextReview', () => {
  it('expands successful review intervals through 1, 3, 7, 14, 30 and 60 days', () => {
    const first = nextReview(null, 'correct', now);
    expect(first.dueAt.toISOString()).toBe('2026-08-31T10:00:00.000Z');
    expect(nextReview(first, 'correct', now).dueAt.toISOString()).toBe('2026-09-02T10:00:00.000Z');
  });

  it('resets an incorrect review and records a lapse', () => {
    const result = nextReview({ intervalIndex: 4, ease: 2.3, attempts: 4, lapses: 0 }, 'incorrect', now);
    expect(result).toMatchObject({ intervalIndex: 0, ease: 2.1, attempts: 5, lapses: 1 });
  });

  it('postpones for one day without counting an attempt', () => {
    const result = nextReview({ intervalIndex: 2, ease: 2.3, attempts: 3, lapses: 1 }, 'postponed', now);
    expect(result.dueAt.toISOString()).toBe('2026-08-31T10:00:00.000Z');
    expect(result.attempts).toBe(3);
  });
});

describe('shouldUpdateReview', () => {
  it('starts a schedule only after the first success', () => {
    expect(shouldUpdateReview(false, 'incorrect', false)).toBe(false);
    expect(shouldUpdateReview(false, 'correct', false)).toBe(true);
  });

  it('does not advance an existing schedule for early voluntary practice', () => {
    expect(shouldUpdateReview(true, 'correct', false)).toBe(false);
    expect(shouldUpdateReview(true, 'correct', true)).toBe(true);
    expect(shouldUpdateReview(true, 'incorrect', false)).toBe(true);
  });
});
