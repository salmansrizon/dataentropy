-- Align paid access with the status values enforced by the live enrollment table.
-- active/completed are the canonical unlocked states; legacy approved/confirmed
-- remain readable so old rows do not lose access during rollout.

ALTER TABLE public.course_enrollments
  DROP CONSTRAINT IF EXISTS course_enrollments_status_check;

ALTER TABLE public.course_enrollments
  ADD CONSTRAINT course_enrollments_status_check
  CHECK (status = ANY (ARRAY[
    'active', 'completed', 'approved', 'confirmed',
    'cancelled', 'pending', 'rejected', 'refunded'
  ]));

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
      SELECT 1 FROM public.courses
      WHERE id = p_course_id AND is_free = true
    )
    OR EXISTS (
      SELECT 1 FROM public.course_enrollments
      WHERE course_id = p_course_id
        AND user_id = auth.uid()
        AND status IN ('active', 'completed', 'approved', 'confirmed')
    )
    OR public.is_admin();
$$;

CREATE OR REPLACE FUNCTION public.capture_enrollment_status_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND COALESCE(NEW.payment_method, '') <> 'free' THEN
    IF NEW.status IN ('active', 'completed', 'approved', 'confirmed') THEN
      INSERT INTO public.commerce_events (enrollment_id, course_id, event)
      VALUES (NEW.id, NEW.course_id, 'payment_verified')
      ON CONFLICT DO NOTHING;
    ELSIF NEW.status = 'refunded' THEN
      INSERT INTO public.commerce_events (enrollment_id, course_id, event)
      VALUES (NEW.id, NEW.course_id, 'payment_refunded')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
