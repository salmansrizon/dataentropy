---
name: dataentropy-brand-system
description: >
  Reproduce DataEntropy brand assets consistently across website UI, social media,
  YouTube, eBooks, presentations, webinars, course graphics, diagrams, certificates,
  OG images, and marketing materials. Use this skill whenever creating or reviewing
  anything visually associated with DataEntropy.
version: "1.0.0"
brand: "DataEntropy"
tagline: "LEARN. BUILD. TRANSFORM."
status: "canonical"
---

# DataEntropy Brand Reproduction Skill

## 0. Purpose

This is the canonical reproduction specification for the **DataEntropy** visual brand.

Use this skill for:

- Website UI and landing pages
- SaaS-style product UI
- Course pages
- Facebook assets
- LinkedIn assets
- Instagram posts
- YouTube thumbnails and banners
- eBooks and PDFs
- Presentation decks
- Webinar materials
- Technical diagrams
- Architecture diagrams
- Social carousels
- Course covers
- Certificates
- Open Graph images
- Marketing creatives
- Email banners
- Learning worksheets
- Community announcements
- Event creatives
- Digital ads

The goal is to make every output immediately recognizable as **DataEntropy**, even when the logo is small or absent.

---

# 1. Canonical Brand Identity

## 1.1 Official name

Always write:

**DataEntropy**

Rules:

- Capital `D`
- Capital `E`
- No space
- Never use `Data Entrophy`
- Never use `Data Entropy` as the formal name
- Never use `Dataentropy`
- `dataentropy` is allowed only for handles, URLs, file names, and tiny utility labels

Correct:

`DataEntropy`

Incorrect:

`Data Entrophy`  
`Data Entropy`  
`Dataentropy`

---

## 1.2 Primary tagline

**LEARN. BUILD. TRANSFORM.**

Preferred all-caps lockup:

`LEARN. BUILD. TRANSFORM.`

Sentence-case version allowed for body copy:

`Learn. Build. Transform.`

Do not replace this tagline unless a campaign explicitly requires a secondary message.

---

## 1.3 Brand positioning

DataEntropy is a practical technology learning platform focused on:

- Data Analytics
- Data Engineering
- Artificial Intelligence
- Machine Learning
- LLMs
- RAG
- Agentic AI
- Backend Engineering
- Software Engineering
- Cloud
- MLOps
- Technical career development
- Real-world technology projects

Brand promise:

> Turn complex technology into practical skills, real projects, production-ready systems, and career outcomes.

Brand personality:

- Intelligent
- Practical
- Technical
- Modern
- Structured
- Clean
- Ambitious
- Accessible
- Engineering-driven
- Data-driven

DataEntropy should feel like:

> A modern engineering lab combined with a premium technology learning platform.

It should not feel like:

- A generic coaching business
- A traditional training institute
- A children's learning brand
- A crypto startup
- A generic AI startup
- A stock-photo-heavy corporate academy

---

# 2. Core Visual Concept

The central visual metaphor is:

**CHAOS → STRUCTURE → KNOWLEDGE → SYSTEM → IMPACT**

DataEntropy visual storytelling should commonly use:

- scattered particles becoming organized
- unstructured data becoming structured blocks
- nodes and connections
- data streams
- grids
- matrices
- vectors
- architecture diagrams
- pipeline flows
- charts
- code blocks
- database blocks
- technical blueprints
- AI system flows

Preferred interpretation:

`Raw Information → Structured Knowledge → Working System`

Avoid relying on:

- robot heads
- glowing brains
- humanoid androids
- cyberpunk HUDs
- excessive neon
- generic futuristic stock imagery
- random 3D blobs

---

# 3. Core Brand Colors

## 3.1 Primary colors

```css
--de-blue: #274D98;
--de-indigo: #6261B1;
--de-purple: #9574C6;
--de-lilac: #AF9FDA;
--de-periwinkle: #C4CBF7;
```

Meaning:

- Blue = engineering, trust, clarity
- Indigo = transition, systems, intelligence
- Purple = AI, transformation, innovation
- Lilac = supporting accent
- Periwinkle = soft background / supporting accent

---

## 3.2 Primary gradient

```css
--de-gradient: linear-gradient(
  110deg,
  #274D98 0%,
  #6261B1 48%,
  #9574C6 100%
);
```

Use the gradient for:

- logo emphasis
- hero keyword
- primary campaign CTA
- subtle visual divider
- selected icon treatment
- premium card outline
- YouTube accent
- course-cover accent

Do not apply the gradient to every component.

Recommended visual ratio:

- 60% neutral
- 25% blue
- 15% purple

---

# 4. Extended Color Scales

## 4.1 Blue

```css
--de-blue-50:  #F3F6FD;
--de-blue-100: #E7EEFB;
--de-blue-200: #C9D7F4;
--de-blue-300: #A2BCEB;
--de-blue-400: #7398DE;
--de-blue-500: #4D75CB;
--de-blue-600: #355EB6;
--de-blue-700: #274D98;
--de-blue-800: #213F7D;
--de-blue-900: #1A3264;
--de-blue-950: #101E3D;
```

## 4.2 Purple

