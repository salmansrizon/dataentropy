# Adopt the DataEntropy design across non-admin surfaces

Labels: wayfinder:map
Status: open

## Destination

Produce an implementation-ready set of decisions for adopting the supplied design foundations, layouts, and components across public pages, learner dashboards, CareerPrep, and the coding workspace while preserving existing features and the previous admin appearance.

## Notes

- User confirmed: follow system theme; support light and dark; adopt both tokens and layouts/components; exclude admin; preserve its previous appearance; no prototypes.
- This map plans the work. It does not authorize treating unverified implementation as complete.
- Consult Wayfinder, grilling, domain-modeling, and Ponytail. Do not create prototype tickets or artifacts.
- Source: `docs/DESIGN for Data Entrophy.md`. Preserve DataEntropy branding and terminology; the extracted Home/shopping metadata is not product direction.
- Existing global foundation edits affect shared styles. Admin isolation must include typography, spacing, radii, overlays rendered through portals, and shared notifications, not only colors.
- `src/App.tsx` already follows system theme. Existing development prototype routes are not a request to create or expand prototypes.
- Earlier token parity check passed; Vite/Vitest commands failed because executables were unavailable. Browser validation remains pending.
- Tracker: local Markdown fallback. Run `/setup-matt-pocock-skills` if you want a different tracker configured.

## Decisions so far

- [Preserve the previous admin appearance](issues/01-admin-isolation.md): Scoped page and portal token restoration keeps admin visuals stable.
- [Choose the shared layout and component language](issues/02-layout-language.md): Existing semantic utilities carry the approved typography, spacing, surfaces, state, and motion rules.
- [Set CareerPrep and coding workspace constraints](issues/03-workspace-layout.md): Dense workflows retain their structure; shared tokens provide the visual language.
- [Define adoption acceptance and rollout boundaries](issues/04-acceptance.md): Representative routes and explicit validation gates define completion.

## Not yet specified

- Surface-specific exceptions that emerge after shared layout rules and coding workspace constraints are settled.
- Rollout ordering once admin isolation and acceptance requirements are known.

## Out of scope

- Admin redesign, new features, backend/data changes, and new prototypes.
- Deployment or a claim that the current global token edits complete this adoption.
