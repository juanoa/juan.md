drop policy if exists "users manage own todo preferences" on public.todo_preferences;
drop policy if exists "users manage own todo lists" on public.todo_lists;
drop policy if exists "users manage own recurring todos" on public.todo_recurring_series;
drop policy if exists "users manage own todo tasks" on public.todo_tasks;

alter table public.todo_preferences
  add column if not exists id boolean default true;

update public.todo_preferences set id = true;

delete from public.todo_preferences preference
where preference.ctid not in (
  select kept.ctid
  from public.todo_preferences kept
  order by kept.updated_at desc, kept.created_at desc
  limit 1
);

alter table public.todo_preferences
  drop constraint if exists todo_preferences_pkey;

alter table public.todo_preferences
  alter column id set default true,
  alter column id set not null,
  add constraint todo_preferences_pkey primary key (id),
  add constraint todo_preferences_singleton check (id);

alter table public.todo_preferences
  drop column if exists user_id;

drop index if exists public.todo_lists_user_position_idx;
alter table public.todo_lists
  drop constraint if exists todo_lists_user_id_name_key,
  drop column if exists user_id;
create index if not exists todo_lists_position_idx on public.todo_lists (position);

drop index if exists public.todo_recurring_series_user_position_idx;
alter table public.todo_recurring_series
  drop column if exists user_id;
create index if not exists todo_recurring_series_position_idx
  on public.todo_recurring_series (active, position);

drop index if exists public.todo_tasks_user_due_position_idx;
drop index if exists public.todo_tasks_user_list_position_idx;
alter table public.todo_tasks
  drop column if exists user_id;
create index if not exists todo_tasks_due_position_idx
  on public.todo_tasks (due_date, position) where due_date is not null;
create index if not exists todo_tasks_list_position_idx
  on public.todo_tasks (list_id, position) where list_id is not null;

create policy "authenticated full access to todo preferences"
  on public.todo_preferences
  for all to authenticated using (true) with check (true);

create policy "authenticated full access to todo lists"
  on public.todo_lists
  for all to authenticated using (true) with check (true);

create policy "authenticated full access to recurring todos"
  on public.todo_recurring_series
  for all to authenticated using (true) with check (true);

create policy "authenticated full access to todo tasks"
  on public.todo_tasks
  for all to authenticated using (true) with check (true);

create or replace function public.todos_generate_recurring(p_until date default current_date + 90)
returns void language plpgsql security invoker as $$
begin
  insert into public.todo_tasks (
    title,
    notes,
    due_date,
    recurring_series_id,
    position
  )
  select
    series.title,
    series.notes,
    occurrence.day,
    series.id,
    coalesce((
      select max(existing.position)
      from public.todo_tasks existing
      where existing.due_date = occurrence.day
        and existing.list_id is null
    ), 0) + (row_number() over (
      partition by occurrence.day
      order by series.position, series.created_at, series.id
    ))::int * 1000
  from public.todo_recurring_series series
  cross join lateral (
    select generated_day::date as day
    from generate_series(series.start_date, p_until, interval '1 day') generated_day
  ) occurrence
  where series.active
    and occurrence.day >= current_date - 31
    and public.todo_series_occurs_on(series.frequency, series.anchor_date, occurrence.day)
    and not exists (
      select 1
      from public.todo_tasks existing
      where existing.recurring_series_id = series.id
        and existing.due_date = occurrence.day
    );
end;
$$;

create or replace function public.todos_roll_over(p_target_date date default current_date)
returns void language plpgsql security invoker as $$
begin
  with max_target_position as (
    select coalesce(max(position), 0) as value
    from public.todo_tasks
    where due_date = p_target_date
      and list_id is null
  ),
  moving as (
    select
      id,
      row_number() over (order by due_date, position, created_at, id)::int as row_index
    from public.todo_tasks
    where due_date < p_target_date
      and list_id is null
      and completed_at is null
  )
  update public.todo_tasks task
  set
    due_date = p_target_date,
    position = max_target_position.value + moving.row_index * 1000
  from moving, max_target_position
  where task.id = moving.id;
end;
$$;

grant execute on function public.todos_generate_recurring(date) to authenticated;
grant execute on function public.todos_roll_over(date) to authenticated;