```css
--de-purple-50:  #FAF8FD;
--de-purple-100: #F3EDFA;
--de-purple-200: #E5D8F3;
--de-purple-300: #D1BDE8;
--de-purple-400: #B89BDC;
--de-purple-500: #9574C6;
--de-purple-600: #8059B4;
--de-purple-700: #694496;
--de-purple-800: #56387A;
--de-purple-900: #472F63;
--de-purple-950: #2B193E;
```

---

# 5. Neutral System

```css
--de-white: #FFFFFF;

--de-slate-50:  #F8FAFC;
--de-slate-100: #F1F5F9;
--de-slate-200: #E2E8F0;
--de-slate-300: #CBD5E1;
--de-slate-400: #94A3B8;
--de-slate-500: #64748B;
--de-slate-600: #475569;
--de-slate-700: #334155;
--de-slate-800: #1E293B;
--de-slate-900: #0F172A;
--de-slate-950: #020617;

--de-dark-bg: #07111F;
```

Avoid pure black `#000000` for large areas.

Preferred dark text:

`#0F172A`

Preferred dark background:

`#07111F`

---

# 6. Semantic Tokens

```css
:root {
  --de-background: #FFFFFF;
  --de-background-subtle: #F8FAFC;

  --de-surface: #FFFFFF;
  --de-surface-muted: #F8FAFC;
  --de-surface-dark: #0F172A;

  --de-text-primary: #0F172A;
  --de-text-secondary: #475569;
  --de-text-muted: #64748B;
  --de-text-inverse: #F8FAFC;

  --de-border: #E2E8F0;
  --de-border-strong: #CBD5E1;

  --de-primary: #274D98;
  --de-primary-hover: #213F7D;

  --de-accent: #9574C6;
  --de-accent-hover: #8059B4;

  --de-success: #16A34A;
  --de-warning: #D97706;
  --de-danger: #DC2626;
  --de-info: #0284C7;
}
```

Functional colors should remain functional.

Do not use success/warning/error colors as decorative brand colors.

---

# 7. Topic Category Colors

Use as small identifiers only.

```css
--topic-analytics: #2563EB;
--topic-data-engineering: #0891B2;
--topic-ai: #7C3AED;
--topic-machine-learning: #9333EA;
--topic-software: #4F46E5;
--topic-cloud: #0284C7;
--topic-career: #D97706;
```

Valid use:

- topic chip
- diagram node
- tiny bar
- icon
- outline
- course category label

Do not recolor the entire DataEntropy brand per topic.

---

# 8. Typography

## 8.1 Heading font

Preferred:

**Plus Jakarta Sans**

Fallback:

```css
font-family: "Plus Jakarta Sans", "Inter", Arial, sans-serif;
```

Weights:

- 500 Medium
- 600 SemiBold
- 700 Bold
- 800 ExtraBold

---

## 8.2 Body/UI font

Preferred:

**Inter**

Fallback:

```css
font-family: "Inter", Arial, sans-serif;
```

Weights:

- 400 Regular
- 500 Medium
- 600 SemiBold
- 700 Bold

---

## 8.3 Code/technical font

Preferred:

**JetBrains Mono**

Fallback:

```css
font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
```

Use for:

- code snippets
- SQL
- APIs
- service names
- model labels
- database labels
- terminal text
- technical diagrams

---

# 9. Typography Scale

```css
--text-display-xl: 72px;
--text-display: 64px;
--text-h1: 48px;
--text-h2: 36px;
--text-h3: 28px;
--text-h4: 22px;
--text-body-xl: 20px;
--text-body-lg: 18px;
--text-body: 16px;
--text-small: 14px;
--text-caption: 12px;
```

Line heights:

```css
--line-display-xl: 80px;
--line-display: 72px;
--line-h1: 56px;
--line-h2: 44px;
--line-h3: 36px;
--line-h4: 30px;
--line-body-xl: 32px;
--line-body-lg: 28px;
--line-body: 26px;
--line-small: 22px;
--line-caption: 18px;
```

Responsive hero:

```css
font-size: clamp(2.75rem, 6vw, 4.5rem);
line-height: 1.05;
```

---

# 10. Text Hierarchy

Preferred hierarchy:

1. Category / eyebrow
2. Main headline
3. Supporting copy
4. Primary visual
5. CTA
6. Brand marker / URL

Never create more than 3 competing text scales in a compact asset.

Headlines should be:

- short
- technical
- useful
- outcome-oriented
- understandable in under 2 seconds

Preferred:

`Build Production RAG Systems`

Avoid:

`An Introduction to Understanding the Concepts and Technologies Behind Retrieval Augmented Generation`

---

# 11. Spacing System

Use a 4px grid.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-32: 128px;
```

Default usage:

- compact UI: 8–12px
- controls: 12–16px
- cards: 20–24px
- large cards: 32px
- section vertical spacing: 80–128px desktop
- mobile section spacing: 48–72px

---

# 12. Radius

```css
--radius-xs: 6px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-2xl: 32px;
--radius-full: 9999px;
```

Signature DataEntropy card radius:

**16px**

---

# 13. Borders

Default:

```css
border: 1px solid #E2E8F0;
```

Strong:

```css
border: 1px solid #CBD5E1;
```

Brand:

```css
border: 1px solid rgba(39, 77, 152, 0.24);
```

---

# 14. Shadows

```css
--shadow-xs:
  0 1px 2px rgba(15, 23, 42, 0.05);

