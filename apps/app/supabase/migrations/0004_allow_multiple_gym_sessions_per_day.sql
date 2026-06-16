alter table public.gym_sessions
  drop constraint if exists gym_sessions_date_key;

create index if not exists gym_sessions_date_idx
  on public.gym_sessions (date);

create or replace function public.move_session(p_id uuid, p_new_date date)
returns void language plpgsql security invoker as $$
begin
  update public.gym_sessions
  set date = p_new_date
  where id = p_id;
end;
$$;

grant execute on function public.move_session(uuid, date) to authenticated;
