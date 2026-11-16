-- Course sales page content + public active-promo lookup.
-- Additive and reversible:
--   rollback: drop function if exists public.get_active_course_promo(uuid);
--             alter table public.courses drop column if exists sales_page;

alter table public.courses
  add column if not exists sales_page jsonb not null default '{}'::jsonb;

alter table public.courses
  drop constraint if exists courses_sales_page_is_object;
alter table public.courses
  add constraint courses_sales_page_is_object check (jsonb_typeof(sales_page) = 'object');

comment on column public.courses.sales_page is
  'Optional course sales-page sections (batch, curriculum, demo_classes, projects, ...). Shape: src/pages/course-details/salesPage.ts';

-- Exposes ONLY display fields of the single best active promo for a course.
-- SECURITY DEFINER so anon can read it without a broad SELECT policy on promo_codes;
-- never returns max_uses/used_count/description or inactive/expired/exhausted codes.
create or replace function public.get_active_course_promo(p_course_id uuid)
returns table (code text, discount_type text, discount_value numeric, valid_until timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select pc.code::text, pc.discount_type::text, pc.discount_value::numeric, pc.valid_until::timestamptz
  from public.promo_codes pc
  where pc.is_active
    -- ponytail: course-scoped codes only; site-wide codes need the scope vocabulary confirmed first
    and pc.course_id = p_course_id
    and pc.valid_from <= now()
    and (pc.valid_until is null or pc.valid_until > now())
    and (pc.max_uses is null or pc.used_count < pc.max_uses)
  order by pc.discount_value desc
  limit 1;
$$;

revoke all on function public.get_active_course_promo(uuid) from public;
grant execute on function public.get_active_course_promo(uuid) to anon, authenticated;