--shadow-sm:
  0 4px 12px rgba(15, 23, 42, 0.06);

--shadow-md:
  0 12px 32px rgba(15, 23, 42, 0.10);

--shadow-brand:
  0 16px 50px rgba(98, 97, 177, 0.18);
```

Use shadows sparingly.

Avoid large black shadows.

---

# 15. Motion

```css
--motion-fast: 150ms;
--motion-base: 220ms;
--motion-slow: 360ms;

--ease-standard: cubic-bezier(.2, .8, .2, 1);
```

Preferred:

- card lift
- node connection
- data flow
- code typing
- progress animation
- subtle gradient movement

Avoid:

- bouncing
- spinning decoration
- aggressive parallax
- excessive glowing pulses

---

# 16. Logo System

Required logo variants:

1. DE monogram
2. Horizontal logo
3. Stacked logo
4. Full logo + tagline
5. White logo
6. Dark navy logo
7. Single-color logo
8. Favicon / app icon

Preferred horizontal structure:

```text
[ DE ]  DataEntropy
        LEARN. BUILD. TRANSFORM.
```

Preferred stacked:

```text
       DE

   DataEntropy

LEARN. BUILD. TRANSFORM.
```

---

# 17. Logo Clear Space

Minimum clear space:

**25% of DE monogram height**

Nothing may enter that zone.

---

# 18. Minimum Logo Size

```text
DE icon: 24px
Header lockup: 120px+ wide
Full lockup: 160px+ wide
Social avatar master: 1024×1024
```

At small sizes use the monogram only.

---

# 19. Logo Do Not

Never:

- stretch
- skew
- rotate
- redraw proportions casually
- add bevels
- add heavy drop shadows
- recolor randomly
- reverse color order without reason
- use over noisy imagery
- add unrelated strokes
- place multiple logo variations in one small design

---

# 20. Light Mode

```css
background: #FFFFFF;
surface: #FFFFFF;
surface-muted: #F8FAFC;
text: #0F172A;
secondary-text: #475569;
border: #E2E8F0;
primary: #274D98;
accent: #9574C6;
```

Best for:

- website
- LinkedIn
- eBooks
- documentation
- educational PDFs
- worksheets
- course notes

---

# 21. Dark Mode

```css
background: #07111F;
surface: #0F172A;
surface-2: #1E293B;
border: #334155;
text: #F8FAFC;
muted: #94A3B8;
primary: #7398DE;
accent: #B89BDC;
```

Best for:

- YouTube
- webinars
- launch graphics
- AI topics
- premium course promos
- engineering visualizations

---

# 22. Website Grid

Desktop:

```text
Max width: 1280px
Content width: 1180–1240px
Columns: 12
Gutter: 24px
Horizontal padding: 24–40px
```

Tablet:

```text
Columns: 8
Padding: 24px
```

Mobile:

```text
Columns: 4
Padding: 16–20px
```

---

# 23. Website Visual Principles

Every interface should feel:

- calm
- premium
- technical
- easy to scan
- high whitespace
- structured
- accessible

Avoid:

- excessive glassmorphism
- random neon gradients
- giant decorative blobs
- heavy shadows
- over-rounded everything
- noisy backgrounds

---

# 24. Button System

Heights:

```text
Small: 36px
Default: 44px
Large: 52px
Hero: 56px
```

Primary:

```css
background: #274D98;
color: #FFFFFF;
border-radius: 12px;
```

Hover:

```css
background: #213F7D;
```

Premium CTA:

```css
background: linear-gradient(
  110deg,
  #274D98 0%,
  #6261B1 48%,
  #9574C6 100%
);
```

Secondary:

```css
background: #FFFFFF;
color: #0F172A;
border: 1px solid #CBD5E1;
```

---

# 25. Card System

Default:

```text
Radius: 16px
Background: #FFFFFF
Border: #E2E8F0
Padding: 24px
Shadow: shadow-sm
Hover lift: -4px
Duration: 220ms
```

Course card pattern:

```text
┌──────────────────────────────┐
│ VISUAL / DIAGRAM             │
│                              │
│ [AI ENGINEERING]             │
│                              │
│ Build Production RAG         │
│ Systems                      │
│                              │
│ Intermediate · 8 lessons     │
│                              │
│ Explore →                    │
└──────────────────────────────┘
```

---

# 26. Website Hero Recipe

Eyebrow:

`DATA • AI • ENGINEERING`

Recommended headline:

`Learn the skills. Build the systems. Create the impact.`

Supporting copy:

`Practical learning for Data, AI and Software Engineering through real projects, systems and industry-focused education.`

Primary CTA:

`Explore Learning`

Secondary CTA:

`View Projects`

Preferred hero visual:

- technical diagram
- code
- connected nodes
- data flow
- subtle gradient
- structured illustration

Avoid stock photography as the primary hero.

---

# 27. Social Template System

Maintain reusable templates:

```text
DE01 — Insight
DE02 — Tutorial
DE03 — Carousel
DE04 — Course
DE05 — Build / Project
DE06 — Event / Webinar
DE07 — Announcement
DE08 — Quote / Key Insight
DE09 — Career
DE10 — Tool / Resource
```

Every social asset should include:

- DE mark or DataEntropy wordmark
- topic/category
- clear headline
- one primary visual
- optional supporting copy
- URL or CTA when useful

---

# 28. Social Master Dimensions

```text
Portrait: 1080 × 1350
Square: 1080 × 1080
Story/Reel: 1080 × 1920
Open Graph: 1200 × 630
```

Default:

**1080 × 1350**

---

# 29. Social Layout Recipe

Recommended:

```text
Top 10%:
logo + category

