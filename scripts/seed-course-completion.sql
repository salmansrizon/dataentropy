-- Course completion seed (2026-11-17).
-- Fills the published course pages: instructor, curriculum outline, one real
-- free preview lesson per course, FAQs, outcomes and "what you'll learn" cards.
--
-- Idempotent and non-destructive:
--   * curriculum is only inserted into courses that have no sections yet;
--   * course fields are only filled when empty ([] / {} / null);
--   * the two partial courses only get their placeholder free lesson replaced.
-- Free lesson bodies live in course_content.description: LessonPlayer renders
-- description as text and content_data only for video_url.
--
-- rollback (new curriculum only):
--   delete from course_sections where course_id in (
--     '637d3e7b-d1c7-42e6-b78d-3314f30e351b','12a82757-c57b-4367-bd29-8a5b7d60c99c',
--     '2b487b1c-656b-45ce-86d7-d8a953d83a45','81057e0f-dbb5-45b1-9181-bd1cfa05e864');
--   delete from course_content where course_id in (same four ids);

begin;

-- ── Instructor ──────────────────────────────────────────────────────────────
update public.instructors
set bio = case when coalesce(bio, '') = '' then
      'Teaches SQL, data analytics and AI engineering at DataEntropy — practical, project-first courses for early-career data and AI professionals.'
    else bio end,
    specialization = case when coalesce(specialization, '') = '' then
      'Data Analytics · Data Engineering · AI Engineering'
    else specialization end,
    assigned_courses = (select array_agg(id::text order by created_at) from public.courses where status = 'published'),
    is_active = true
where id = 'db4f5287-7767-4835-b104-b3612162ba4b';

update public.courses
set instructor_id = 'db4f5287-7767-4835-b104-b3612162ba4b'
where status = 'published' and instructor_id is null;

-- ── Shared English FAQ builder ──────────────────────────────────────────────
create or replace function pg_temp.course_faqs(who text, prereq text) returns jsonb language sql as $f$
  select jsonb_build_array(
    jsonb_build_object('question', 'Who is this course for?', 'answer', who),
    jsonb_build_object('question', 'What do I need before I start?', 'answer', prereq),
    jsonb_build_object('question', 'Is the course live or recorded?',
      'answer', 'Self-paced and recorded. Lessons are released module by module; once you enroll you get every lesson as it goes live and can study on your own schedule.'),
    jsonb_build_object('question', 'Can I try it before paying?',
      'answer', 'Yes. The first lesson is a free preview — open it from the curriculum on this page, no payment needed.'),
    jsonb_build_object('question', 'How do I pay and get access?',
      'answer', 'Sign in first so the course is linked to your account. Pay with bKash or Nagad, enter the transaction ID at checkout, and the course unlocks on your account once we confirm the payment.'),
    jsonb_build_object('question', 'Can I get help while learning?',
      'answer', 'Yes. Book a 1:1 consultation from the "Book a Consultation" page to work through a blocker, a project or your career plan with the instructor.')
  )
$f$;

-- Fill a course's descriptive fields only where they are still empty.
create or replace function pg_temp.fill_course(
  cid uuid, p_faqs jsonb, p_wywl jsonb, p_outcomes text[], p_reqs text[], p_audience text[], p_includes text[]
) returns void language sql as $f$
  update public.courses set
    faqs                = case when coalesce(faqs, '[]'::jsonb) = '[]'::jsonb then p_faqs else faqs end,
    what_you_will_learn = case when coalesce(what_you_will_learn, '[]'::jsonb) = '[]'::jsonb then p_wywl else what_you_will_learn end,
    learning_outcomes   = case when coalesce(cardinality(learning_outcomes), 0) = 0 then p_outcomes else learning_outcomes end,
    requirements        = case when coalesce(cardinality(requirements), 0) = 0 then p_reqs else requirements end,
    target_audience     = case when coalesce(cardinality(target_audience), 0) = 0 then p_audience else target_audience end,
    course_includes     = case when coalesce(cardinality(course_includes), 0) = 0 then p_includes else course_includes end
  where id = cid
