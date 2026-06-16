import { supabase } from "../supabase/client";
import type {
  Exercise,
  GymSubcategory,
  PerformedExercise,
  PerformedSet,
  Session,
  SessionDraft,
  SessionStatus,
} from "./types";

interface GymSessionRow {
  id: string;
  date: string;
  subcategory_slug: GymSubcategory;
  status: SessionStatus;
  gym_session_exercises: GymSessionExerciseRow[];
}

interface GymSessionExerciseRow {
  id: string;
  target_sets: number;
  target_reps: number;
  target_weight: number | null;
  position: number;
  exercise: { id: string; name: string } | null;
  gym_performed_sets: GymPerformedSetRow[];
}

interface GymPerformedSetRow {
  set_index: number;
  reps: number;
  weight: number;
}

function mapSession(row: GymSessionRow): Session {
  const planned = [...row.gym_session_exercises].sort(
    (a, b) => a.position - b.position,
  );

  const performed: PerformedExercise[] = planned
    .map((entry) => {
      if (entry.gym_performed_sets.length === 0) return null;
      const sorted = [...entry.gym_performed_sets].sort(
        (a, b) => a.set_index - b.set_index,
      );
      const maxIndex = sorted[sorted.length - 1].set_index;
      const sets: PerformedSet[] = Array.from({ length: maxIndex + 1 }, () => ({
        reps: 0,
        weight: 0,
      }));
      for (const set of sorted) {
        sets[set.set_index] = { reps: set.reps, weight: set.weight };
      }
      return {
        plannedExerciseId: entry.id,
        sets,
      };
    })
    .filter((entry): entry is PerformedExercise => entry !== null);

  return {
    id: row.id,
    kind: "gym",
    date: row.date,
    subcategory: row.subcategory_slug,
    status: row.status,
    exercises: planned.map((entry) => ({
      id: entry.id,
      exerciseId: entry.exercise?.id ?? "",
      name: entry.exercise?.name ?? "",
      targetSets: entry.target_sets,
      targetReps: entry.target_reps,
      targetWeight: entry.target_weight,
    })),
    performed,
  };
}

export async function fetchSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from("gym_sessions")
    .select(
      "id, date, subcategory_slug, status, gym_session_exercises(id, target_sets, target_reps, target_weight, position, exercise:gym_exercises(id, name), gym_performed_sets(set_index, reps, weight))",
    )
    .order("date", { ascending: true });

  if (error) throw error;
  return (data as unknown as GymSessionRow[]).map(mapSession);
}

export async function moveSession(id: string, newDate: string): Promise<void> {
  const { error } = await supabase.rpc("move_session", {
    p_id: id,
    p_new_date: newDate,
  });
  if (error) throw error;
}

export async function recordSet(
  sessionId: string,
  plannedExerciseId: string,
  setIndex: number,
  set: PerformedSet,
): Promise<void> {
  const { error: upsertError } = await supabase
    .from("gym_performed_sets")
    .upsert(
      {
        session_exercise_id: plannedExerciseId,
        set_index: setIndex,
        reps: set.reps,
        weight: set.weight,
      },
      { onConflict: "session_exercise_id,set_index" },
    );
  if (upsertError) throw upsertError;

  const { error: statusError } = await supabase
    .from("gym_sessions")
    .update({ status: "in_progress" })
    .eq("id", sessionId)
    .eq("status", "planned");
  if (statusError) throw statusError;
}

export async function finishSession(id: string): Promise<void> {
  const { error } = await supabase
    .from("gym_sessions")
    .update({ status: "completed" })
    .eq("id", id);
  if (error) throw error;
}

interface GymExerciseRow {
  id: string;
  name: string;
  subcategory_slug: GymSubcategory;
}

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from("gym_exercises")
    .select("id, name, subcategory_slug")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as GymExerciseRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    subcategory: row.subcategory_slug,
  }));
}

export async function createExercise(
  name: string,
  subcategory: GymSubcategory,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from("gym_exercises")
    .insert({ name, subcategory_slug: subcategory })
    .select("id, name, subcategory_slug")
    .single();
  if (error) throw error;
  const row = data as GymExerciseRow;
  return { id: row.id, name: row.name, subcategory: row.subcategory_slug };
}

export async function createSession(draft: SessionDraft): Promise<Session> {
  const { data: sessionRow, error: insertError } = await supabase
    .from("gym_sessions")
    .insert({
      date: draft.date,
      subcategory_slug: draft.subcategory,
      status: "planned",
    })
    .select("id")
    .single();
  if (insertError) throw insertError;

  const sessionId = (sessionRow as { id: string }).id;

  if (draft.exercises.length > 0) {
    const { error: exercisesError } = await supabase
      .from("gym_session_exercises")
      .insert(
        draft.exercises.map((entry, index) => ({
          session_id: sessionId,
          exercise_id: entry.exerciseId,
          target_sets: entry.targetSets,
          target_reps: entry.targetReps,
          target_weight: entry.targetWeight ?? null,
          position: index,
        })),
      );
    if (exercisesError) throw exercisesError;
  }

  const { data, error } = await supabase
    .from("gym_sessions")
    .select(
      "id, date, subcategory_slug, status, gym_session_exercises(id, target_sets, target_reps, target_weight, position, exercise:gym_exercises(id, name), gym_performed_sets(set_index, reps, weight))",
    )
    .eq("id", sessionId)
    .single();
  if (error) throw error;
  return mapSession(data as unknown as GymSessionRow);
}