Middle 65%:
headline + visual

Bottom 25%:
supporting copy + CTA / URL
```

Example:

```text
┌────────────────────────────────┐
│ DE        AI ENGINEERING       │
│                                │
│ WHAT ACTUALLY                  │
│ HAPPENS INSIDE                 │
│ A RAG SYSTEM?                  │
│                                │
│ Query → Embed → Vector DB      │
│               ↓                │
│          Context → LLM         │
│                                │
│ dataentropy                    │
└────────────────────────────────┘
```

---

# 30. LinkedIn Assets

Recommended masters:

```text
Company logo: 400 × 400
Company cover: 4200 × 700
Link visual: 1200 × 627
Portrait post: 1080 × 1350
Square post: 1080 × 1080
```

Cover copy recipe:

```text
DataEntropy

LEARN. BUILD. TRANSFORM.

Practical Learning for Data, AI & Engineering

[Data] [AI] [Engineering] [Career]
```

Keep important content centered.

---

# 31. Facebook Assets

Recommended masters:

```text
Profile: 1024 × 1024
Cover working master: 1640 × 624
Portrait feed: 1080 × 1350
Square feed: 1080 × 1080
Story: 1080 × 1920
```

Profile image:

- DE monogram only
- high contrast
- no small tagline

---

# 32. YouTube Brand System

Channel avatar:

```text
1024 × 1024
```

Use:

- DE monogram
- simple background
- no tagline

Channel banner:

```text
2560 × 1440
```

Preferred copy:

```text
DataEntropy

LEARN • BUILD • TRANSFORM

Data Analytics • AI Engineering • Data Engineering
Software Engineering • Career
```

Keep critical elements centered.

---

# 33. YouTube Thumbnail System

Master:

```text
3840 × 2160
16:9
```

Formula:

```text
Category
+
3–6 word headline
+
one strong visual
+
small DE brand marker
```

Headline examples:

- WHY RAG MATTERS
- BUILD YOUR FIRST AGENT
- STOP USING HUGE PROMPTS
- SQL WINDOW FUNCTIONS
- HOW VECTOR SEARCH WORKS
- RAG VS FINE-TUNING

Do not use paragraphs.

---

# 34. Thumbnail Composition

Headline:

`25–45%`

Technical visual:

`35–55%`

Brand marker:

`5–10%`

Use:

- large bold type
- high contrast
- one diagram
- one chart
- one code element
- one system visual

Avoid:

- small code
- many objects
- tiny logos
- clutter
- irrelevant human faces
- clickbait expressions
- generic AI robots

---

# 35. Topic-Specific Thumbnail Variants

AI:

`navy + purple`

Data Engineering:

`blue + cyan`

Analytics:

`white + blue`

Software Engineering:

`indigo + navy`

Career:

`blue/purple + amber accent`

All variants retain the DE brand identity.

---

# 36. eBook Cover System

Digital:

```text
1600 × 2560
```

A4 print:

```text
2480 × 3508
300 DPI
```

Cover hierarchy:

1. Logo
2. Category
3. Large title
4. Subtitle
5. Technical visual
6. Author / DataEntropy
7. Tagline / URL

Example:

```text
DE

THE PRACTICAL
GUIDE TO

RAG
SYSTEMS

Architecture
Retrieval
Evaluation
Production

DataEntropy
```

Keep editorial and premium.

---

# 37. eBook Interior

Fonts:

- Heading: Plus Jakarta Sans
- Body: Inter
- Code: JetBrains Mono

Print sizing:

```text
H1: 30–34pt
H2: 22–24pt
H3: 16–18pt
Body: 10.5–11pt
Caption: 8.5–9pt
Code: 9–10pt
```

Reusable callouts:

- KEY INSIGHT
- TECHNICAL NOTE
- COMMON MISTAKE
- ARCHITECTURE
- EXAMPLE
- TRY IT YOURSELF
- INTERVIEW QUESTION
- PRODUCTION TIP

---

# 38. Presentation / Webinar System

Canvas:

```text
1920 × 1080
16:9
```

Slide types:

- Title
- Agenda
- Concept
- Diagram
- Comparison
- Code
- Architecture
- Case Study
- Demo
- Insight
- Summary
- Q&A

Rules:

- one key message per slide
- minimal text
- large title
- strong visual
- blue/purple accents
- white or navy background

Recommended body text maximum:

`35–55 words per slide`

---

# 39. Course Cover

Master:

```text
1600 × 900
```

Required:

- DE logo
- category
- title
- level
- technical visual
- optional technology labels

Example:

```text
AI ENGINEERING

BUILD PRODUCTION
RAG SYSTEMS

Intermediate

Python · Vector DB · LLM · Evaluation

