-- GDPR/CCPA export and "reset swipes" for the signed-in user.

create function public.export_my_data() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  return jsonb_build_object(
    'exported_at', now(),
    'account', (select jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at)
                  from auth.users u where u.id = uid),
    'profile', (select (to_jsonb(p) - 'location' - 'is_seed')
                       || jsonb_build_object(
                            'approx_latitude', extensions.st_y(p.location::extensions.geometry),
                            'approx_longitude', extensions.st_x(p.location::extensions.geometry))
                  from public.profiles p where p.id = uid),
    'preferences', (select to_jsonb(x) from public.user_preferences x where x.user_id = uid),
    'settings', (select to_jsonb(x) from public.user_settings x where x.user_id = uid),
    'photos', coalesce((select jsonb_agg(jsonb_build_object('path', ph.storage_path, 'position', ph.position, 'added', ph.created_at) order by ph.position)
                          from public.photos ph where ph.user_id = uid), '[]'::jsonb),
    'tags', coalesce((select jsonb_agg(t.name order by t.sort)
                        from public.profile_tags pt join public.tags t on t.id = pt.tag_id
                       where pt.user_id = uid), '[]'::jsonb),
    'swipes', coalesce((select jsonb_agg(jsonb_build_object('target', s.target_id, 'action', s.action, 'at', s.created_at) order by s.created_at)
                          from public.swipes s where s.swiper_id = uid), '[]'::jsonb),
    'matches', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'created_at', m.created_at) order by m.created_at)
                           from public.matches m where uid in (m.user_a, m.user_b)), '[]'::jsonb),
    'messages', coalesce((select jsonb_agg(jsonb_build_object('match', msg.match_id, 'sent_by_me', msg.sender_id = uid,
                                                              'body', msg.body, 'at', msg.created_at) order by msg.created_at)
                            from public.messages msg join public.matches m on m.id = msg.match_id
                           where uid in (m.user_a, m.user_b)), '[]'::jsonb),
    'blocks', coalesce((select jsonb_agg(jsonb_build_object('blocked', b.blocked_id, 'at', b.created_at))
                          from public.blocks b where b.blocker_id = uid), '[]'::jsonb),
    'reports_filed', coalesce((select jsonb_agg(jsonb_build_object('reported', r.reported_id, 'reason', r.reason, 'at', r.created_at))
                                 from public.reports r where r.reporter_id = uid), '[]'::jsonb)
  );
end $$;

create function public.reset_my_swipes() returns void
language plpgsql security definer set search_path = '' as $$
declare uid uuid := (select auth.uid());
begin
  if uid is null then raise exception 'Not authenticated' using errcode = '28000'; end if;
  delete from public.matches where uid in (user_a, user_b);
  delete from public.swipes where swiper_id = uid;
end $$;

revoke execute on function public.export_my_data(), public.reset_my_swipes() from public, anon;
grant execute on function public.export_my_data(), public.reset_my_swipes() to authenticated;
