# Browser Python Runtime for Coding Questions

Python Questions run in a lazy-loaded Pyodide Web Worker, using named-function hidden tests and conservative output/time limits. This keeps execution isolated from the application server, reuses the existing SQL workspace and submission flow, and avoids building a general-purpose hosted Python service; standard-library-only scope, no network/files/packages, and no draft persistence are deliberate v1 boundaries.
