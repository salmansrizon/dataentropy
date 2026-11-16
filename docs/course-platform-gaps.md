# Course Platform Gaps

## Current state

DataEntropy is already partway to a course platform:

- Public course catalogue: `src/pages/CoursesPage.tsx`
- Course detail, lesson list, video preview, and unlock UI: `src/pages/CourseDetails.tsx`
- Admin course/content/enrollment managers: `src/components/admin/CourseManager.tsx`, `CourseContentManager.tsx`, `CourseEnrollmentManager.tsx`
- Supabase tables for courses, sections, content, enrollments, and reviews
- Lesson completion tracking: `course_lesson_progress` and `src/hooks/useCourseProgress.ts`
- Manual bKash/Nagad payment submission through `src/components/PaymentModal.tsx`

## Main gaps

### 1. Paid lesson data is not truly protected

`CourseDetails.tsx` fetches all `course_content` rows client-side, including `content_data.video_url`, then hides locked lessons in the UI.

That protects the interface, not the data. A learner can inspect the network response and see paid lesson metadata/content.

Needed:

- RLS or server-side entitlement checks for `course_content.content_data`
- A safe public lesson outline that excludes paid content payloads
- Full lesson content fetched only for free samples, free courses, confirmed/approved learners, and admins

### 2. No dedicated learner course home

Course progress appears inside an individual course page, but there is no course-focused **My Learning** surface for:

- enrolled courses
- continue next lesson
- course progress
- due lessons or reviews
- course certificates
- paid access status

Career Prep has richer learning flow; Courses are still mostly catalogue/detail pages.

### 3. Payment flow is manual and fragile

Current flow:

1. Learner submits transaction ID.
2. Admin manually confirms enrollment.
3. Course unlock checks `course_enrollments.status`.

Missing:

- duplicate enrollment prevention
- learner-facing pending/confirmed/rejected/refunded state
- payment audit trail
- invoice or receipt
- notification emails
- webhook/integration path
- refund/access revocation rules

Manual payment is acceptable for MVP, but needs hardening.

### 4. Course content model is too loose

`course_content.content_data` is untyped JSON, and the renderer mostly supports YouTube video plus description.

Missing first-class support for:

- text lessons
- downloadable files
- assignments/projects
- quizzes
- lesson resources
- rich lesson body
- content versioning or draft-preview
- prerequisite/order rules

`CourseManager.tsx` is also very large and mixes course editing, section editing, and content editing.

### 5. No course certificate path

Certificates exist for Career Prep/Journeys, not regular Courses.

Missing:

- course completion rule
- final assessment/project submission
- certificate issuance for a Course
- public verification tied to Course outcome

### 6. Course progress is minimal

`useCourseProgress.ts` tracks opened/completed lessons, but not:

- video watch percentage
- quiz score
- assignment submission
- meaningful time spent
- resume exact video/text position
- Viewed / Completed / Mastered evidence states

It is a useful MVP baseline, not yet a full learning loop.

### 7. Reviews are not tied to learner status

Course reviews can be submitted from the public course page with name/email. They are moderated, but not tied to enrollment or completion.

Needed:

- optional verified learner reviews
- review eligibility after completion or confirmed enrollment

### 8. Admin analytics are not course-platform analytics

Dashboard is still portfolio/general analytics heavy.

Missing course metrics:

- enrollments by course
- pending/confirmed/refunded revenue
- lesson completion funnel
- drop-off by lesson
- free-to-paid conversion
- course completion rate
- learner activity cohorts

## Highest-priority fix: paid content protection

Current risky query in `src/pages/CourseDetails.tsx`:

```ts
supabase.from("course_content").select("*").eq("course_id", courseId)
```

This should not be used for locked learners because it can return `content_data` for paid lessons.

### Fix shape

1. Add a safe outline read model, e.g. `course_content_outline`, with no `content_data`.
2. Fetch outlines for all course lessons.
3. Fetch full lesson content only when access is known:
   - lesson is free, or
   - course is free, or
   - learner has `course_enrollments.status IN ('approved', 'confirmed')`, or
   - user is admin.
4. Enforce the same rule in Supabase RLS, not only React.

### Example frontend direction

Replace broad full-content fetch:

```ts
supabase.from("course_content").select("*").eq("course_id", courseId)
```

With safe outline fetch:

```ts
supabase.from("course_content_outline").select("*").eq("course_id", courseId)
```

Then separately fetch full `course_content` rows only for unlocked lessons.

### Minimum regression checks

- unpaid learner does not receive paid `content_data`
- paid learner receives paid `content_data`
- free sample lesson still works
- admin still sees all content

## MVP order

1. Protect paid lesson data with RLS/entitlement checks.
2. Add `/my-learning` for enrolled courses and continue lesson.
3. Normalize content rendering: video, text, resource, assignment, quiz.
4. Harden enrollments: uniqueness, pending/confirmed UI, audit trail.
5. Add course completion and optional certificate.
