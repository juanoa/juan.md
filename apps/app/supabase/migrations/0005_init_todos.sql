create table public.todo_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  column_count int not null default 5 check (column_count in (1, 3, 5, 7)),
  bullet_style text not null default 'none' check (bullet_style in ('none', 'circle', 'square', 'indent')),
  focus_minutes int not null default 25 check (focus_minutes between 1 and 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.todo_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null check (char_length(trim(name)) > 0),
  position int not null default 0,
  is_default boolean not null default false,
  share_token uuid unique,
  shared_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);
create index todo_lists_user_position_idx on public.todo_lists (user_id, position);

create table public.todo_recurring_series (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(trim(title)) > 0),
  notes text not null default '',
  frequency text not null check (frequency in ('daily', 'every_other_day', 'weekdays', 'weekly', 'every_other_week', 'monthly', 'yearly')),
  start_date date not null,
  anchor_date date not null,
  position int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index todo_recurring_series_user_position_idx on public.todo_recurring_series (user_id, active, position);

create table public.todo_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title text not null check (char_length(trim(title)) > 0),
  notes text not null default '',
  due_date date,
  list_id uuid references public.todo_lists(id) on delete cascade,
  completed_at timestamptz,
  position int not null default 0,
  recurring_series_id uuid references public.todo_recurring_series(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (due_date is not null and list_id is null)
    or (due_date is null and list_id is not null)
  )
);
create index todo_tasks_user_due_position_idx on public.todo_tasks (user_id, due_date, position) where due_date is not null;
create index todo_tasks_user_list_position_idx on public.todo_tasks (user_id, list_id, position) where list_id is not null;
create index todo_tasks_recurring_series_idx on public.todo_tasks (recurring_series_id);

alter table public.todo_preferences enable row level security;
alter table public.todo_lists enable row level security;
alter table public.todo_recurring_series enable row level security;
alter table public.todo_tasks enable row level security;

create policy "users manage own todo preferences" on public.todo_preferences
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own todo lists" on public.todo_lists
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own recurring todos" on public.todo_recurring_series
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users manage own todo tasks" on public.todo_tasks
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_todo_preferences_updated_at
  before update on public.todo_preferences
  for each row execute function public.touch_updated_at();

create trigger touch_todo_lists_updated_at
  before update on public.todo_lists
  for each row execute function public.touch_updated_at();

create trigger touch_todo_recurring_series_updated_at
  before update on public.todo_recurring_series
  for each row execute function public.touch_updated_at();

create trigger touch_todo_tasks_updated_at
  before update on public.todo_tasks
  for each row execute function public.touch_updated_at();

create or replace function public.todo_series_occurs_on(
  p_frequency text,
  p_anchor_date date,
  p_date date
)
returns boolean language sql immutable as $$
  select case p_frequency
    when 'daily' then p_date >= p_anchor_date
    when 'every_other_day' then p_date >= p_anchor_date and ((p_date - p_anchor_date) % 2 = 0)
    when 'weekdays' then p_date >= p_anchor_date and extract(isodow from p_date) between 1 and 5
    when 'weekly' then p_date >= p_anchor_date and ((p_date - p_anchor_date) % 7 = 0)
    when 'every_other_week' then p_date >= p_anchor_date and ((p_date - p_anchor_date) % 14 = 0)
    when 'monthly' then p_date >= p_anchor_date
      and extract(day from p_date) = extract(day from p_anchor_date)
      and (
        (extract(year from p_date)::int * 12 + extract(month from p_date)::int)
        - (extract(year from p_anchor_date)::int * 12 + extract(month from p_anchor_date)::int)
      ) >= 0
    when 'yearly' then p_date >= p_anchor_date
      and extract(month from p_date) = extract(month from p_anchor_date)
      and extract(day from p_date) = extract(day from p_anchor_date)
    else false
  end;
$$;

create or replace function public.todos_generate_recurring(p_until date default current_date + 90)
returns void language plpgsql security invoker as $$
begin
  insert into public.todo_tasks (
    user_id,
    title,
    notes,
    due_date,
    recurring_series_id,
    position
  )
  select
    series.user_id,
    series.title,
    series.notes,
    occurrence.day,
    series.id,
    coalesce((
      select max(existing.position)
      from public.todo_tasks existing
      where existing.user_id = series.user_id
        and existing.due_date = occurrence.day
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
  where series.user_id = auth.uid()
    and series.active
    and occurrence.day >= current_date - 31
    and public.todo_series_occurs_on(series.frequency, series.anchor_date, occurrence.day)
    and not exists (
      select 1
      from public.todo_tasks existing
      where existing.user_id = series.user_id
        and existing.recurring_series_id = series.id
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
    where user_id = auth.uid()
      and due_date = p_target_date
      and list_id is null
  ),
  moving as (
    select
      id,
      row_number() over (order by due_date, position, created_at, id)::int as row_index
    from public.todo_tasks
    where user_id = auth.uid()
      and due_date < p_target_date
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
