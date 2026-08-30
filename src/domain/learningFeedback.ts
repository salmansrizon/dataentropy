export interface FeedbackInput {
  sql: string;
  expectedRows?: number;
  actualRows?: number;
  errorMessage?: string;
}

export interface LearningFeedback {
  category: 'syntax' | 'aggregation' | 'join' | 'filter' | 'shape' | 'general';
  title: string;
  clue: string;
  difference?: string;
}

export function explainFailedAttempt(input: FeedbackInput): LearningFeedback {
  const sql = input.sql.toLowerCase();
  if (input.errorMessage) return { category: 'syntax', title: 'The database could not run this yet', clue: 'Read the first database error, then repair only that clause before running again.', difference: input.errorMessage };
  if (input.expectedRows !== undefined && input.actualRows !== undefined && input.expectedRows !== input.actualRows) {
    const difference = `Your query returned ${input.actualRows} row${input.actualRows === 1 ? '' : 's'}; the target has ${input.expectedRows}.`;
    if (/\bjoin\b/.test(sql)) return { category: 'join', title: 'Check how rows are matching', clue: 'Inspect the join key and whether one row can match several rows on the other side.', difference };
    if (/\bgroup\s+by\b|\b(count|sum|avg|min|max)\s*\(/.test(sql)) return { category: 'aggregation', title: 'Check the grouping level', clue: 'Each selected non-aggregate field should describe the same grain as one output row.', difference };
    if (/\bwhere\b|\bhaving\b/.test(sql)) return { category: 'filter', title: 'Check which rows survive the filter', clue: 'Test each condition separately and confirm whether it belongs before or after aggregation.', difference };
    return { category: 'shape', title: 'The result has the wrong shape', clue: 'Compare the requested grain with one row of your output before changing individual columns.', difference };
  }
  return { category: 'general', title: 'One part still needs adjustment', clue: 'Re-read the requested output, predict one expected row, and compare it with your result.' };
}