$f$;

create or replace function pg_temp.wywl(variadic pairs text[]) returns jsonb language sql as $f$
  select coalesce(jsonb_agg(jsonb_build_object('title', pairs[i], 'description', pairs[i + 1]) order by i), '[]'::jsonb)
  from generate_series(1, array_length(pairs, 1), 2) as i
$f$;

-- ── DA & BI Masterclass (Bangla) ────────────────────────────────────────────
-- Already complete apart from the cards; its real course-overview video becomes the free preview.
update public.courses set what_you_will_learn = pg_temp.wywl(
  'এক্সেল থেকে Power BI', 'অ্যাডভান্সড এক্সেল, Power Query ও Power Pivot দিয়ে ডেটা ক্লিন করে প্রফেশনাল ড্যাশবোর্ড বানানো।',
  'SQL দিয়ে ডেটা এক্সট্রাকশন', 'রিয়েল ডেটাবেজে কুয়েরি লিখে বিজনেস প্রশ্নের উত্তর বের করা।',
  'পাইথন দিয়ে অ্যানালিসিস', 'Pandas দিয়ে বড় ডেটাসেট ফিল্টার, গ্রুপ ও টাইম-সিরিজ অ্যানালিসিস।',
  'ক্যারিয়ার রেডি পোর্টফোলিও', 'ক্যাপস্টোন প্রজেক্ট, সিভি ও ইন্টারভিউ প্রস্তুতি — জব বা ফ্রিল্যান্সিংয়ের জন্য।')
where id = 'de5aa847-28e9-4b39-ad1c-c02ac155c8c7'
  and coalesce(what_you_will_learn, '[]'::jsonb) = '[]'::jsonb;

update public.course_content set is_free = true
where id = '3f3f61e4-e04a-46bc-9145-833656767d1e'
  and course_id = 'de5aa847-28e9-4b39-ad1c-c02ac155c8c7'
  and not exists (select 1 from public.course_content
                  where course_id = 'de5aa847-28e9-4b39-ad1c-c02ac155c8c7' and is_free);

-- ── SQL for Data Engineers (partial) ────────────────────────────────────────
select pg_temp.fill_course('425b278e-c42b-4b7a-8723-1468e0ef2e30',
  pg_temp.course_faqs(
    'Analysts moving into data engineering, and backend developers who inherited a data pipeline and need the SQL that keeps it correct and fast.',
    'You should be comfortable writing SELECT, JOIN and GROUP BY. No prior warehousing experience is needed. Any PostgreSQL install (or a free hosted Postgres) is enough to follow along.'),
  pg_temp.wywl(
    'Model a warehouse', 'Turn messy source tables into facts and dimensions that analysts can trust.',
    'Load data safely', 'Write incremental, idempotent loads that never silently drop or double rows.',
    'Window functions at scale', 'Sessionisation, running totals and deduplication without self-joins.',
    'Fix slow queries', 'Read an EXPLAIN plan and know which index or rewrite actually helps.'),
  array[]::text[], array[]::text[], array[]::text[],
  array['6 lessons across 3 modules', 'Free preview lesson', 'Self-paced — learn on your schedule', 'SQL practice questions in the Practice Library']);

update public.course_content set content_type = 'text', content_data = '{}'::jsonb, description = $b$Every pipeline problem you will debug starts with an assumption about the source that turned out to be false. This lesson is about learning to distrust source tables on purpose, before they cost you a wrong dashboard.

1. "id is unique" — until it is not.
Source systems re-send events, ORMs retry inserts, and CDC tools replay changes. Before you join on a key, check it:
  SELECT id, count(*) FROM orders GROUP BY id HAVING count(*) > 1;
If that returns rows, every join you build on orders.id will fan out and inflate your totals.

2. "updated_at means the row changed" — not always.
Some applications touch updated_at on every save, even with no real change. Others forget to set it on bulk updates. If your incremental load filters on updated_at > last_run, the second case silently drops changed rows. Compare a sample of rows against a full snapshot before trusting the column.

