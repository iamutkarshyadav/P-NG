-- Selfie verification: one pending request per user, and the profile badge follows review decisions.
-- Reviewers (service role / dashboard) update verifications.status; users cannot.

create unique index verifications_one_pending_per_user
  on public.verifications (user_id) where status = 'pending';

create function public.sync_verified_flag() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'approved' then
    update public.profiles set is_verified = true where id = new.user_id;
  elsif new.status = 'rejected' then
    update public.profiles
       set is_verified = exists (
         select 1 from public.verifications v
          where v.user_id = new.user_id and v.status = 'approved' and v.id <> new.id
       )
     where id = new.user_id;
  end if;
  return null;
end $$;

create trigger verifications_sync_flag after update of status on public.verifications
  for each row when (old.status is distinct from new.status)
  execute function public.sync_verified_flag();

revoke execute on function public.sync_verified_flag() from public, anon, authenticated;
