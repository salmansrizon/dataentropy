const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js';

let pyodidePromise: Promise<any> | undefined;

function pyodide() {
  pyodidePromise ??= new Promise((resolve, reject) => {
    try {
      (self as any).importScripts(PYODIDE_URL);
      (self as any).loadPyodide({ indexURL: PYODIDE_URL.replace('pyodide.js', '') }).then(resolve, reject);
    } catch (error) { reject(error); }
  });
  return pyodidePromise;
}

self.onmessage = async ({ data }: MessageEvent) => {
  try {
    const runtime = await pyodide();
    (self as any).__stdout = [];
    runtime.setStdout({ batched: (text: string) => (self as any).__stdout.push(text) });
    await runtime.runPythonAsync(data.source);
    let returnValue: unknown = null;
    if (data.functionName) {
      const args = JSON.stringify(data.args || []);
      const kwargs = JSON.stringify(data.kwargs || {});
      runtime.globals.set('__args_json', args);
      runtime.globals.set('__kwargs_json', kwargs);
      returnValue = JSON.parse(String(runtime.runPython(`
import json
_result = ${data.functionName}(*json.loads(__args_json), **json.loads(__kwargs_json))
json.dumps(_result, default=str)
`)));
    }
    (self as any).postMessage({ ok: true, stdout: (self as any).__stdout.join(''), returnValue });
  } catch (error) {
    (self as any).postMessage({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