DataEntropy
```

---

# 40. Certificate System

Landscape:

```text
3508 × 2480
300 DPI
```

Include:

- DataEntropy logo
- certificate title
- learner name
- course name
- completion date
- certificate ID
- signature
- minimal technical line motif

Avoid ornate classical borders.

---

# 41. Diagram Language

Canonical shapes:

```text
User / Input        → rounded rectangle
Application         → rectangle
Database            → cylinder
Model               → hexagon
External API        → outlined rounded rectangle
Queue/Event         → pill / stacked block
Data flow           → solid arrow
Async flow          → dashed arrow
AI output           → purple outline
External system     → gray outline
```

Example:

```text
USER
  ↓
APP
  ↓
RETRIEVER ─────→ VECTOR DB
  ↓
CONTEXT
  ↓
LLM
  ↓
ANSWER
```

Suggested colors:

- user: slate
- application: blue
- database/data: cyan
- AI/model: purple
- output: indigo
- external: gray

---

# 42. Icon System

Use:

- outline icons
- 2px stroke
- rounded corners
- simple geometry
- minimal detail

Containers:

```text
40 × 40
48 × 48
64 × 64
```

Preferred treatment:

- blue line
- purple secondary accent
- soft blue background

Never mix with:

- cartoon icons
- glossy icons
- 3D icons
- skeuomorphic icons

---

# 43. Illustration System

Use combinations of:

- grid
- nodes
- chart
- terminal
- code
- vector
- database
- pipeline
- architecture
- connected particles
- system blocks

Design principle:

> Technical documentation made beautiful.

---

# 44. Background Motifs

Allowed:

- low-opacity node network
- technical grid
- particles
- thin blueprint lines
- data wave
- matrix
- architecture skeleton

Opacity:

`2%–8%`

Never overpower foreground content.

---

# 45. Photography Rules

Use people sparingly.

Preferred:

- clean background
- natural skin tones
- soft lighting
- realistic engineering environment
- neutral clothing
- minimal background distractions

Do not:

- tint faces purple/blue
- add fake holograms
- use generic corporate-office stock photos as core identity
- over-process

---

# 46. Code Block Style

Light:

```css
background: #F8FAFC;
border: 1px solid #E2E8F0;
color: #0F172A;
```

Dark:

```css
background: #07111F;
border: 1px solid #1E293B;
color: #E2E8F0;
```

Use JetBrains Mono.

---

# 47. Chart Style

Charts should use:

- minimal gridlines
- concise axes
- direct labels
- minimal legend
- DataEntropy blue for primary series
- purple for secondary series
- cyan for data/engineering comparison
- amber only for highlight/warning

Avoid rainbow palettes.

---

# 48. Social Carousel Recipe

Recommended 10-slide structure:

1. Hook
2. Problem
3. Concept
4. How it works
5. Diagram
6. Example
7. Common mistake
8. Practical takeaway
9. Summary
10. CTA

Maintain on every slide:

- same logo position
- same category position
- same grid
- same page-number treatment

---

# 49. CTA Language

Preferred:

- Explore the Course
- Learn More
- Build This Project
- Read the Guide
- Watch the Full Lesson
- Start Learning
- See the Architecture
- Try It Yourself
- Save for Later
- Follow DataEntropy

Avoid:

- Become a Genius
- Master AI Overnight
- Guaranteed Job
- Secret Hack
- 10X Your Career Instantly

---

# 50. Content Voice

Write like:

- experienced technical educator
- practical engineer
- system designer
- helpful mentor

Tone:

- confident
- clear
- concise
- grounded
- technically accurate

Avoid:

- fake urgency
- exaggerated claims
- unnecessary jargon
- motivational fluff
- excessive emojis
- misleading clickbait

---

# 51. Headline Patterns

Preferred:

```text
How [Technology] Actually Works
Build [System] From Scratch
Why [Concept] Matters
[Technology] in Production
The Practical Guide to [Topic]
[Concept] Explained Visually
[Technology A] vs [Technology B]
Stop Doing [Bad Practice]
Designing [System] for Scale
From [Input] to [Outcome]
```

---

# 52. Base Image Generation Prompt

Use this as the default visual-generation instruction:

```text
Create a clean, modern technical illustration for DataEntropy,
a practical Data, AI and Software Engineering learning platform.

Brand palette:
deep blue #274D98,
indigo #6261B1,
purple #9574C6,
white #FFFFFF,
dark navy #0F172A.

Visual language:
minimal technical diagrams,
data nodes,
structured grids,
architecture blocks,
subtle particles,
clean line icons,
high whitespace,
engineering-focused hierarchy.

Style:
premium educational technology,
modern,
technical,
minimal,
precise.

Avoid:
cyberpunk,
cartoon styling,
generic AI robots,
glowing brains,
excessive neon,
futuristic stock imagery.

Use blue as the dominant brand color and purple only as a controlled accent.
```

---

# 53. Social Image Prompt Template

```text
Create a DataEntropy educational social post.

Canvas:
1080 × 1350 portrait.

Topic:
[TOPIC]

Headline:
[HEADLINE]

Supporting text:
[TEXT]

Primary visual:
[DIAGRAM / CHART / CODE / ARCHITECTURE]

