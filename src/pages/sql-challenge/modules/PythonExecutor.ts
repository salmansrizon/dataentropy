export interface PythonTest {
  functionName?: string;
  args?: unknown[];
  kwargs?: Record<string, unknown>;
  expected: unknown;
}

export interface PythonResult {
  columns: string[];
  rows: any[];
  stdout: string;
  returnValue?: unknown;
  error?: string;
  executionTime: number;
}

export function matchesExpected(value: unknown, expected: unknown) {
  return JSON.stringify(value) === JSON.stringify(expected);
}

const LIMIT_MS = 5000;
const OUTPUT_LIMIT = 100_000;

export function executePython(source: string, test?: PythonTest): Promise<PythonResult> {
  const started = performance.now();
  return new Promise(resolve => {
    const worker = new Worker(new URL('./pythonWorker.ts', import.meta.url), { type: 'classic' });
    const timeout = window.setTimeout(() => {
      worker.terminate();
      resolve({ columns: [], rows: [], stdout: '', error: 'Python execution timed out after 5 seconds.', executionTime: LIMIT_MS });
    }, LIMIT_MS);

    worker.onmessage = ({ data }) => {
      window.clearTimeout(timeout);
      worker.terminate();
      const stdout = String(data.stdout || '').slice(0, OUTPUT_LIMIT);
      resolve({ columns: [], rows: [], stdout, returnValue: data.returnValue, error: data.ok ? undefined : data.error, executionTime: Math.round(performance.now() - started) });
    };
    worker.onerror = error => {
      window.clearTimeout(timeout);
      worker.terminate();
      resolve({ columns: [], rows: [], stdout: '', error: error.message || 'Python runtime unavailable.', executionTime: Math.round(performance.now() - started) });
    };
    worker.postMessage({ source, functionName: test ? test.functionName : undefined, args: test?.args, kwargs: test?.kwargs });
  });
}

export async function validatePython(source: string, functionName: string | null | undefined, tests: PythonTest[] = []) {
  if (!functionName || tests.length === 0) return false;
  for (const test of tests) {
    const result = await executePython(source, { ...test, functionName });
    if (result.error || !matchesExpected(result.returnValue, test.expected)) return false;
  }
  return true;
}

// ponytail: sequential hidden tests, O(n) worker startups; batch only when test volume makes startup measurable.
