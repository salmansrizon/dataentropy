import { describe, expect, it } from 'vitest';
import { weeklyConsistency } from './weeklyConsistency';

describe('weeklyConsistency', () => {
  it('counts distinct active days in the current week without a daily-streak penalty', () => {
    const result = weeklyConsistency(['2026-08-24T09:00:00Z', '2026-08-24T12:00:00Z', '2026-08-27T09:00:00Z'], 3, new Date('2026-08-30T10:00:00Z'), 'UTC');
    expect(result).toMatchObject({ completedSessions: 2, remaining: 1 });
    expect(result.message).toContain('Missing a day never resets');
  });
});
