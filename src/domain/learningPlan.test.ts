import { describe, expect, it } from 'vitest';
import { preferencesToSearch, recommendLearningPlan } from './learningPlan';

const journeys = [
  { id: '1', slug: 'data-analyst', title: 'Data Analyst Journey' },
  { id: '2', slug: 'data-engineer', title: 'Data Engineer Journey' },
];

describe('recommendLearningPlan', () => {
  it('uses role, level and time to create an actionable recommendation', () => {
    expect(recommendLearningPlan({ role: 'Data engineer', level: 'Interview ready', time: '8+ hours' }, journeys)).toEqual({
      journey: journeys[1], sessionsPerWeek: 5, minutesPerSession: 75, startingMode: 'interview-sprint', difficulty: 'Hard',
    });
  });

  it('falls back to the first published Journey', () => {
    expect(recommendLearningPlan({ role: 'AI engineer', level: 'Starting out', time: '2 hours' }, journeys).journey).toBe(journeys[0]);
  });

  it('serializes the three preferences without losing spaces', () => {
    expect(preferencesToSearch({ role: 'Data analyst', level: 'Know the basics', time: '5 hours' }))
      .toBe('role=Data+analyst&level=Know+the+basics&time=5+hours');
  });
});