3. "NULL means unknown" — or zero, or not applicable, or a bug.
A NULL discount might mean "no discount" or "discount not captured yet". Decide what each NULL means for each column, and encode that decision once (in a staging model), not in every query.

4. "Timestamps are in UTC" — check.
Mixed time zones are the most common cause of "yesterday's revenue changed". Look for timestamps without time zone, and for values that cluster around local business hours when they should be spread across UTC.

5. "Deleted rows disappear" — they usually do not.
Soft deletes (is_deleted, deleted_at, status = 'cancelled') stay in the table. Hard deletes vanish without a trace, so an incremental load never learns about them. Know which one your source uses.

A five-minute profiling habit
For every new source table, run four queries before modelling it: row count by day, duplicate check on the key, NULL rate per column, and min/max of every timestamp. Save the results. When numbers drift later, you will have a baseline to compare against.

The rest of the course builds on this: the modelling module turns these checks into staging models, and the loading module makes them part of every incremental run.$b$
where course_id = '425b278e-c42b-4b7a-8723-1468e0ef2e30' and is_free and content_data = '"placeholder"'::jsonb;

-- ── AI Engineering (partial) ────────────────────────────────────────────────
select pg_temp.fill_course('656e2a6d-1c91-4444-8d31-ecbdfce3df4c',
  pg_temp.course_faqs(
    'Analysts and developers moving into applied AI, and engineers who have shipped an LLM demo and now need it to survive real users.',
    'You should be comfortable with Python and calling an HTTP API. No machine-learning theory is required — we treat models as components and focus on the system around them.'),
  pg_temp.wywl(
    'Pick the right model', 'Compare hosted APIs and open-weight models on quality, cost, latency and data control.',
    'Build retrieval that works', 'Chunking, embeddings, hybrid search and reranking for real documents.',
    'Evaluate before you ship', 'Held-out sets, LLM-as-judge and RAGAS to measure quality, not vibes.',
    'Run it in production', 'Guardrails, observability and cost control for a system people rely on.'),
  array[]::text[], array[]::text[], array[]::text[],
  array['10 lessons across 4 modules', 'Free preview lesson', 'Self-paced — learn on your schedule', 'AI engineering practice questions in the Practice Library']);

update public.course_content set content_type = 'text', content_data = '{}'::jsonb, description = $b$Most surprises in an LLM bill or an LLM latency graph come from one concept: tokens. This lesson gives you a working mental model so you can predict cost and speed before you ship.

What a token is
Models do not read characters or words; they read tokens — chunks produced by a tokenizer. In English a token is roughly three-quarters of a word on average. Bangla, code and unusual spellings usually split into more tokens per word, so the same message can cost noticeably more in one language than another.

