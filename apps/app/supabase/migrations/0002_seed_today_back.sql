-- Subcategorias (idempotente).
insert into public.gym_subcategories (slug, name) values
  ('back', 'Back'),
  ('chest', 'Chest'),
  ('legs', 'Legs'),
  ('shoulders', 'Shoulders'),
  ('arms', 'Arms'),
  ('core', 'Core'),
  ('full-body', 'Full body')
on conflict (slug) do nothing;

do $$
declare
  v_session_id uuid;
  v_dominadas uuid;
  v_remo_bilateral uuid;
  v_remo_unilateral uuid;
  v_curl_biceps uuid;
  v_encogimiento uuid;
  v_face_pull uuid;
begin
  -- Catalogo de ejercicios para back.
  insert into public.gym_exercises (name, subcategory_slug) values ('Dominadas', 'back') returning id into v_dominadas;
  insert into public.gym_exercises (name, subcategory_slug) values ('Remo bilateral', 'back') returning id into v_remo_bilateral;
  insert into public.gym_exercises (name, subcategory_slug) values ('Remo unilateral', 'back') returning id into v_remo_unilateral;
  insert into public.gym_exercises (name, subcategory_slug) values ('Curl de biceps', 'back') returning id into v_curl_biceps;
  insert into public.gym_exercises (name, subcategory_slug) values ('Encogimiento de hombros', 'back') returning id into v_encogimiento;
  insert into public.gym_exercises (name, subcategory_slug) values ('Face pull', 'back') returning id into v_face_pull;

  -- Sesion de hoy.
  insert into public.gym_sessions (date, subcategory_slug, status)
    values (date '2026-06-11', 'back', 'planned')
    returning id into v_session_id;

  -- Ejercicios planificados de la sesion.
  insert into public.gym_session_exercises (session_id, exercise_id, target_sets, target_reps, position) values
    (v_session_id, v_dominadas,        5, 5,  0),
    (v_session_id, v_remo_bilateral,   4, 8,  1),
    (v_session_id, v_remo_unilateral,  4, 10, 2),
    (v_session_id, v_curl_biceps,      4, 8,  3),
    (v_session_id, v_encogimiento,     3, 8,  4),
    (v_session_id, v_face_pull,        3, 8,  5);
end $$;
