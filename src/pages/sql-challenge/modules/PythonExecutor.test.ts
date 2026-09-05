import { describe, expect, it } from 'vitest';
import { matchesExpected } from './PythonExecutor';

describe('PythonExecutor', () => {
  it('compares JSON-compatible hidden-test values', () => {
    expect(matchesExpected({ total: 3 }, { total: 3 })).toBe(true);
    expect(matchesExpected([1, 2], [2, 1])).toBe(false);
  });
});
