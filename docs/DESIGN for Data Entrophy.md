# Home

## Mission
Create implementation-ready, token-driven UI guidance for Home that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: Home
- URL: https://shadcn-nextjs-skillsphere-full-template.vercel.app/
- Audience: online shoppers and consumers
- Product surface: marketing site

## Style Foundations
- Visual style: structured, tokenized, content-first
- Main font style: `font.family.primary=Geist`, `font.family.stack=Geist, Geist Fallback`, `font.size.base=16px`, `font.weight.base=400`, `font.lineHeight.base=24px`
- Typography scale: `font.size.xs=12px`, `font.size.sm=14px`, `font.size.md=16px`, `font.size.lg=18px`, `font.size.xl=20px`, `font.size.2xl=24px`, `font.size.3xl=36px`
- Color palette: `color.text.primary=lab(90.72 0.0000298023 -0.0000119209)`, `color.text.secondary=lab(67.52 -0.0000298023 0)`, `color.text.tertiary=lab(54.2264 9.13158 -66.4503)`, `color.text.inverse=lab(100 0 0)`, `color.surface.base=#000000`, `color.surface.muted=oklab(0.61999 -0.0337874 -0.186953 / 0.1)`, `color.surface.strong=oklab(0.61999 -0.0337874 -0.186953 / 0.3)`, `color.border.default=lab(26.92 0 0)`, `color.focus.ring=oklab(0.61999 -0.0337874 -0.186953 / 0.5)`
- Spacing scale: `space.1=4px`, `space.2=6px`, `space.3=8px`, `space.4=10px`, `space.5=16px`, `space.6=20px`, `space.7=24px`
- Radius/shadow/motion tokens: `radius.xs=8px`, `radius.sm=10px`, `radius.md=18641400px` | `shadow.1=oklab(0.61999 -0.0337874 -0.186953 / 0.943915) 0px 0px 0px 0.336508px` | `motion.duration.instant=150ms`, `motion.duration.fast=300ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: cards (138), buttons (73), links (54), lists (5), navigation (3).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.

## DataEntropy implementation

The application adopts these foundations through `src/index.css`, `tailwind.config.ts`, and `index.html`.

- The product is DataEntropy, a learning and career preparation platform. The extracted Home/shopping labels above are reference metadata.
- Geist is the primary typeface, with system sans-serif fallbacks; body text is 16px/24px.
- Dark mode uses a black canvas, blue-tinted surfaces, neutral text, and blue actions. A complementary light palette remains available through the existing theme switch.
- Reference Lab/OKLab colors are approximated in the existing HSL token format. Primary action colors and input/focus borders are adjusted for readability rather than copying translucent extracted values.
- Components must use existing semantic color utilities such as `bg-background`, `bg-card`, `text-foreground`, and `text-muted-foreground`.
- The extracted 18641400px radius means a pill; use `rounded-full`. Standard corners use 8px and 10px.
- Reference spacing is available as `p-design-1` through `p-design-7` (and equivalent margin/gap utilities). Existing numbered spacing utilities retain their values to avoid changing layouts unintentionally.
- Motion uses `duration-instant` (150ms) and `duration-fast` (300ms). Existing reduced-motion handling remains active.
- Category, status, and provider colors retain their semantic meaning.

### Adoption QA

- [x] Foundation tokens and font loading configured.
- [x] Light/dark token names checked for parity.
- [ ] Run token tests and Vite build once local dependencies are installed.
- [ ] Verify desktop/mobile layout, loaded font, keyboard focus, and contrast in a browser.
- [ ] Audit individual component states against the rules above; changing foundations does not certify every component.
