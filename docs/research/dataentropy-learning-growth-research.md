# DataEntropy learning, engagement, UI/UX, and conversion research

**Prepared:** 30 August 2026
**Scope:** Product research and repository audit for the DataEntropy LMS
**Method:** Primary research papers, government/standards guidance, and first-party platform research only. Product recommendations are explicitly marked as inferences and should be validated with DataEntropy learners.

## Executive recommendation

DataEntropy should compete on a simple promise: **help an aspiring data professional choose the right next skill, practise it in realistic work, remember it, and produce credible evidence of mastery.** The existing product already has many of the right building blocks—role-based journeys, topic pages, practice, progressive hints, checkpoints, XP, streaks, certificates, public profiles, course offers, and funnel events. The next step is not more surface area. It is to connect those pieces into one measurable learning loop:

> Goal → short explanation → worked example → independent attempt → specific feedback → scheduled review → applied challenge → evidence of mastery

The highest-priority work is:

1. Fix measurement and trust issues before optimizing conversion.
2. Replace the generic first visit with an outcome-first diagnostic and instant recommended plan.
3. Standardize study material around worked examples, retrieval, feedback, and later review.
4. Add a spaced, mixed-practice “Review due” queue and meaningful course progress.
5. Make streaks forgiving, reminders opt-in, and community support structured.
6. Establish WCAG 2.2 AA and real-user mobile performance baselines.

The north-star metric should combine engagement with learning:

> **Weekly successful learners:** unique learners who complete at least one full learning loop this week and correctly retrieve or apply the concept again after a delay.

This avoids optimizing clicks, watch time, XP, or purchases while actual learning stagnates.

## What exists today

This is a code-level audit, not a moderated usability study. The observations below are evidence about the implementation; the interpretation is a product inference.

### Strong foundations to preserve

- The landing page presents four clear product areas and keeps the primary CTA focused on practice ([`src/pages/Index.tsx`](../../src/pages/Index.tsx)).
- The Career Prep dashboard shows plan progress, one clear continuation action, a daily challenge, retries, a question library, XP, a level, and a streak ([`JourneyPanel.tsx`](../../src/components/careerprep/JourneyPanel.tsx)).
- Career Prep permits anonymous learning before profile claiming, and journey choice, topic progress, and contextual offers are already connected. This low-friction access is worth preserving ([`AuthContext.tsx`](../../src/contexts/AuthContext.tsx), [`JourneyOffers.tsx`](../../src/components/careerprep/JourneyOffers.tsx)).
- Topic pages combine explanation, practice, case studies, a checkpoint, references, next-topic navigation, and optional paid/free extensions ([`TopicPage.tsx`](../../src/pages/TopicPage.tsx)).
- The SQL workspace records correct and incorrect attempts, progressively reveals hints, and reveals a solution after repeated failure ([`SQLChallenge.tsx`](../../src/pages/SQLChallenge.tsx)).
- Wrong checkpoint answers do not erase progress or block learning, and the concept explanation is reopened before a retry ([`CheckpointDialog.tsx`](../../src/components/careerprep/CheckpointDialog.tsx)).
- Heavy route code—including Monaco and PGlite—is lazy-loaded, and YouTube lesson embeds are created only after a learner presses play. These are good performance choices ([`App.tsx`](../../src/App.tsx), [`CourseDetails.tsx`](../../src/pages/CourseDetails.tsx)).
- Funnel stages and an admin dashboard already exist, which makes a better measurement model an incremental change rather than a greenfield project ([`funnel.ts`](../../src/services/funnel.ts), [`FunnelDashboard.tsx`](../../src/components/admin/FunnelDashboard.tsx)).

### Material gaps and risks

