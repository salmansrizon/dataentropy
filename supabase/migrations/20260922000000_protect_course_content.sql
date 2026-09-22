-- Protect paid course lesson payloads at the database boundary.
-- The public outline view contains no content_data; full lesson rows require
-- free content, a free course, an approved/confirmed enrollment, or admin access.

CREATE OR REPLACE FUNCTION public.can_read_course_content(
  p_course_id uuid,
  p_is_free boolean
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(p_is_free, false)
    OR EXISTS (
      SELECT 1
      FROM public.courses
      WHERE id = p_course_id
        AND is_free = true
    )
    OR EXISTS (
      SELECT 1
      FROM public.course_enrollments
      WHERE course_id = p_course_id
        AND user_id = auth.uid()
        AND status IN ('approved', 'confirmed')
    )
    OR public.is_admin();
$$;

GRANT EXECUTE ON FUNCTION public.can_read_course_content(uuid, boolean)
  TO anon, authenticated;

ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.course_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.course_content TO authenticated;

DROP POLICY IF EXISTS "Allow all operations for anon" ON public.course_content;
DROP POLICY IF EXISTS "Public read free course content" ON public.course_content;
DROP POLICY IF EXISTS "Learners read entitled course content" ON public.course_content;
DROP POLICY IF EXISTS "Admins manage course content" ON public.course_content;

CREATE POLICY "Learners read entitled course content"
  ON public.course_content
  FOR SELECT
  TO anon, authenticated
  USING (public.can_read_course_content(course_id, is_free));

CREATE POLICY "Admins manage course content"
  ON public.course_content
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Existing permissive enrollment access is replaced with self/admin reads.
-- Public enrollment submission remains available for the manual payment flow,
-- but callers cannot submit an enrollment for another authenticated user.
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.course_enrollments TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.course_enrollments TO authenticated;

DROP POLICY IF EXISTS "Allow all operations for anon" ON public.course_enrollments;
DROP POLICY IF EXISTS "Public can submit course enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Learners submit course enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Learners read own course enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Admins manage course enrollments" ON public.course_enrollments;

CREATE POLICY "Learners submit course enrollments"
  ON public.course_enrollments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Learners read own course enrollments"
  ON public.course_enrollments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins manage course enrollments"
  ON public.course_enrollments
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Safe catalog read model. Views are security-definer by default; keep the
-- projection deliberately limited so anonymous readers never receive payloads.
DROP VIEW IF EXISTS public.course_content_outline;
CREATE VIEW public.course_content_outline
WITH (security_invoker = false)
AS
SELECT
  content.id,
  content.course_id,
  content.section_id,
  content.title,
  content.description,
  content.content_type,
  content.content_category,
  content.is_free,
  content.duration_minutes,
  content.topics,
  content.order_index
FROM public.course_content AS content
JOIN public.courses AS course ON course.id = content.course_id
WHERE course.status = 'published';

GRANT SELECT ON public.course_content_outline TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