Brand:
DataEntropy
LEARN. BUILD. TRANSFORM.

Palette:
#274D98
#6261B1
#9574C6
#FFFFFF
#0F172A

Style:
clean technical education,
high whitespace,
large readable typography,
modern engineering diagrams,
subtle grid or node background,
minimal decoration.

Do not use:
robots,
glowing brains,
stock AI imagery,
cyberpunk styling,
excessive neon,
crowded layouts.
```

---

# 54. YouTube Thumbnail Prompt Template

```text
Create a premium DataEntropy YouTube thumbnail.

Canvas:
3840 × 2160
16:9

Headline:
[3–6 WORD HEADLINE]

Category:
[CATEGORY]

Primary visual:
[ONE STRONG TECHNICAL VISUAL]

Use:
dark navy background,
large white typography,
DataEntropy blue #274D98,
purple #9574C6 as controlled accent,
one simplified architecture/code/data visual,
small DE branding.

Style:
high contrast,
clean,
technical,
modern,
premium,
readable at mobile size.

Avoid:
small text,
paragraphs,
too many objects,
generic AI robots,
clickbait faces,
overloaded visual effects.
```

---

# 55. eBook Prompt Template

```text
Design a professional DataEntropy eBook cover.

Title:
[TITLE]

Subtitle:
[SUBTITLE]

Category:
[CATEGORY]

Technical visual:
[VISUAL]

Palette:
#274D98
#6261B1
#9574C6
#FFFFFF
#0F172A

Style:
technical editorial design,
premium engineering education,
large typography,
clean hierarchy,
minimal diagrammatic visual,
strong whitespace.

Brand:
DataEntropy
LEARN. BUILD. TRANSFORM.
```

---

# 56. Presentation Prompt Template

```text
Create a DataEntropy presentation slide.

Slide type:
[TYPE]

Title:
[TITLE]

Key message:
[KEY MESSAGE]

Supporting content:
[CONTENT]

Visual:
[DIAGRAM / CODE / CHART / COMPARISON]

Format:
1920 × 1080
16:9

Style:
modern technical education,
clean white or dark navy background,
DataEntropy blue #274D98,
purple #9574C6,
high whitespace,
large title,
minimal text,
one primary visual.
```

---

# 57. Website UI Prompt Template

```text
Design a DataEntropy website component.

Component:
[COMPONENT]

Purpose:
[PURPOSE]

Content:
[CONTENT]

Typography:
Plus Jakarta Sans for headings,
Inter for body/UI,
JetBrains Mono for technical labels.

Colors:
Primary #274D98
Accent #9574C6
Text #0F172A
Muted #475569
Border #E2E8F0
Background #FFFFFF

Radius:
16px cards
12px controls

Style:
minimal,
premium,
technical,
structured,
accessible,
responsive.

Avoid:
excessive gradients,
glassmorphism,
heavy shadows,
decorative clutter.
```

---

# 58. File Naming Convention

Pattern:

```text
de_[asset]_[topic]_[variant]_[size]_v01.ext
```

Examples:

```text
de_logo_primary_gradient_v01.svg
de_social_rag_tutorial_1080x1350_v01.png
de_youtube_rag-matters_3840x2160_v02.png
de_ebook_rag-systems_cover_v01.png
de_web_course-card_light_v01.png
de_web_og_home_1200x630_v01.png
```

Rules:

- lowercase filenames
- use hyphens within topic names
- use underscores between metadata groups
- version every final asset

---

# 59. Recommended Folder Structure

```text
dataentropy-brand/
│
├── 01-logo/
│   ├── primary/
│   ├── monochrome/
│   ├── icon/
│   └── favicon/
│
├── 02-tokens/
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   ├── tokens.json
│   ├── globals.css
│   └── tailwind-theme.ts
│
├── 03-web/
│   ├── ui/
│   ├── illustrations/
│   ├── icons/
│   ├── og/
│   └── favicons/
│
├── 04-social/
│   ├── facebook/
│   ├── linkedin/
│   ├── instagram/
│   ├── carousel/
│   └── templates/
│
├── 05-youtube/
│   ├── avatar/
│   ├── banner/
│   └── thumbnails/
│
├── 06-ebook/
│   ├── covers/
│   ├── interior/
│   ├── diagrams/
│   └── callouts/
│
├── 07-course/
│   ├── covers/
│   ├── lessons/
│   ├── worksheets/
│   └── certificates/
│
├── 08-presentations/
│   ├── webinar/
│   ├── workshop/
│   ├── corporate/
│   └── diagrams/
│
└── 09-guidelines/
    └── DataEntropy_SKILL.md