Input tokens and output tokens are priced separately
Every request is billed for what you send (system prompt + conversation history + retrieved documents + the user's message) and for what the model generates. Output tokens are typically priced higher than input tokens and are generated one at a time, so they dominate latency.

Why your bill moved
Three common causes, in order of how often we see them:
1. History growth. A chat app that resends the full conversation every turn grows its input linearly per turn and its total cost roughly quadratically over a long conversation.
2. Retrieval bloat. Adding "just two more" retrieved chunks to every request quietly multiplies input tokens across all traffic.
3. Verbose outputs. A prompt change that makes answers 30% longer raises both cost and response time by about the same amount.

The context window is a budget, not a goal
The context window is the maximum tokens a model can consider in one request. Filling it is rarely a good idea: cost grows with every token, and models often use information in the middle of a very long context less reliably than information near the start or end. Send the smallest context that answers the question.

Three habits to start today
  - Log input and output token counts for every request, per feature.
  - Put a hard cap on retrieved context and on max output tokens.
  - Summarise or trim conversation history instead of resending all of it.

The model-layer module builds on this to compare models on cost per successful answer — the number that actually matters.$b$
where course_id = '656e2a6d-1c91-4444-8d31-ecbdfce3df4c' and is_free and content_data = '"placeholder"'::jsonb;

-- ── Empty courses: curriculum + fields ──────────────────────────────────────
-- Each block inserts its curriculum only when the course has no sections yet.

-- RAG in Production
do $do$
declare cid uuid := '637d3e7b-d1c7-42e6-b78d-3314f30e351b'; s uuid;
begin
  if exists (select 1 from public.course_sections where course_id = cid) then return; end if;

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Retrieval foundations', 1, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'What production RAG actually has to get right', $b$A RAG demo answers the five questions you tried. A production RAG system answers the thousand questions you did not try, says "I don't know" when it should, and costs the same next month as this month. This lesson sets out what "production" means so the rest of the course has a target.

The three layers
Every RAG system has three parts, and each fails differently:
  1. Ingestion — turning documents into chunks with useful metadata.
  2. Retrieval — finding the right chunks for a question.
  3. Generation — writing an answer grounded in those chunks.
When an answer is wrong, the first job is to find which layer failed. If the right chunk was never retrieved, no prompt change will fix it.

The failure you should look for first
In most systems we review, the dominant failure is retrieval, not generation: the answer exists in the corpus but never reaches the model. You can measure this without any LLM at all — take questions with known source passages and check whether those passages appear in the top-k results. That single number, recall@k, tells you whether to work on retrieval or on prompting.

What "good enough" looks like
Before building, write down four targets:
  - Retrieval: the right passage appears in the top 5 for at least, say, 90% of a test set.
  - Faithfulness: answers do not state things the retrieved passages do not support.
  - Latency: a p95 response time your users will accept.
  - Cost: a cost per answered question you can afford at your expected traffic.
The numbers depend on your product. What matters is that they exist before you start tuning, so you can tell improvement from noise.

Saying "I don't know"
A production system needs a way to decline. If nothing relevant is retrieved, the honest answer is "I couldn't find this in the documents" — not a fluent guess. You will build this explicitly in the evaluation module.

Your first exercise
Collect 20 real questions your users would ask, and for each one note which document and passage contains the answer. This small golden set is the foundation for every measurement in this course.$b$, 'text', '{}', true, 1, 15),
  (cid, s, 'Chunking and metadata that survive real documents', 'Split PDFs, tables and long pages into chunks that keep their meaning, and attach the metadata you will filter on later.', 'video', '{}', false, 2, 25);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Better retrieval', 2, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Hybrid search: BM25 plus dense vectors', 'Why keyword and semantic search fail on different questions, and how to combine them with reciprocal rank fusion.', 'video', '{}', false, 3, 25),
  (cid, s, 'Reranking with cross-encoders', 'Retrieve wide, then rerank narrow: improving precision without rebuilding your index.', 'video', '{}', false, 4, 20),
  (cid, s, 'Query rewriting and multi-query retrieval', 'Turn vague user questions into queries your index can actually answer.', 'video', '{}', false, 5, 20);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Evaluation', 3, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Building a golden evaluation set', 'Collect real questions, label their source passages, and keep the set honest as the corpus changes.', 'video', '{}', false, 6, 25),
  (cid, s, 'Retrieval metrics: recall@k, MRR and nDCG', 'What each metric rewards, and which one to optimise for your product.', 'video', '{}', false, 7, 20),
  (cid, s, 'Faithfulness and answer relevance with LLM-as-judge', 'Score generated answers automatically, and check the judge against human labels.', 'video', '{}', false, 8, 25);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Shipping it', 4, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Caching, latency budgets and cost', 'Where the milliseconds and the money go in a RAG request, and how to cut both.', 'video', '{}', false, 9, 20),
  (cid, s, 'Monitoring drift and failed queries', 'Detect when new documents or new questions start breaking retrieval.', 'video', '{}', false, 10, 20);
end $do$;

