alter table public.gym_exercises
  add column archived_at timestamptz;

create index if not exists gym_exercises_active_idx
  on public.gym_exercises (name)
  where archived_at is null;

create index if not exists gym_session_exercises_exercise_id_idx
  on public.gym_session_exercises (exercise_id);
