# Choose the shared layout and component language

Labels: wayfinder:grilling
Type: grilling
Status: resolved
Assignee: codex
Parent: [Adopt the DataEntropy design across non-admin surfaces](../map.md)
Blocked by: none

## Question

Which reference layout traits should public pages and learner dashboards share: content width, navigation, section rhythm, card density, typography hierarchy, and component states? Agree concrete written rules with the user, retaining existing features and avoiding prototypes.

## Answer

Adopt existing semantic Tailwind utilities across public and learner surfaces. Use Geist/system sans, 16px/24px body text, 36px display headings, 4–24px spacing tokens, 8px/10px corners, full pills, flat surfaces, blue primary actions, visible focus rings, and 150ms/300ms motion with reduced-motion support. Preserve existing route structure, component states, and feature behavior. No new layout abstraction or prototype is required.