select pg_temp.fill_course('637d3e7b-d1c7-42e6-b78d-3314f30e351b',
  pg_temp.course_faqs(
    'Developers and analysts who have built a first RAG prototype and need it to be accurate, measurable and affordable in production.',
    'Comfortable Python and a basic understanding of embeddings and LLM APIs. If you are new to RAG, start with the AI Engineering course first.'),
  pg_temp.wywl(
    'Diagnose the failing layer', 'Tell retrieval failures from generation failures before you start tuning.',
    'Retrieve better', 'Hybrid search, reranking and query rewriting that measurably raise recall.',
    'Measure quality', 'A golden set, retrieval metrics and LLM-as-judge you can trust.',
    'Ship and monitor', 'Latency budgets, caching and drift monitoring for a live system.'),
  array['Find whether a wrong answer is a retrieval or a generation failure',
        'Combine keyword and vector search and add a reranker',
        'Build a golden evaluation set and track recall@k over time',
        'Score faithfulness automatically with LLM-as-judge',
        'Set and meet latency and cost budgets in production'],
  array['Comfortable with Python', 'Basic familiarity with embeddings and LLM APIs', 'A laptop that can run Python notebooks'],
  array['Developers who have shipped a RAG prototype', 'Analysts building internal document Q&A tools', 'Engineers responsible for an LLM feature in production'],
  array['10 lessons across 4 modules', 'Free preview lesson', 'Self-paced — learn on your schedule', 'AI engineering practice questions in the Practice Library']);

-- Prompt Engineering & Agentic Workflows
do $do$
declare cid uuid := '12a82757-c57b-4367-bd29-8a5b7d60c99c'; s uuid;
begin
  if exists (select 1 from public.course_sections where course_id = cid) then return; end if;

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Prompts that hold up', 1, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Why prompts fail in production', $b$A prompt that works in the playground is a hypothesis. Production is where it gets tested against inputs you never imagined. This lesson covers the four ways prompts usually fail, so you can design against them from the start.

1. Ambiguous instructions
"Summarise this briefly" means different lengths on different days. Replace adjectives with checkable constraints: "Summarise in at most 3 bullet points, each under 20 words." If you cannot write a test for an instruction, the model cannot reliably follow it either.

2. Unstated output format
If downstream code parses the answer, say exactly what shape it must have — and better, use the provider's structured-output or JSON-schema feature so the format is enforced rather than requested. Free-text parsing with regular expressions is the single most common source of production prompt bugs.

3. Missing context the model cannot guess
The model does not know your company's refund policy, your customer's plan, or today's date unless you put it in the prompt. When an answer is "wrong", first check whether the information needed to be right was actually provided.

4. Untested edge cases
Empty input, very long input, a different language, a user who tries to override your instructions. Each needs a deliberate decision about what should happen.

Treat prompts like code
  - Keep prompts in version control, not pasted in a dashboard.
  - Keep a small test set of inputs with expected properties of the output ("is valid JSON", "mentions the order ID", "is in Bangla").
  - Run that set on every prompt change and every model upgrade.

A simple structure that works
  Role and goal — one or two sentences on what the model is doing and for whom.
  Inputs — clearly delimited, for example inside tags or fenced blocks.
  Rules — numbered, specific, testable.
  Output format — exact schema or template.
  Examples — one or two, only if they genuinely clarify.

Exercise
Take one prompt you use today. Rewrite every vague instruction as a testable rule, then write five test inputs including at least two awkward edge cases. You will reuse these in the testing module.$b$, 'text', '{}', true, 1, 15),
  (cid, s, 'Structured outputs and JSON schemas', 'Make the model return data your code can trust, using schema-enforced outputs.', 'video', '{}', false, 2, 20);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Reasoning patterns', 2, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Few-shot examples that generalise', 'Choose examples that teach the pattern instead of being copied word for word.', 'video', '{}', false, 3, 20),
  (cid, s, 'Decomposition and step-by-step reasoning, used carefully', 'Split hard tasks into steps — and know when extra reasoning only adds cost.', 'video', '{}', false, 4, 20);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Tools and agents', 3, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Tool calling from first principles', 'How a model requests a function call, and how your code executes it safely.', 'video', '{}', false, 5, 25),
  (cid, s, 'The agent loop: plan, act, observe', 'Build a minimal agent loop and add the stopping rules that keep it under control.', 'video', '{}', false, 6, 25),
  (cid, s, 'When not to build an agent', 'Fixed workflows beat agents more often than you think — a decision checklist.', 'video', '{}', false, 7, 15);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Reliability', 4, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Testing prompts like code', 'A small regression suite that runs on every prompt change and model upgrade.', 'video', '{}', false, 8, 20),
  (cid, s, 'Guardrails and failure handling', 'Validate outputs, handle refusals and timeouts, and degrade gracefully.', 'video', '{}', false, 9, 20);
