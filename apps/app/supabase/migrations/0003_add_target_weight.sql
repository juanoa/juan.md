alter table public.gym_session_exercises
  add column target_weight numeric(6,2) check (target_weight >= 0);
