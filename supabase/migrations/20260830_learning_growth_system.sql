-- DataEntropy learning-growth system.
-- Adds durable learner state without changing existing course, Journey, Topic,
-- Question, enrollment, or admin records.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_role text,
  ADD COLUMN IF NOT EXISTS current_level text,
  ADD COLUMN IF NOT EXISTS weekly_minutes integer CHECK (weekly_minutes IS NULL OR weekly_minutes BETWEEN 30 AND 1200),
  ADD COLUMN IF NOT EXISTS weekly_session_goal integer NOT NULL DEFAULT 2 CHECK (weekly_session_goal BETWEEN 1 AND 7),
  ADD COLUMN IF NOT EXISTS interview_date date,
  ADD COLUMN IF NOT EXISTS reminder_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminder_channel text CHECK (reminder_channel IS NULL OR reminder_channel IN ('browser', 'email', 'whatsapp')),
  ADD COLUMN IF NOT EXISTS reminder_days smallint[] NOT NULL DEFAULT ARRAY[1,4]::smallint[],
  ADD COLUMN IF NOT EXISTS reminder_time time NOT NULL DEFAULT '19:00',
  ADD COLUMN IF NOT EXISTS quiet_hours_start time NOT NULL DEFAULT '21:00',
  ADD COLUMN IF NOT EXISTS quiet_hours_end time NOT NULL DEFAULT '08:00';

CREATE TABLE IF NOT EXISTS public.course_lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES public.course_content(id) ON DELETE CASCADE,
  progress_seconds integer NOT NULL DEFAULT 0 CHECK (progress_seconds >= 0),
  completed boolean NOT NULL DEFAULT false,
  last_opened_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_id)
);

CREATE INDEX IF NOT EXISTS course_lesson_progress_resume_idx
  ON public.course_lesson_progress (user_id, course_id, last_opened_at DESC);

ALTER TABLE public.course_lesson_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Learners own course lesson progress" ON public.course_lesson_progress;
CREATE POLICY "Learners own course lesson progress" ON public.course_lesson_progress
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins read course lesson progress" ON public.course_lesson_progress;
CREATE POLICY "Admins read course lesson progress" ON public.course_lesson_progress
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.learning_review_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.careerprep_questions(id) ON DELETE CASCADE,
  interval_index integer NOT NULL DEFAULT 0 CHECK (interval_index BETWEEN 0 AND 5),
  ease numeric(4,2) NOT NULL DEFAULT 2.30 CHECK (ease BETWEEN 1.30 AND 3.00),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  lapses integer NOT NULL DEFAULT 0 CHECK (lapses >= 0),
  last_result text NOT NULL DEFAULT 'correct' CHECK (last_result IN ('correct', 'incorrect', 'postponed')),
  due_at timestamptz NOT NULL,
  last_reviewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS learning_review_schedule_due_idx
  ON public.learning_review_schedule (user_id, due_at);

ALTER TABLE public.learning_review_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Learners own review schedule" ON public.learning_review_schedule;
CREATE POLICY "Learners own review schedule" ON public.learning_review_schedule
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins read review schedule" ON public.learning_review_schedule;
CREATE POLICY "Admins read review schedule" ON public.learning_review_schedule
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.learning_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('attempt', 'topic', 'lesson', 'review', 'assessment')),
  subject_id uuid,
  successful boolean,
  duration_seconds integer CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS learning_activity_user_date_idx
  ON public.learning_activity (user_id, created_at DESC);

ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Learners own learning activity" ON public.learning_activity;
CREATE POLICY "Learners own learning activity" ON public.learning_activity
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins read learning activity" ON public.learning_activity;
CREATE POLICY "Admins read learning activity" ON public.learning_activity
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.topic_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  query_text text NOT NULL CHECK (char_length(query_text) BETWEEN 10 AND 1000),
  answer text CHECK (answer IS NULL OR char_length(answer) <= 4000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'hidden')),
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS topic_queries_topic_status_idx ON public.topic_queries (topic_id, status, created_at DESC);
ALTER TABLE public.topic_queries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Learners read answered or own queries" ON public.topic_queries;
CREATE POLICY "Learners read answered or own queries" ON public.topic_queries
  FOR SELECT TO authenticated USING (status = 'answered' OR user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "Learners submit Topic queries" ON public.topic_queries;
CREATE POLICY "Learners submit Topic queries" ON public.topic_queries
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND status = 'pending' AND answer IS NULL);
DROP POLICY IF EXISTS "Admins manage Topic queries" ON public.topic_queries;
CREATE POLICY "Admins manage Topic queries" ON public.topic_queries
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.topic_sections
  ADD COLUMN IF NOT EXISTS section_type text NOT NULL DEFAULT 'mental_model'
    CHECK (section_type IN ('outcome', 'mental_model', 'worked_example', 'faded_example', 'independent_attempt', 'feedback', 'later_review'));

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS access_terms text,
  ADD COLUMN IF NOT EXISTS refund_policy text,
  ADD COLUMN IF NOT EXISTS payment_verification_time text,
  ADD COLUMN IF NOT EXISTS support_contact text;

ALTER TABLE public.course_enrollments
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS course_enrollments_user_course_idx ON public.course_enrollments (user_id, course_id, status);