end $do$;

select pg_temp.fill_course('12a82757-c57b-4367-bd29-8a5b7d60c99c',
  pg_temp.course_faqs(
    'Developers, analysts and product builders who use LLMs and want outputs they can rely on — plus anyone deciding whether an agent is the right tool.',
    'Basic Python and access to any LLM API. No prior prompt-engineering or agent experience is needed.'),
  pg_temp.wywl(
    'Write testable prompts', 'Replace vague instructions with rules you can check automatically.',
    'Get structured outputs', 'Schema-enforced JSON that downstream code can trust.',
    'Build tool-using agents', 'Tool calling and a controlled agent loop with clear stopping rules.',
    'Ship reliably', 'Prompt regression tests, guardrails and graceful failure handling.'),
  array['Turn vague instructions into testable prompt rules',
        'Get schema-valid structured output from an LLM',
        'Implement tool calling and a minimal agent loop',
        'Decide when a fixed workflow beats an agent',
        'Run prompt regression tests on every change'],
  array['Basic Python', 'Access to any LLM API (a free tier is enough)', 'No prior prompt-engineering experience needed'],
  array['Developers adding LLM features to products', 'Analysts automating text-heavy work', 'Builders evaluating whether to use agents'],
  array['9 lessons across 4 modules', 'Free preview lesson', 'Self-paced — learn on your schedule', 'AI engineering practice questions in the Practice Library']);

-- Fine-Tuning LLMs
do $do$
declare cid uuid := '2b487b1c-656b-45ce-86d7-d8a953d83a45'; s uuid;
begin
  if exists (select 1 from public.course_sections where course_id = cid) then return; end if;

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Decide first', 1, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Fine-tune, prompt or retrieve? A decision guide', $b$Fine-tuning is powerful and expensive to get right. Before training anything, make sure it is the right tool. This lesson gives you a decision guide you can apply to any project.

What fine-tuning changes
Fine-tuning adjusts a model's weights using your examples. It is good at changing behaviour: tone, format, following a house style, handling a narrow task consistently, or making a smaller model perform a specific job well. It is a poor way to add facts. Knowledge put in through fine-tuning is hard to update, hard to verify, and can still be confidently wrong.

The three options
  Prompting — fastest to try and change. Start here, always.
  Retrieval (RAG) — the right choice when the model needs facts that change or that must be cited: documents, policies, product data.
  Fine-tuning — the right choice when you need consistent behaviour that prompting cannot reliably produce, or when you want a smaller, cheaper model to match a larger one on one narrow task.

Questions to ask, in order
  1. Have you written a careful prompt with clear rules and a couple of examples? If not, do that first.
  2. Is the problem missing knowledge? Then use retrieval, not fine-tuning.
  3. Is the problem inconsistent format, style or task behaviour across many inputs? Fine-tuning may help.
  4. Do you have, or can you create, a few hundred to a few thousand high-quality examples of the behaviour you want? Without good data, fine-tuning will not help.
  5. Can you measure success with an evaluation set that the training data never saw? If not, you will not know whether training worked.

Costs people forget
Training compute is usually the smallest cost. The larger ones are building and cleaning the dataset, running evaluations after every training run, and re-training when the base model is upgraded.

Where LoRA and QLoRA fit
Parameter-efficient methods such as LoRA train a small set of additional weights instead of the whole model, and QLoRA does this on a quantized base model to reduce memory. They make fine-tuning practical on a single GPU — the second module covers both in detail.

