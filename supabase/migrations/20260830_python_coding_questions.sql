ALTER TABLE public.careerprep_questions
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'sql',
  ADD COLUMN IF NOT EXISTS python_function_name text,
  ADD COLUMN IF NOT EXISTS python_tests jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.careerprep_questions
  ADD CONSTRAINT careerprep_questions_language_check CHECK (language IN ('sql', 'python'));
