-- Catalogo de subcategorias (back, chest, legs, ...).
create table public.gym_subcategories (
  slug text primary key check (slug in ('back','chest','legs','shoulders','arms','core','full-body')),
  name text not null
);

-- Catalogo de ejercicios (Bench press, Sentadilla, ...).
create table public.gym_exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subcategory_slug text not null references public.gym_subcategories(slug)
);
create index on public.gym_exercises (subcategory_slug);

-- Sesion del dia: una por fecha.
create table public.gym_sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  subcategory_slug text not null references public.gym_subcategories(slug),
  status text not null default 'planned' check (status in ('planned','in_progress','completed')),
  created_at timestamptz not null default now()
);

-- Ejercicios planificados dentro de una sesion (referencia al catalogo).
create table public.gym_session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.gym_sessions(id) on delete cascade,
  exercise_id uuid not null references public.gym_exercises(id) on delete restrict,
  target_sets int not null check (target_sets > 0),
  target_reps int not null check (target_reps > 0),
  position int not null
);
create index on public.gym_session_exercises (session_id);

-- Series realizadas para cada ejercicio de la sesion.
create table public.gym_performed_sets (
  session_exercise_id uuid not null references public.gym_session_exercises(id) on delete cascade,
  set_index int not null check (set_index >= 0),
  reps int not null check (reps >= 0),
  weight numeric(6,2) not null check (weight >= 0),
  primary key (session_exercise_id, set_index)
);

alter table public.gym_subcategories enable row level security;
alter table public.gym_exercises enable row level security;
alter table public.gym_sessions enable row level security;
alter table public.gym_session_exercises enable row level security;
alter table public.gym_performed_sets enable row level security;

create policy "auth full access" on public.gym_subcategories
  for all to authenticated using (true) with check (true);
create policy "auth full access" on public.gym_exercises
  for all to authenticated using (true) with check (true);
create policy "auth full access" on public.gym_sessions
  for all to authenticated using (true) with check (true);
create policy "auth full access" on public.gym_session_exercises
  for all to authenticated using (true) with check (true);
create policy "auth full access" on public.gym_performed_sets
  for all to authenticated using (true) with check (true);

create or replace function public.move_session(p_id uuid, p_new_date date)
returns void language plpgsql security invoker as $$
declare
  v_old_date date;
  v_occupant_id uuid;
begin
  select date into v_old_date from public.gym_sessions where id = p_id;
  if v_old_date is null or v_old_date = p_new_date then
    return;
  end if;
  select id into v_occupant_id from public.gym_sessions where date = p_new_date and id <> p_id;
  if v_occupant_id is null then
    update public.gym_sessions set date = p_new_date where id = p_id;
  else
    update public.gym_sessions set date = date '9999-01-01' where id = v_occupant_id;
    update public.gym_sessions set date = p_new_date where id = p_id;
    update public.gym_sessions set date = v_old_date where id = v_occupant_id;
  end if;
end;
$$;

grant execute on function public.move_session(uuid, date) to authenticated;