| Finding from the repository | Product inference | Priority |
|---|---|---:|
| The journey is linear and has “daily” and “next up” items, but there is no recall-based, due-date review scheduler. | Completion can rise while durable retention remains unknown. | P0 |
| Course enrollment exists, but the course experience does not show durable per-lesson completion, resume state, or mastery. | A learner can buy or unlock a course without a strong reason to return to the exact next lesson. | P0 |
| The funnel declares `arrived → engaged → solved → identified → committed → returned → enrolled`, but several stages are not visibly wired from learner actions; `returned` fires on every lobby visit, including the first, while `arrived` is lifetime-once in local storage. Page duration is only logged to the console. | Current conversion and retention rates can be misleading and cannot support reliable experiments. | P0 |
| A course with no rating displays `4.8`, and its displayed review count is calculated as `floor(student_count × 0.82)` rather than from approved reviews. | This is synthetic social proof. It creates a trust and regulatory risk and must be removed, not A/B tested. | P0 |
| Catalog cards display “Limited seat available” without checking observed capacity, and free cards use a continuously animated “FREE” treatment. | The scarcity statement is unsubstantiated and should be removed; continuous attention capture is unnecessary. | P0 |
| Free course enrollment asks for name and email, plus optional WhatsApp and required profession and institute. Paid enrollment adds payment method and transaction ID. | The form asks for data before proving enough value and likely creates avoidable abandonment, especially on mobile. | P0 |
| The journey ebook offer requires both email and a Bangladesh-format phone number for an instant file, and relies on placeholders instead of persistent labels. | This asks for more personal data than the immediate action appears to require and is harder to understand/access after typing begins. | P0 |
| Selecting a payment method starts a countdown. | Even if backed by a real reservation/payment window, it can feel like pressure unless the consequence and reason are disclosed before it starts. | P0 |
| Many learner-facing labels are 10px; some compact controls are below comfortable touch size; the SQL workspace uses full-viewport nested overflow. | Readability, zoom, keyboard focus, and small-screen usability need manual testing rather than assuming responsive classes are sufficient. | P0 |
| Course search and course-review inputs use placeholders without persistent visible labels. | Form purpose and error recovery are weaker for screen-reader, cognitive, and autofill use. | P0 |
| The landing message is broad (“real-world confidence”), offers four paths immediately, and presents inventory counts rather than a concrete learner outcome or sample artifact. | New visitors must decide what product they need before DataEntropy has learned their goal. | P1 |
| Checkpoints are one multiple-choice item and immediately reveal the correct option. | They are useful formative checks but too thin to be treated as strong mastery evidence by themselves. | P1 |
| XP, levels, and a strict daily streak are prominent. | These can motivate return, but may displace mastery goals or punish a learner for missing one day. | P1 |
| Offers appear in the journey and topic experience, but conversion tracking does not provide a complete impression → click → checkout → paid/verified chain. | Offer performance and true purchase conversion cannot be attributed cleanly. | P1 |
| `offer_shown` and `enrolled` exist in the funnel event type, but the audited learner code does not emit them. | The funnel can display a taxonomy that the underlying implementation cannot populate reliably. | P0 |
| Public sharing and profiles exist, but there is no structured lesson-scoped Q&A or accountability flow. | Social features can help only if they solve a concrete learner problem; a generic feed or chat is not justified. | P2 |

## Evidence and product implications

### 1. Study-material effectiveness

#### Retrieval practice

**Evidence.** In two experiments using educationally relevant prose, Roediger and Karpicke found that taking recall tests led to substantially better retention after two days and one week than repeated study, even though repeated study increased learners’ confidence ([paper](https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x)). The U.S. Institute of Education Sciences recommends using active-retrieval quizzes throughout learning and using tests to identify what needs more study ([IES practice guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/1)).

**DataEntropy inference.** Every topic and lesson should end with two to four retrieval prompts, not just recognition:

- “Write the query from a blank editor.”
- “Predict the result before running it.”
- “Explain why this join duplicates rows.”
- “Choose a method, then justify why the alternatives do not fit.”

Checkpoint MCQs can remain, but should be paired with short-answer, code, or result-prediction prompts. Do not award completion merely for opening a page or video.

**Caveat.** Retrieval effects vary with question quality, feedback, prior knowledge, and content. A quiz is not automatically good retrieval practice.

#### Spacing and interleaving

