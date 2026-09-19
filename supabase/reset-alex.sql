-- DEV ONLY. Puts Alex back to the seeded state: 3 matches (seeds 1-3) and 9 pending likes (seeds 4-12).
-- Matches cascade-delete their messages.
delete from public.swipes
 where swiper_id = 'a1e00000-0000-4000-8000-000000000001'
   and target_id not in (
     '5eed0000-0000-4000-8000-000000000001',
     '5eed0000-0000-4000-8000-000000000002',
     '5eed0000-0000-4000-8000-000000000003'
   );

delete from public.matches m
 where 'a1e00000-0000-4000-8000-000000000001' in (m.user_a, m.user_b)
   and not exists (
     select 1
       from unnest(array[
         '5eed0000-0000-4000-8000-000000000001',
         '5eed0000-0000-4000-8000-000000000002',
         '5eed0000-0000-4000-8000-000000000003'
       ]::uuid[]) as seeded(id)
      where seeded.id in (m.user_a, m.user_b)
   );

delete from public.match_reads where user_id = 'a1e00000-0000-4000-8000-000000000001';
