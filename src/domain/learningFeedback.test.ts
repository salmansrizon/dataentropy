import { describe, expect, it } from 'vitest';
import { explainFailedAttempt } from './learningFeedback';

describe('explainFailedAttempt', () => {
  it('identifies a likely join misconception and gives an exact row difference', () => {
    expect(explainFailedAttempt({ sql: 'select * from a join b on a.id=b.id', actualRows: 8, expectedRows: 4 }))
      .toMatchObject({ category: 'join', difference: 'Your query returned 8 rows; the target has 4.' });
  });

  it('prioritizes an execution error over result-shape heuristics', () => {
    expect(explainFailedAttempt({ sql: 'select', errorMessage: 'syntax error near FROM' }).category).toBe('syntax');
  });
});
