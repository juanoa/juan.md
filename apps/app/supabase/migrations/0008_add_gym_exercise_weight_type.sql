do $$
begin
  create type public.gym_exercise_weight_type as enum ('weighted', 'unweighted');
exception
  when duplicate_object then null;
end $$;

alter table public.gym_exercises
  add column weight_type public.gym_exercise_weight_type not null default 'weighted';

update public.gym_exercises
set weight_type = 'unweighted'
where id in (
  '0fb9d2d7-dd83-45a9-be5f-d685a96766ea',
  'f045adb8-5420-454a-89bf-2f81e9c6f456'
);

update public.gym_session_exercises
set target_weight = null
where exercise_id in (
  '0fb9d2d7-dd83-45a9-be5f-d685a96766ea',
  'f045adb8-5420-454a-89bf-2f81e9c6f456'
);
