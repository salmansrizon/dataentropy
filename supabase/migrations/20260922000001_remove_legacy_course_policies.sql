-- Remove legacy policies that could widen the entitlement contract after the
-- paid-content protection migration. RLS policies combine with OR, so leaving
-- an older policy in place can silently reopen access later.

DROP POLICY IF EXISTS "View course_content gated" ON public.course_content;
DROP POLICY IF EXISTS "Admins manage course_content" ON public.course_content;
DROP POLICY IF EXISTS "Admins manage enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Public can enroll" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users view own enrollments" ON public.course_enrollments;

NOTIFY pgrst, 'reload schema';
