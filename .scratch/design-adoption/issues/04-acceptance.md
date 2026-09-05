# Define adoption acceptance and rollout boundaries

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: codex
Parent: [Adopt the DataEntropy design across non-admin surfaces](../map.md)
Blocked by: 01, 02, 03

## Question

What evidence and representative routes establish complete adoption and unchanged admin appearance, including system-theme changes, explicit theme preferences, portals, accessibility, responsive layouts, and existing workflows? Agree rollout boundaries and distinguish build, browser, and runtime validation.

## Answer

Acceptance routes: `/`, `/courses`, `/career-prep`, `/career-prep/library`, `/career-prep/solve/:slug`, `/roadmaps`, and one learner dashboard route. Check system light/dark changes, explicit toggle persistence, keyboard focus, modal/toast portal styling, mobile overflow, and existing solve/navigation/payment flows. Admin `/admin` must retain its previous palette and type. Token parity and `git diff --check` are runnable checks; Vite, Vitest, and browser checks remain pending until dependencies and a browser are available.