Exercise
Describe one problem you want to solve with fine-tuning. Walk it through the five questions above and write down which option the answers point to, and why.$b$, 'text', '{}', true, 1, 15),
  (cid, s, 'Preparing a training dataset', 'Collect, clean and format examples — and hold out an evaluation set the model never sees.', 'video', '{}', false, 2, 25);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Parameter-efficient tuning', 2, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'LoRA: what the low-rank update does', 'An intuitive view of LoRA adapters, rank and which layers to target.', 'video', '{}', false, 3, 25),
  (cid, s, 'QLoRA: fitting training on one GPU', 'Train adapters on a 4-bit quantized base model to cut memory use.', 'video', '{}', false, 4, 25),
  (cid, s, 'Hyperparameters that matter', 'Learning rate, epochs and rank — what to tune first and how to spot overfitting.', 'video', '{}', false, 5, 20);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Preference tuning', 3, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'From supervised fine-tuning to DPO', 'Why preference optimisation exists, and how DPO trains on chosen versus rejected answers.', 'video', '{}', false, 6, 25),
  (cid, s, 'Building preference pairs', 'Create chosen/rejected pairs that teach the behaviour you actually want.', 'video', '{}', false, 7, 20);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Evaluate and ship', 4, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Evaluating a fine-tuned model against the base', 'Compare on a held-out set and check you did not break general ability.', 'video', '{}', false, 8, 20),
  (cid, s, 'Merging adapters and serving', 'Merge or hot-swap adapters, and serve the result efficiently.', 'video', '{}', false, 9, 20);
end $do$;

select pg_temp.fill_course('2b487b1c-656b-45ce-86d7-d8a953d83a45',
  pg_temp.course_faqs(
    'ML-curious developers and AI engineers who have outgrown prompting for a specific task and want to train a model to behave consistently.',
    'Solid Python, experience calling LLM APIs, and basic familiarity with PyTorch or Hugging Face. Access to a GPU (a free or low-cost cloud notebook is enough) for the hands-on parts.'),
  pg_temp.wywl(
    'Choose the right approach', 'Decide between prompting, retrieval and fine-tuning with a clear checklist.',
    'Train with LoRA and QLoRA', 'Parameter-efficient fine-tuning that fits on a single GPU.',
    'Align with DPO', 'Preference tuning from chosen and rejected answers.',
    'Evaluate and serve', 'Prove the tuned model is better, then merge and serve it.'),
  array['Decide when fine-tuning is the right tool — and when it is not',
        'Prepare a clean training set and a held-out evaluation set',
        'Fine-tune with LoRA and QLoRA on a single GPU',
        'Apply DPO using preference pairs',
        'Evaluate a tuned model against its base and serve it'],
  array['Solid Python', 'Basic familiarity with PyTorch or Hugging Face', 'Access to a GPU notebook (free tiers work for most exercises)'],
  array['AI engineers who need consistent task behaviour', 'Developers who want a smaller, cheaper model for one job', 'Data scientists moving into LLM work'],
  array['9 lessons across 4 modules', 'Free preview lesson', 'Self-paced — learn on your schedule', 'AI engineering practice questions in the Practice Library']);

-- LLMOps
do $do$
declare cid uuid := '81057e0f-dbb5-45b1-9181-bd1cfa05e864'; s uuid;
begin
  if exists (select 1 from public.course_sections where course_id = cid) then return; end if;

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'What to measure', 1, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'The four numbers every LLM system needs', $b$You cannot operate what you cannot see. Before optimising anything in an LLM system, make sure you can answer four questions with numbers, per feature and per day.

1. Cost per request (and per successful outcome)
Log input tokens, output tokens and the model used for every call, and compute cost from them. Then go one step further: cost per successful outcome — per resolved ticket, per accepted summary. A cheaper model that fails twice as often is not cheaper.

2. Latency, as percentiles
Averages hide the problem. Track p50 and p95 end-to-end latency, and split it into parts: time waiting for retrieval, time to first token, and total generation time. Users feel time to first token most when you stream responses; they feel total time most when you do not.

