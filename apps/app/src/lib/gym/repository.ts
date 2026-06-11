import { supabase } from "../supabase/client";
import type {
  GymSubcategory,
  PerformedExercise,
  PerformedSet,
  Session,
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
    })),
    performed,
  };
}

export async function fetchSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from("gym_sessions")
    .select(
      "id, date, subcategory_slug, status, gym_session_exercises(id, target_sets, target_reps, position, exercise:gym_exercises(id, name), gym_performed_sets(set_index, reps, weight))",
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