```

---

# 60. Asset Master Dimensions

| Asset | Master Size |
|---|---:|
| Favicon source | 512 × 512 |
| App/social avatar | 1024 × 1024 |
| OG image | 1200 × 630 |
| Social square | 1080 × 1080 |
| Social portrait | 1080 × 1350 |
| Story/Reel | 1080 × 1920 |
| LinkedIn company logo | 400 × 400 |
| LinkedIn company cover | 4200 × 700 |
| LinkedIn link image | 1200 × 627 |
| Facebook profile | 1024 × 1024 |
| Facebook cover working master | 1640 × 624 |
| YouTube banner | 2560 × 1440 |
| YouTube thumbnail | 3840 × 2160 |
| Course cover | 1600 × 900 |
| Webinar slide | 1920 × 1080 |
| Presentation slide | 1920 × 1080 |
| eBook cover | 1600 × 2560 |
| A4 print page | 2480 × 3508 |
| Certificate | 3508 × 2480 |

Platform requirements may change. Before production for a platform-specific campaign, verify current platform specifications.

---

# 61. Full CSS Starter

```css
:root {
  /* Core */
  --de-blue: #274D98;
  --de-indigo: #6261B1;
  --de-purple: #9574C6;
  --de-lilac: #AF9FDA;
  --de-periwinkle: #C4CBF7;

  /* Neutral */
  --de-white: #FFFFFF;
  --de-slate-50: #F8FAFC;
  --de-slate-100: #F1F5F9;
  --de-slate-200: #E2E8F0;
  --de-slate-300: #CBD5E1;
  --de-slate-400: #94A3B8;
  --de-slate-500: #64748B;
  --de-slate-600: #475569;
  --de-slate-700: #334155;
  --de-slate-800: #1E293B;
  --de-slate-900: #0F172A;
  --de-dark-bg: #07111F;

  /* Semantic */
  --de-bg: #FFFFFF;
  --de-bg-subtle: #F8FAFC;
  --de-surface: #FFFFFF;
  --de-text: #0F172A;
  --de-text-secondary: #475569;
  --de-text-muted: #64748B;
  --de-border: #E2E8F0;
  --de-border-strong: #CBD5E1;

  /* Functional */
  --de-success: #16A34A;
  --de-warning: #D97706;
  --de-danger: #DC2626;
  --de-info: #0284C7;

  /* Gradient */
  --de-gradient:
    linear-gradient(
      110deg,
      #274D98 0%,
      #6261B1 48%,
      #9574C6 100%
    );

  /* Radius */
  --de-radius-xs: 6px;
  --de-radius-sm: 8px;
  --de-radius-md: 12px;
  --de-radius-lg: 16px;
  --de-radius-xl: 24px;
  --de-radius-2xl: 32px;
  --de-radius-full: 9999px;

  /* Shadow */
  --de-shadow-xs:
    0 1px 2px rgba(15,23,42,.05);

  --de-shadow-sm:
    0 4px 12px rgba(15,23,42,.06);

  --de-shadow-md:
    0 12px 32px rgba(15,23,42,.10);

  --de-shadow-brand:
    0 16px 50px rgba(98,97,177,.18);

  /* Motion */
  --de-duration-fast: 150ms;
  --de-duration-default: 220ms;
  --de-duration-slow: 360ms;
  --de-easing: cubic-bezier(.2,.8,.2,1);
}
```

---

# 62. Token JSON Starter

```json
{
  "brand": {
    "name": "DataEntropy",
    "tagline": "LEARN. BUILD. TRANSFORM."
  },
  "color": {
    "primary": "#274D98",
    "indigo": "#6261B1",
    "accent": "#9574C6",
    "lilac": "#AF9FDA",
    "periwinkle": "#C4CBF7",
    "background": "#FFFFFF",
    "surfaceMuted": "#F8FAFC",
    "text": "#0F172A",
    "textSecondary": "#475569",
    "textMuted": "#64748B",
    "border": "#E2E8F0",
    "borderStrong": "#CBD5E1",
    "darkBackground": "#07111F"
  },
  "radius": {
    "xs": 6,
    "sm": 8,
    "md": 12,
    "lg": 16,
    "xl": 24,
    "2xl": 32,
    "full": 9999
  },
  "motion": {
    "fast": 150,
    "base": 220,
    "slow": 360
  }
}
```

---

# 63. Tailwind Theme Starter

```ts
export const dataEntropyTheme = {
  colors: {
    de: {
      blue: "#274D98",
      indigo: "#6261B1",
      purple: "#9574C6",
      lilac: "#AF9FDA",
      periwinkle: "#C4CBF7",
      dark: "#07111F",
      text: "#0F172A",
      muted: "#64748B",
      border: "#E2E8F0"
    }
  },
  borderRadius: {
    deSm: "8px",
    deMd: "12px",
    deLg: "16px",
    deXl: "24px"
  },
  boxShadow: {
    deSm: "0 4px 12px rgba(15,23,42,.06)",
    deMd: "0 12px 32px rgba(15,23,42,.10)",
    deBrand: "0 16px 50px rgba(98,97,177,.18)"
  }
};
```

---

# 64. Deterministic Reproduction Procedure

Whenever creating a new DataEntropy asset, follow this exact order.

## Step 1 — Identify asset type

Choose one:

- website
- social post
- social carousel
- YouTube
- eBook
- presentation
- webinar
- course
- certificate
- diagram
- marketing
- OG image

## Step 2 — Select canvas

Use the canonical dimensions in this skill.

## Step 3 — Choose light or dark mode

Default:

- light for documentation and educational content
- dark for video, AI-heavy, launch, and premium marketing content

## Step 4 — Apply grid

Use:

- 4px base spacing
- strong outer margins
- consistent alignment
- no floating arbitrary placement

## Step 5 — Add brand marker

Choose:

- DE icon
- horizontal DataEntropy lockup
- DataEntropy wordmark

Do not use multiple logo lockups unnecessarily.

## Step 6 — Add category label

Use small uppercase text.

Example:

`AI ENGINEERING`

## Step 7 — Add one primary message

The headline must visually dominate.

## Step 8 — Add one primary visual

Choose one:

- architecture
- chart
- code
- flow
- comparison
- system
- illustration

Never combine many unrelated visuals.

## Step 9 — Add controlled blue/purple accents

Blue should dominate.

Purple should accent.

## Step 10 — Check whitespace

If the design feels crowded, remove elements before shrinking text.

## Step 11 — Check mobile readability

For social or thumbnail assets, simulate viewing at 20–25% scale.

## Step 12 — Run QA checklist

Do not export until all checks pass.

---

# 65. Brand QA Checklist

Before finalizing any DataEntropy visual confirm:

### Identity
- [ ] Brand spelling is exactly `DataEntropy`
- [ ] DE logo proportions are unchanged
- [ ] Tagline is correct where used
- [ ] Brand colors are correct

### Layout
- [ ] Strong alignment
- [ ] Adequate whitespace
- [ ] One primary message
- [ ] One primary visual
- [ ] No visual clutter

### Typography
- [ ] Heading uses approved style
- [ ] Body is readable
- [ ] Code uses monospace
- [ ] No more than 3 competing text sizes

### Color
- [ ] Blue is dominant
- [ ] Purple is controlled
- [ ] Contrast is sufficient
- [ ] Semantic colors are not decorative

### Visual Language
- [ ] Technical rather than generic AI
- [ ] Diagram/icon style is consistent
- [ ] No random 3D/cartoon imagery
- [ ] Background motifs are subtle

### Platform
- [ ] Canvas dimensions are correct
- [ ] Safe zones considered
- [ ] Text readable at destination size
- [ ] Export format is correct

### Tone
- [ ] No misleading claims
- [ ] No generic clickbait
- [ ] Practical value is clear

---

# 66. Export Standards

## Web

Use:

- SVG for logos/icons
- WebP or AVIF for photography/illustration when supported
- PNG for transparency-sensitive raster graphics

Prefer optimized assets.

---

## Social

Use:

- PNG for graphics with text
- JPEG only for photography-heavy compositions
- sRGB color profile

---

## YouTube

Use:

- high-resolution PNG/JPEG
- 16:9
- high contrast
- verify text at small preview size

---

## Print / eBook

Use:

- 300 DPI for print
- PDF for delivery
- SVG/PDF vector diagrams where possible
- embedded or properly licensed fonts
- safe margins

---

# 67. Accessibility

Minimum requirements:

- readable contrast
- do not communicate meaning by color alone
- text over images must have sufficient contrast
- diagrams require labels
- chart series should use color + shape/label where necessary
- avoid tiny text
- do not place essential copy over high-noise visuals

For website UI:

- target WCAG AA contrast
- preserve keyboard focus states
- maintain visible hover/focus distinction
- do not remove semantic labels for visual simplicity

---

# 68. Brand Anti-Patterns

Reject or redesign an output if it has:

- incorrect spelling
- excessive purple
- excessive gradient use
- random neon
- cyberpunk styling
- generic robot imagery
- glowing AI brain
- cartoonish tech illustration
- glassmorphism everywhere
- excessive shadows
- many unrelated font styles
- excessive rounded pill UI
- weak hierarchy
- tiny social-post text
- too much copy
- logo stretched or modified
- rainbow charts
- unrelated stock photography
- excessive decorative icons
- low contrast
- inconsistent diagram shapes

---

# 69. Fast Reproduction Presets

## Preset A — Clean Educational Post

```text
Canvas: 1080×1350
Background: #FFFFFF
Headline: #0F172A
Accent: #274D98
Secondary accent: #9574C6
Diagram: blue + purple + slate
Logo: top-left
Category: top-right or under logo
URL: bottom-left
Style: high whitespace
```

## Preset B — Dark YouTube

```text
Canvas: 3840×2160
Background: #07111F
Headline: white
Primary accent: #7398DE
Secondary accent: #B89BDC
Visual: one architecture/code visual
Logo: small top-right
Style: high contrast
```

## Preset C — Technical eBook

```text
Canvas: 1600×2560
Background: #FFFFFF or #07111F
Title: large Plus Jakarta Sans
Diagram: minimal
Accent line: blue→purple
Logo: top
Author/brand: bottom
```

## Preset D — Webinar Slide

```text
Canvas: 1920×1080
Background: #FFFFFF
Title: #0F172A
Diagram: center/right
Accent: #274D98
Purple: small highlight
Footer: DE + section label
```

## Preset E — Website Card

```text
Background: #FFFFFF
Border: #E2E8F0
Radius: 16px
Padding: 24px
Title: Plus Jakarta Sans 600
Body: Inter
Icon: 48px outline
Hover: translateY(-4px)
Shadow: shadow-sm
```

---

# 70. Final Rule

When uncertain, choose the option that is:

1. More structured
2. More technical
3. More readable
4. More minimal
5. More useful
6. Less decorative

The strongest DataEntropy assets should look like:

> **Modern technical documentation, transformed into premium educational media.**
