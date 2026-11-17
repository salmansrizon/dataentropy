-- ADR-0001: promo codes and sale pricing are mutually exclusive.
-- A promo code is only accepted on a paid course in Promo-Only Pricing mode.
-- Drops the code (rather than rejecting the enrollment) so an older client
-- that still shows the promo field cannot break checkout.
--   rollback: drop trigger if exists strip_disallowed_promo_code on public.course_enrollments;
--             drop function if exists public.strip_disallowed_promo_code();

create or replace function public.strip_disallowed_promo_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.promo_code is not null and not exists (
    select 1 from public.courses c
    where c.id = new.course_id
      and c.promo_only
      and not coalesce(c.is_free, false)
  ) then
    new.promo_code := null;
  end if;
  return new;
end;
$$;

drop trigger if exists strip_disallowed_promo_code on public.course_enrollments;
create trigger strip_disallowed_promo_code
  before insert or update of promo_code, course_id on public.course_enrollments
  for each row execute function public.strip_disallowed_promo_code();