CREATE TABLE IF NOT EXISTS public.commerce_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('payment_verified', 'payment_refunded')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS commerce_events_once_idx ON public.commerce_events (enrollment_id, event);
ALTER TABLE public.commerce_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins read commerce events" ON public.commerce_events;
CREATE POLICY "Admins read commerce events" ON public.commerce_events FOR SELECT TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.capture_enrollment_status_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND COALESCE(NEW.payment_method, '') <> 'free' THEN
    IF NEW.status IN ('approved', 'confirmed') THEN
      INSERT INTO public.commerce_events (enrollment_id, course_id, event) VALUES (NEW.id, NEW.course_id, 'payment_verified') ON CONFLICT DO NOTHING;
    ELSIF NEW.status = 'refunded' THEN
      INSERT INTO public.commerce_events (enrollment_id, course_id, event) VALUES (NEW.id, NEW.course_id, 'payment_refunded') ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS capture_enrollment_status_event ON public.course_enrollments;
CREATE TRIGGER capture_enrollment_status_event AFTER UPDATE OF status ON public.course_enrollments
FOR EACH ROW EXECUTE FUNCTION public.capture_enrollment_status_event();

-- Associate pre-signup analytics with the account that claims the same Visitor Id.
-- The caller can only attach rows to their own authenticated identity.
CREATE OR REPLACE FUNCTION public.claim_visitor_history(p_visitor_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  IF auth.uid() IS NULL OR p_visitor_id IS NULL OR char_length(p_visitor_id) < 20 THEN
    RAISE EXCEPTION 'A valid authenticated visitor claim is required';
  END IF;

  UPDATE public.funnel_events
     SET user_id = auth.uid()
   WHERE visitor_id = p_visitor_id
     AND user_id IS NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_visitor_history(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_visitor_history(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.learning_growth_summary(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_since timestamptz := now() - make_interval(days => greatest(1, least(p_days, 365)));
  v_result jsonb;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'admin only'; END IF;
  SELECT jsonb_build_object(
    'events', COALESCE((SELECT jsonb_object_agg(event, visitors) FROM (
      SELECT event, count(DISTINCT visitor_id)::integer AS visitors FROM public.funnel_events WHERE created_at >= v_since GROUP BY event
    ) event_counts), '{}'::jsonb),
    'commerce_events', COALESCE((SELECT jsonb_object_agg(event, total) FROM (
      SELECT event, count(*)::integer AS total FROM public.commerce_events WHERE created_at >= v_since GROUP BY event
    ) commerce_counts), '{}'::jsonb),
    'weekly_successful_learners', (SELECT count(DISTINCT attempts.user_id)::integer
      FROM public.learning_activity attempts
      WHERE attempts.created_at >= greatest(v_since, now() - interval '7 days')
        AND attempts.activity_type = 'attempt' AND attempts.successful IS TRUE
        AND EXISTS (SELECT 1 FROM public.learning_activity reviews
          WHERE reviews.user_id = attempts.user_id AND reviews.activity_type = 'review'
            AND reviews.successful IS TRUE AND reviews.created_at >= greatest(v_since, now() - interval '7 days'))),
    'active_learners', (SELECT count(DISTINCT user_id)::integer FROM public.learning_activity WHERE created_at >= v_since),
    'due_reviews', (SELECT count(*)::integer FROM public.learning_review_schedule WHERE due_at <= now()),
    'completed_lessons', (SELECT count(*)::integer FROM public.course_lesson_progress WHERE completed AND completed_at >= v_since),
    'course_resumers', (SELECT count(DISTINCT user_id)::integer FROM public.course_lesson_progress WHERE last_opened_at >= v_since),
    'd1_returners', (SELECT count(DISTINCT later.user_id)::integer FROM
      (SELECT user_id, min(created_at)::date AS cohort_date FROM public.learning_activity GROUP BY user_id) cohorts
      JOIN public.learning_activity later ON later.user_id = cohorts.user_id AND later.created_at::date = cohorts.cohort_date + 1
      WHERE cohorts.cohort_date >= v_since::date),
    'd7_returners', (SELECT count(DISTINCT later.user_id)::integer FROM
      (SELECT user_id, min(created_at)::date AS cohort_date FROM public.learning_activity GROUP BY user_id) cohorts
      JOIN public.learning_activity later ON later.user_id = cohorts.user_id AND later.created_at::date BETWEEN cohorts.cohort_date + 6 AND cohorts.cohort_date + 8
      WHERE cohorts.cohort_date >= v_since::date),
    'd28_returners', (SELECT count(DISTINCT later.user_id)::integer FROM
      (SELECT user_id, min(created_at)::date AS cohort_date FROM public.learning_activity GROUP BY user_id) cohorts
      JOIN public.learning_activity later ON later.user_id = cohorts.user_id AND later.created_at::date BETWEEN cohorts.cohort_date + 27 AND cohorts.cohort_date + 29
      WHERE cohorts.cohort_date >= v_since::date),
    'question_quality', COALESCE((SELECT jsonb_agg(row_to_json(q)) FROM (
      SELECT subject_id AS question_id, count(*)::integer AS attempts, count(*) FILTER (WHERE successful)::integer AS correct,
             round(100.0 * count(*) FILTER (WHERE successful) / NULLIF(count(*), 0), 1) AS success_rate
      FROM public.learning_activity WHERE activity_type IN ('attempt','review') AND created_at >= v_since AND subject_id IS NOT NULL
      GROUP BY subject_id ORDER BY count(*) DESC LIMIT 10
    ) q), '[]'::jsonb)
  ) INTO v_result;
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.learning_growth_summary(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.learning_growth_summary(integer) TO authenticated;