3. Error and fallback rate
Count timeouts, rate-limit errors, invalid outputs (for example JSON that fails your schema) and refusals. Each of these needs a different fix, so record which one happened, not just "failed".

4. Quality, sampled
Quality is the hardest number and the one teams skip. You do not need to score every request. Sample a small percentage of real traffic each day and score it — with an LLM-as-judge for scale, checked regularly against a handful of human reviews. Watch the trend, not the absolute value.

What a minimal trace contains
For each request: a request ID, feature name, model and version, prompt version, input and output token counts, latency breakdown, outcome status, and — where privacy rules allow — the inputs and outputs themselves for debugging. Store prompt versions so you can tell whether a quality change came from your prompt or from the model provider.

Dashboards before optimisation
With these four numbers on one dashboard, most optimisation decisions become obvious: a cost spike traced to one feature, a latency regression after a prompt change, a quality drop after a model upgrade. The rest of this course shows how to act on each.

Exercise
List every place your application calls an LLM. For each call, mark which of the four numbers you can already measure today. The gaps are your first tasks.$b$, 'text', '{}', true, 1, 15),
  (cid, s, 'Tracing a request end to end', 'Instrument an LLM call with request IDs, token counts and a latency breakdown.', 'video', '{}', false, 2, 20);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Cost', 2, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Token budgets and model routing', 'Cap tokens per feature and route easy requests to cheaper models.', 'video', '{}', false, 3, 20),
  (cid, s, 'Exact and semantic caching', 'Cache repeated and near-duplicate requests without serving stale answers.', 'video', '{}', false, 4, 20);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Latency and resilience', 3, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Streaming, batching and timeouts', 'Cut perceived and real latency, and set timeouts that match your users.', 'video', '{}', false, 5, 20),
  (cid, s, 'Fallbacks and retries without double work', 'Retry safely, fail over between providers, and avoid duplicate side effects.', 'video', '{}', false, 6, 20);

  insert into public.course_sections (course_id, section_type, title, order_index, is_visible)
  values (cid, 'curriculum', 'Monitoring', 4, true) returning id into s;
  insert into public.course_content (course_id, section_id, title, description, content_type, content_data, is_free, order_index, duration_minutes) values
  (cid, s, 'Quality monitoring with sampled evaluations', 'Score a daily sample of real traffic and alert on quality drops.', 'video', '{}', false, 7, 20),
  (cid, s, 'Alerting and incident playbooks', 'What to alert on, who responds, and the first five checks during an incident.', 'video', '{}', false, 8, 15);
end $do$;

select pg_temp.fill_course('81057e0f-dbb5-45b1-9181-bd1cfa05e864',
  pg_temp.course_faqs(
    'Engineers running an LLM feature in production who need it to stay fast, affordable and observable as traffic grows.',
    'Experience building a backend service and calling an LLM API. Familiarity with logging and basic metrics helps but is not required.'),
  pg_temp.wywl(
    'Measure what matters', 'Cost, latency, error rate and sampled quality on one dashboard.',
    'Cut cost', 'Token budgets, model routing and caching that keep the bill predictable.',
    'Stay fast and resilient', 'Streaming, timeouts, retries and provider fallbacks.',
    'Catch regressions', 'Quality monitoring and alerting before users notice.'),
  array['Instrument every LLM call with cost, latency and outcome',
        'Reduce cost with token budgets, routing and caching',
        'Improve latency with streaming and sensible timeouts',
        'Add retries and fallbacks without duplicate side effects',
        'Monitor quality with sampled evaluations and alerts'],
  array['Experience building a backend service', 'Comfortable calling an LLM API', 'Basic familiarity with logs and metrics helps'],
  array['Backend engineers who own an LLM feature', 'AI engineers moving a prototype to production', 'Tech leads responsible for LLM cost and reliability'],
  array['8 lessons across 4 modules', 'Free preview lesson', 'Self-paced — learn on your schedule', 'AI engineering practice questions in the Practice Library']);

commit;