**Evidence.** Cepeda and colleagues studied more than 1,350 participants with review gaps up to 3.5 months and final tests up to one year. Review timing interacted with the desired retention period; no single interval was optimal for every goal ([paper](https://pubmed.ncbi.nlm.nih.gov/19076480/)). In a controlled study, interleaving different mathematics problem types hurt practice-session performance but doubled next-day test scores relative to blocked practice, apparently by improving selection of the right procedure ([Taylor & Rohrer](https://onlinelibrary.wiley.com/doi/10.1002/acp.1598)). IES recommends delayed review and a “sprinkling” of earlier material in later work ([full practice guide](https://ies.ed.gov/ncee/WWC/Docs/PracticeGuide/20072004.pdf)).

**DataEntropy inference.** Add a “Review due” queue that:

1. schedules a first review after initial success;
2. expands or shortens the interval based on later recall;
3. mixes SQL, Python, analytics, and case-identification items only after each has been introduced;
4. prioritizes failed and high-value interview concepts;
5. lets a learner postpone without losing status.

Start with simple intervals such as 1, 3, 7, 14, and 30 days, then learn from DataEntropy outcomes. Do not present these as scientifically universal intervals.

**Caveat.** Much spacing evidence concerns facts, and much interleaving evidence concerns mathematics. Applied data work should be tested separately with delayed and transfer tasks.

#### Worked examples, fading, and cognitive load

**Evidence.** Worked examples are particularly useful during novice skill acquisition; learners can study the procedure instead of consuming working memory searching blindly. Benefits can weaken or reverse as expertise increases ([Sweller & Cooper](https://doi.org/10.1207/s1532690xci0201_3)). IES recommends alternating worked solutions with attempts. Mayer’s multimedia-learning research supports removing extraneous material, combining relevant verbal and visual representations, and segmenting complex explanations into learner-paced units ([paper](https://doi.org/10.1111/j.1365-2923.2010.03624.x)).

**DataEntropy inference.** Adopt one authoring template across topics, courses, SQL challenges, and case studies:

1. **Outcome:** one observable skill and why it matters in a job.
2. **Mental model:** a concise explanation plus one relevant diagram/table.
3. **Worked example:** input, reasoning, annotated steps, and output.
4. **Faded example:** remove one or two steps for the learner.
5. **Independent attempt:** a new context, no copied surface details.
6. **Feedback:** misconception, clue, correction, and next action.
7. **Later review:** one related and one mixed item after a delay.

For experienced learners, provide “skip explanation and prove it” so worked examples do not become redundant.

#### Feedback

**Evidence.** Feedback can improve or harm learning depending on its form. Hattie and Timperley’s synthesis organizes useful feedback around: Where am I going? How am I going? What should I do next? Task- and process-focused feedback is generally more useful than praise about the person ([paper](https://doi.org/10.3102/003465430298487)). Corrective feedback also reduces the risk that multiple-choice distractors teach false information ([Butler et al.](https://pubmed.ncbi.nlm.nih.gov/18491500/)).

**DataEntropy inference.** Upgrade SQL and checkpoint feedback from “wrong + answer/highlight” to:

- the detected misconception or failed test category;
- the smallest useful clue;
- an annotated difference between submitted and expected output;
- a link to the exact concept subsection;
- an isomorphic retry before the full solution;
- one later transfer item.

Keep the existing progressive-hint approach, but measure **success after hint level**, **success on the next related item**, and **solution-copy dependency**, not merely total attempts.

#### Video and text materials

**Evidence.** An analysis of 6.9 million edX video-viewing sessions found that shorter, online-native, informal, and drawing-based videos were associated with more viewing engagement than repurposed classroom lectures ([Guo, Kim & Rubin](https://doi.org/10.1145/2556325.2566239)). This was observational and measured engagement rather than learning.

**DataEntropy inference.** Use short videos—usually one concept or worked problem—followed immediately by retrieval or application. Always add a transcript, captions, playback speed, code/query text, expected output, and a text alternative. Watch time must never be the sole completion criterion.

### 2. Engagement and retention

#### Progress and goals

**Evidence.** A meta-analysis of 138 randomized studies found that monitoring progress improved goal attainment, with larger effects when progress was recorded or reported ([Harkin et al.](https://eprints.whiterose.ac.uk/id/eprint/91437/)).

**DataEntropy inference.** Keep the existing journey progress bar and single “Continue” action, but make progress evidence-rich:

- goal: “Become interview-ready for data analyst SQL”;
- weekly plan: two sessions or 45 minutes, chosen by the learner;
- mastered skills and skills needing review;
- review items due;
- next concrete action and estimated time;
- portfolio artifacts, case studies, or certificates earned.

Topic count and XP should remain secondary. A percentage without the underlying evidence can create false confidence.

#### Streaks without guilt

**Evidence.** Duolingo’s first-party A/B test found that separating the streak from a demanding daily goal increased Day-14 retention by 3.3% and reduced the barrier to habit formation, although fewer learners completed the larger daily goals ([Duolingo experiment](https://blog.duolingo.com/improving-the-streak/)). Another experiment found that a weekend break mechanism improved later return and reduced streak loss ([Duolingo experiment](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)). These are platform-specific engagement results, not evidence of mastery.

**DataEntropy inference.** Replace the strict daily streak as the primary status with “sessions this week” or a consistency goal. Add a pause/freeze, protect learners from system outages, and celebrate returning after a gap. Never use loss copy such as “You failed your streak.” Keep XP private by default and do not add a public leaderboard without a clear learner benefit.

#### Notifications

**Evidence.** Duolingo’s production research shows personalized notification scheduling can improve daily active use and new-user retention over a strong baseline ([KDD paper](https://research.duolingo.com/papers/yancey.kdd20.pdf)). A randomized study of reminders also found a possible dependency effect: reminders increased study on reminder days while reminded learners became less likely to study on non-reminder days ([Nobbe et al.](https://pubmed.ncbi.nlm.nih.gov/38906868/)).

**DataEntropy inference.** Reminders should be:

- opt-in, with channel, days, quiet hours, and frequency controls;
- attached to a learner-chosen study plan or an actually due review;
- specific: “Three 5-minute SQL review items are ready,” not “We miss you”;
- suppressed after completion and capped;
- evaluated on completed review and later recall, not sends or opens.

Start with email or WhatsApp only where the learner explicitly requests it. Do not treat a phone number supplied for payment as marketing consent.

#### Community and accountability

**Evidence.** In an 8-module randomized trial, adding a WeChat learning community did not significantly improve knowledge or satisfaction; some learners valued shared questions, while others muted excessive messages or feared public participation ([Zhu et al.](https://www.nature.com/articles/s41599-024-03719-6)). Duolingo reports that learners with at least one Friend Streak were more likely to complete a daily lesson, but that result is observational and does not prove causality or learning ([first-party report](https://blog.duolingo.com/product-lessons-friend-streak/)).

**DataEntropy inference.** Do not build a generic feed. Pilot:

- lesson-scoped Q&A with answered/unanswered states;
- weekly mentor office hours;
- optional two-to-five-person accountability cohorts;
- a private-question option and pseudonyms;
- weekly digests instead of chat-volume notifications;
- peer review only with a rubric and examples.

Measure resolved questions, helpfulness, learner safety, participation inequality, course return, and learning—not message count.

### 3. Onboarding and conversion

#### Value proposition and activation

**Evidence/guidance.** The GOV.UK start-page pattern recommends telling users what a service does, whether it meets their need, relevant prerequisites/time/cost, and providing one action-consistent start point ([pattern](https://design-system.service.gov.uk/patterns/start-using-a-service/)). This is high-quality public-service guidance, not a DataEntropy conversion experiment.

**DataEntropy inference.** Reframe the landing page around one target user and one activation event:

> “Prepare for data analyst interviews with role-based lessons, realistic SQL/case practice, and a verified record of what you can do.”

Primary CTA: **Get my free skill plan**. Ask at most:

1. target role;
2. current level or a five-minute diagnostic;
3. weekly time available.

Then return a plan instantly with the first task ready. Account claiming can follow the first success, preserving the current low-gate approach. Secondary navigation can still expose Courses, Roadmaps, and Mentoring.

Show proof that helps a decision: a real sample topic, a runnable sample challenge, an example project/certificate, expected weekly effort, instructor identity, full pricing, and genuine learner outcomes.

#### Course decision and checkout

**Evidence/guidance.** The FTC requires endorsements and reviews to be truthful and not misleading; material connections and atypical results need proper disclosure ([FTC endorsement guidance](https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews)). The FTC and UK Competition and Markets Authority identify fake urgency, fake scarcity, hidden fees, information overload, misleading hierarchy, and subscription traps as harmful online choice architecture ([FTC report](https://www.ftc.gov/reports/bringing-dark-patterns-light), [CMA evidence review](https://www.gov.uk/government/publications/online-choice-architecture-how-digital-design-can-harm-competition-and-consumers/evidence-review-of-online-choice-architecture-and-consumer-and-competition-harm)).

**DataEntropy inference and non-negotiable fixes.**

1. Remove the default `4.8` rating and calculated review count immediately. Show no rating until genuine approved reviews exist; then show the actual count and aggregation method.
2. Show one free lesson or challenge without a form. Let demonstrated value precede lead capture.
3. For free enrollment, require only what is necessary—usually email, or an existing authenticated/anonymous account. Ask profession/institute later and make it optional.
4. For paid enrollment, show the full price, payment steps, verification time, refund/cancellation terms, course access terms, and support channel before the learner starts.
5. Start a payment-expiry timer only if an actual resource or transaction reservation expires; explain it before it begins, preserve state, and allow a clean restart.
6. Label testimonials with real names/roles only with consent; disclose incentives and publish typical outcomes rather than exceptional anecdotes alone.
7. Remove every unconditional “Limited seat available” message. Show capacity only when it comes from a real, current limit.

Do not A/B test whether deception increases purchases. Truth and informed consent are constraints, not variants.

#### Ethical experimentation

**Evidence.** Microsoft’s experimentation program emphasizes randomization, trustworthy telemetry, and guardrails; sample-ratio mismatch and data-quality failures can invalidate or reverse conclusions ([Microsoft overview](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/), [sample-ratio mismatch guidance](https://www.microsoft.com/en-us/research/publication/diagnosing-sample-ratio-mismatch-in-online-controlled-experiments-a-taxonomy-and-rules-of-thumb-for-practitioners/)). Duolingo describes rejecting a monetization experiment that increased revenue but harmed learner retention ([first-party account](https://blog.duolingo.com/improving-duolingo-one-experiment-at-a-time/)).

**DataEntropy inference.** Every test should have:

- one written hypothesis and one primary metric;
- a minimum runtime/sample plan before looking at results;
- assignment integrity and sample-ratio checks;
- learning, trust, accessibility, and performance guardrails;
- segment checks planned in advance, especially mobile/desktop and new/returning;
- no rollout when conversion improves but delayed learning, retention, refunds, opt-outs, or accessibility materially worsen.

With low traffic, prefer usability interviews, task tests, and larger product changes over underpowered A/B tests.

### 4. UI/UX, accessibility, mobile, and performance

#### Information architecture and visual hierarchy

**DataEntropy inference from the implementation.** The Career Prep dashboard has several competing blocks: journey, profile claim, library, daily challenge, next up, offers, and a full timeline. Preserve all of them, but organize them by intent:

1. **Do now:** one dominant next action and due reviews.
2. **Your progress:** plan mastery, weekly goal, evidence earned.
3. **Practise:** daily/mixed practice and retries.
4. **Your plan:** collapsible timeline.
5. **Get help/go deeper:** mentor, course, webinar, ebook.

Offers should not precede the learner’s next action. The topic page already follows this principle more closely than the journey dashboard.

The SQL workspace should reduce persistent visual noise: fewer uppercase micro-labels, fewer simultaneous pulsing animations, minimum 12–14px supporting text, one primary Run/Submit hierarchy, and a clearly announced result/failure region. Respect `prefers-reduced-motion`.

#### Accessibility

**Standard.** WCAG 2.2 AA covers keyboard operation, focus visibility and focus not being obscured, meaningful labels and errors, reflow, contrast, accessible authentication, and a minimum pointer target criterion ([WCAG 2.2](https://www.w3.org/TR/WCAG22/)). W3C notes that mobile accessibility is part of WCAG rather than a separate standard ([W3C mobile guidance](https://www.w3.org/WAI/standards-guidelines/mobile/)). Automated tools cover only part of conformance.

**DataEntropy inference.** Establish a release gate that manually covers:

- keyboard-only use of navigation, enrollment, payment, dialogs, tabs, accordions, quizzes, code editor, and admin;
- screen-reader names, roles, state changes, validation, timers, results, and toasts;
- focus restoration after dialogs and visible focus not hidden under the fixed navigation;
- 200% text zoom and 320 CSS-pixel reflow without lost content;
- at least 24×24 CSS-pixel targets under WCAG 2.2 AA, with 44×44 as a comfortable mobile design target for primary actions;
- non-color indicators for correctness, progress, difficulty, and active tabs;
- captions, transcripts, and text/code alternatives for every video or diagram;
- persistent visible labels for search, ebook lead, review, enrollment, and payment inputs—placeholders may provide examples but must not replace labels;
- pause/stop/hide for non-essential motion and no deadline communicated by color or animation alone;
- accessible Monaco settings plus a plain textarea fallback where practical.

Recruit learners who use keyboards, screen readers, magnification, and low-end Android devices for task testing.

#### Mobile and performance

**Standard/guidance.** Google recommends measuring Core Web Vitals at the 75th percentile, segmented by mobile and desktop: LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1 ([LCP](https://web.dev/articles/lcp), [INP threshold methodology](https://web.dev/articles/defining-core-web-vitals-thresholds), [CLS](https://web.dev/articles/optimize-cls)). Field data is necessary because lab tests do not reproduce every device, network, and interaction.

**DataEntropy inference.** Preserve route-level lazy loading and click-to-load video, then:

- collect real-user LCP/INP/CLS by route, device class, and connection—not only Lighthouse scores;
- specifically test Bangladeshi mobile networks and lower-memory Android devices;
- reserve dimensions for every course image, instructor avatar, QR code, video, diagram, skeleton, and async count;
- keep landing content usable before Supabase counts return; hide the inventory strip if every value is zero or unavailable;
- cache stable topic/course reads and avoid refetching shared metadata on every tab or return;
- prefetch only the likely next topic, not whole libraries;
- keep Monaco/PGlite out of all non-workspace bundles and show boot progress/recovery;
- audit third-party YouTube, animation, chart, and image costs;
- use responsive tables/cards and avoid full-height nested scroll traps on mobile.

The latest build audit found a roughly 240 KB `students-learning.json` Lottie asset, plus route-split chunks of approximately 585 KB shared JavaScript, 609 KB for SQL Challenge, and 757 KB for Admin, alongside large PGlite WASM/data assets. Route splitting prevents all of this from landing on the home page, which is good, but field measurements should confirm memory use, boot time, and interaction latency on lower-end devices. The first optimization target should be measured learner routes, not the admin chunk simply because it is numerically large.

## Prioritized product plan

### P0 — trust, measurement, and core usability (0–2 weeks)

1. Remove synthetic rating/review counts and audit every urgency, popularity, certificate, community, “lifetime access,” and outcome claim against real data and delivery.
2. Define events with one source of truth and server timestamps:
   - `landing_viewed`
   - `diagnostic_started/completed`
   - `journey_selected`
   - `learning_item_started`
   - `attempt_submitted` with correctness/hint level
   - `learning_item_completed`
   - `review_due/completed`
   - `returned_1d/7d/28d` derived in analysis, not fired on page load
   - `offer_impression/clicked`
   - `checkout_started/submitted`
   - `payment_verified/refunded`
3. Join anonymous history to a claimed account without duplicating visitors; document consent and retention for analytics/contact data.
4. Build a real course resume/progress state and one “Continue course” action.
5. Reduce the free-enrollment form and disclose all paid-course terms before payment.
6. Run the WCAG/mobile task audit on the five critical flows: first practice, topic/checkpoint, SQL solve, free enrollment, and paid payment.
7. Add Core Web Vitals real-user monitoring.

### P1 — activation and learning quality (2–6 weeks)

1. Launch the role/level/time diagnostic and instant first plan.
2. Implement the standard topic/lesson authoring template.
3. Add a first version of “Review due” with simple intervals and mixed items.
4. Upgrade feedback with misconception categories, result diffs, concept links, and isomorphic retries.
5. Redesign the learner home around “Do now,” “Progress,” “Practise,” and a collapsed plan.
6. Replace strict daily streak emphasis with a forgiving weekly consistency goal.
7. Add a genuine free sample and outcome evidence to each course page.

### P2 — retention and sustainable conversion (6–12 weeks)

1. Adapt review timing from recall history and target interview date.
2. Add opt-in, due-item reminders with quiet hours and caps.
3. Pilot structured lesson Q&A or small accountability cohorts.
4. Connect free topic/challenge mastery to the most relevant course, mentor session, or webinar—after the next free learning action.
5. Add instructor/admin content-quality views: retrieval coverage, item difficulty, distractor performance, hint dependence, stale content, and delayed recall.
6. Test pricing/packaging and trial design only after the checkout, entitlement, refund, and outcome data are trustworthy.

### 30/60/90-day delivery view

**By day 30**

- Ship the non-negotiable trust fixes: observed-only ratings/reviews, no unconditional scarcity, clear paid terms, and data-minimized free/ebook forms with visible labels.
- Repair the funnel event model and derive D1/D7/D28 return from behavior; add offer impressions and verified payment/refund events.
- Add course resume/progress and one continuation action.
- Complete critical-flow keyboard, screen-reader, zoom/reflow, and low-end Android tests.
- Start field Core Web Vitals and workspace boot/error measurement.

**By day 60**

- Release the outcome-first diagnostic and instant role plan.
- Migrate the highest-traffic topics to the worked → faded → independent → feedback template.
- Launch the first “Review due” queue with simple intervals and mixed review items.
- Redesign the learner dashboard hierarchy around one next action, due review, mastery, and a collapsed plan.
- Publish a real, ungated sample on every sellable course.

**By day 90**

- Evaluate diagnostic, lesson-template, feedback, and review-queue cohorts using delayed recall and transfer—not completion alone.
- Add opt-in due-review reminders and forgiving weekly consistency with recovery.
- Adapt review priority from recall, interview date, and skill importance.
- Pilot one structured social-support format, with moderation and safety metrics.
- Begin ethical pricing/packaging experiments only if instrumentation, entitlement, refund, and trust guardrails are reliable.

## Metrics

### Metric hierarchy

| Layer | Recommended metrics | Avoid optimizing alone |
|---|---|---|
| Reach | qualified landing visitors, source, target role | raw page views |
| Activation | diagnostic completion; first correct independent attempt within first session/10 minutes; plan selected; first next action started | account creation |
| Learning | delayed recall at 7/14/30 days; transfer-task success; first-attempt correctness; mastery by skill; hint/solution dependence | watch time, pages opened, XP |
| Engagement | weekly successful learners; D1/D7/D28 return; due-review completion; resumed-after-gap rate; sessions per active learner | strict streak length |
| Course | lesson resume rate; module completion; project submission; course completion; post-course transfer task | enrollment count alone |
| Conversion | offer impression → detail → checkout → payment verified; free-to-paid; time to purchase; refund/cancellation | CTA clicks |
| Trust | review authenticity; support complaints; refund rate; reminder opt-out/unsubscribe; data-deletion requests; payment abandonment | testimonial volume |
| Quality | accessibility task completion; error rate; p75 mobile LCP/INP/CLS; crash/query error rate | Lighthouse score alone |

### Event and attribution cautions

- “Returned” should be calculated from distinct active dates after a qualifying learning action, not emitted every time the lobby mounts.
- “Engaged” needs a precise behavior such as starting an attempt or spending a minimum active interval—not a page view.
- Store offer impressions as well as clicks or click-through rates will be uninterpretable.
- Separate payment submission from verified revenue.
- Track the version of content, experiment, question, feedback policy, and review scheduler.
- Do not use client-forgeable funnel events to grant XP, certificates, access, or payment status; the repository already documents this boundary correctly.
- Report confidence intervals and sample sizes; do not rank tiny segments by noisy point estimates.

## Experiment backlog

Remove deceptive claims and fix basic accessibility without experiments. For uncertain product choices, use this backlog in order:

| Test | Hypothesis | Primary metric | Guardrails |
|---|---|---|---|
| Outcome-first landing + diagnostic vs current start | A specific role outcome and instant plan produce more meaningful activation than four product choices. | first independent correct attempt in first session | bounce, task time, mobile LCP, error rate |
| Three-question onboarding vs journey-button choice | Goal/level/time produces a more relevant first action. | first plan task started and completed | onboarding abandonment, backtracking, self-reported fit |
| Worked → faded → independent template vs current topic | Scaffolding improves independent transfer for novices. | unassisted transfer-item success after 7 days | time, frustration, advanced-learner skip rate |
| Review-due queue vs next-up only | Spaced retrieval improves durable skill and return. | delayed recall at 14/30 days | workload, postponement, notification opt-out |
| Diagnostic feedback vs answer highlight | Misconception-specific feedback improves the next attempt and transfer. | success on isomorphic retry plus later transfer | time to resolution, solution reveals, abandonment |
| Free sample lesson/challenge vs course page only | Experiencing teaching quality before the form increases informed enrollment. | verified enrollment per qualified visitor | refunds, support, course completion |
| Email-only free enrollment vs current required profile extras | Progressive profiling reduces abandonment without harming qualified conversion. | completed free enrollment | spam/invalid email, later profile completion |
| Weekly consistency + recovery vs strict daily streak | A forgiving goal increases return after interruptions. | resumed-after-gap and D28 active learning | total learning loops, distress feedback |
| Opt-in due-review reminder vs no reminder | A specific reminder increases completed reviews and later recall. | incremental completed review and 7-day recall | opt-out, unsubscribe, non-reminder-day study |
| Lesson Q&A pilot vs no Q&A | Structured help resolves blocks without feed noise. | blocked-to-resolved learning item | moderation load, safety reports, participation inequality |

For low traffic, run five-to-eight moderated task sessions per major flow first, fix obvious failures, and reserve controlled experiments for decisions with enough exposure and real uncertainty.

## Research limitations

- Many foundational learning studies use laboratory materials, mathematics, or younger learners; DataEntropy teaches adult, applied data skills. Treat the findings as design priors, not guaranteed effect sizes.
- Duolingo findings come from language learning at enormous scale. They are useful product evidence but may not generalize to a smaller professional-skills LMS.
- Engagement is not learning. Streaks, notifications, communities, video views, shares, and XP may change use without improving durable performance.
- Conversion guidance from regulators defines ethical constraints and common harms; it does not identify the highest-converting design for DataEntropy.
- A repository audit cannot observe comprehension, trust, accessibility with assistive technology, or why people abandon. Pair this plan with learner interviews, task observation, and production data.

## Primary source index

### Learning science

- [Roediger & Karpicke — Test-enhanced learning](https://journals.sagepub.com/doi/10.1111/j.1467-9280.2006.01693.x)
- [Cepeda et al. — Spacing effects in learning](https://pubmed.ncbi.nlm.nih.gov/19076480/)
- [Taylor & Rohrer — Effects of interleaved practice](https://onlinelibrary.wiley.com/doi/10.1002/acp.1598)
- [Sweller & Cooper — Worked examples and algebra learning](https://doi.org/10.1207/s1532690xci0201_3)
- [Hattie & Timperley — The power of feedback](https://doi.org/10.3102/003465430298487)
- [Butler et al. — Corrective feedback and multiple-choice learning](https://pubmed.ncbi.nlm.nih.gov/18491500/)
- [IES — Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1)
- [Mayer — Applying the science of learning to multimedia instruction](https://doi.org/10.1111/j.1365-2923.2010.03624.x)
- [Guo, Kim & Rubin — Video production and engagement](https://doi.org/10.1145/2556325.2566239)

### Engagement and product research

- [Harkin et al. — Progress monitoring and goal attainment](https://eprints.whiterose.ac.uk/id/eprint/91437/)
- [Duolingo — Improving the streak, A/B test](https://blog.duolingo.com/improving-the-streak/)
- [Duolingo — Streak recovery experiments](https://blog.duolingo.com/how-streaks-keep-duolingo-learners-committed-to-their-language-goals/)
- [Duolingo — Friend Streak product research](https://blog.duolingo.com/product-lessons-friend-streak/)
- [Yancey et al. — Optimizing recurring notifications](https://research.duolingo.com/papers/yancey.kdd20.pdf)
- [Nobbe et al. — Study reminders as a double-edged sword](https://pubmed.ncbi.nlm.nih.gov/38906868/)
- [Zhu et al. — Online-community microlearning RCT](https://www.nature.com/articles/s41599-024-03719-6)

### Conversion, experimentation, accessibility, and performance

- [FTC — Bringing Dark Patterns to Light](https://www.ftc.gov/reports/bringing-dark-patterns-light)
- [FTC — Endorsements, influencers, and reviews](https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews)
- [UK CMA — Online choice architecture evidence review](https://www.gov.uk/government/publications/online-choice-architecture-how-digital-design-can-harm-competition-and-consumers/evidence-review-of-online-choice-architecture-and-consumer-and-competition-harm)
- [GOV.UK — Start using a service pattern](https://design-system.service.gov.uk/patterns/start-using-a-service/)
- [Microsoft Research — Online experimentation at Microsoft](https://www.microsoft.com/en-us/research/publication/online-experimentation-at-microsoft/)
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C — Mobile accessibility](https://www.w3.org/WAI/standards-guidelines/mobile/)
- [Google — Largest Contentful Paint](https://web.dev/articles/lcp)
- [Google — Core Web Vitals threshold methodology](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [Google — Cumulative Layout Shift](https://web.dev/articles/optimize-cls)
