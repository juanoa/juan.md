import { supabase } from "../supabase/client";
import type {
  Exercise,
  ExerciseDeleteResult,
  ExerciseInput,
  ExerciseWeightType,
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
  exercise_id?: string;
  target_sets: number;
  target_reps: number;
  target_weight: number | null;
  notes: string | null;
  position: number;
  exercise: {
    id: string;
    name: string;
    weight_type: ExerciseWeightType;
  } | null;
  gym_performed_sets: GymPerformedSetRow[];
}

interface GymPerformedSetRow {
  set_index: number;
  reps: number;
  weight: number;
}

const SESSION_SELECT =
  "id, date, subcategory_slug, status, gym_session_exercises(id, target_sets, target_reps, target_weight, notes, position, exercise:gym_exercises(id, name, weight_type), gym_performed_sets(set_index, reps, weight))";

const EXERCISE_SELECT = "id, name, subcategory_slug, weight_type, archived_at";

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
      weightType: entry.exercise?.weight_type ?? "weighted",
      targetSets: entry.target_sets,
      targetReps: entry.target_reps,
      targetWeight: entry.target_weight,
      notes: entry.notes ?? "",
    })),
    performed,
  };
}

export async function fetchSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from("gym_sessions")
    .select(SESSION_SELECT)
    .order("date", { ascending: true });

  if (error) throw error;
  return (data as unknown as GymSessionRow[]).map(mapSession);
}

export async function moveSession(id: string, newDate: string): Promise<void> {
  const { error } = await supabase
    .from("gym_sessions")
    .update({ date: newDate })
    .eq("id", id);
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

export async function recordExerciseNotes(
  sessionId: string,
  plannedExerciseId: string,
  notes: string,
): Promise<void> {
  const { error: notesError } = await supabase
    .from("gym_session_exercises")
    .update({ notes })
    .eq("id", plannedExerciseId)
    .eq("session_id", sessionId);
  if (notesError) throw notesError;

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

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from("gym_sessions").delete().eq("id", id);
  if (error) throw error;
}

interface GymExerciseRow {
  id: string;
  name: string;
  subcategory_slug: GymSubcategory;
  weight_type: ExerciseWeightType;
  archived_at: string | null;
}

function mapExercise(row: GymExerciseRow): Exercise {
  return {
    id: row.id,
    name: row.name,
    subcategory: row.subcategory_slug,
    weightType: row.weight_type,
    archivedAt: row.archived_at,
  };
}

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from("gym_exercises")
    .select(EXERCISE_SELECT)
    .is("archived_at", null)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as GymExerciseRow[]).map(mapExercise);
}

export async function createExercise(input: ExerciseInput): Promise<Exercise> {
  const { data, error } = await supabase
    .from("gym_exercises")
    .insert({
      name: input.name,
      subcategory_slug: input.subcategory,
      weight_type: input.weightType,
    })
    .select(EXERCISE_SELECT)
    .single();
  if (error) throw error;
  return mapExercise(data as GymExerciseRow);
}

export async function updateExercise(
  id: string,
  input: ExerciseInput,
): Promise<Exercise> {
  const { data, error } = await supabase
    .from("gym_exercises")
    .update({
      name: input.name,
      subcategory_slug: input.subcategory,
      weight_type: input.weightType,
    })
    .eq("id", id)
    .select(EXERCISE_SELECT)
    .single();
  if (error) throw error;
  return mapExercise(data as GymExerciseRow);
}

export async function deleteExercise(
  id: string,
): Promise<ExerciseDeleteResult> {
  const { count, error: countError } = await supabase
    .from("gym_session_exercises")
    .select("id", { count: "exact", head: true })
    .eq("exercise_id", id);
  if (countError) throw countError;

  if ((count ?? 0) > 0) {
    const { error } = await supabase
      .from("gym_exercises")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return { action: "archived" };
  }

  const { error } = await supabase.from("gym_exercises").delete().eq("id", id);
  if (error) throw error;
  return { action: "deleted" };
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
    .select(SESSION_SELECT)
    .eq("id", sessionId)
    .single();
  if (error) throw error;
  return mapSession(data as unknown as GymSessionRow);
}

interface ExistingSessionExerciseRow {
  id: string;
  exercise_id: string;
}

export async function updateSession(
  id: string,
  draft: SessionDraft,
): Promise<Session> {
  const { error: sessionError } = await supabase
    .from("gym_sessions")
    .update({
      date: draft.date,
      subcategory_slug: draft.subcategory,
    })
    .eq("id", id);
  if (sessionError) throw sessionError;

  const { data: existingData, error: existingError } = await supabase
    .from("gym_session_exercises")
    .select("id, exercise_id")
    .eq("session_id", id)
    .order("position", { ascending: true });
  if (existingError) throw existingError;

  const existing = (existingData as ExistingSessionExerciseRow[]) ?? [];
  const staleIds = existing
    .slice(draft.exercises.length)
    .map((entry) => entry.id);

  if (staleIds.length > 0) {
    const { error } = await supabase
      .from("gym_session_exercises")
      .delete()
      .in("id", staleIds);
    if (error) throw error;
  }

  for (const [position, entry] of draft.exercises.entries()) {
    const current = existing[position];
    if (!current) {
      const { error } = await supabase.from("gym_session_exercises").insert({
        session_id: id,
        exercise_id: entry.exerciseId,
        target_sets: entry.targetSets,
        target_reps: entry.targetReps,
        target_weight: entry.targetWeight ?? null,
        position,
      });
      if (error) throw error;
      continue;
    }

    if (current.exercise_id !== entry.exerciseId) {
      const { error } = await supabase
        .from("gym_performed_sets")
        .delete()
        .eq("session_exercise_id", current.id);
      if (error) throw error;
    }

    const { error } = await supabase
      .from("gym_session_exercises")
      .update({
        exercise_id: entry.exerciseId,
        target_sets: entry.targetSets,
        target_reps: entry.targetReps,
        target_weight: entry.targetWeight ?? null,
        position,
      })
      .eq("id", current.id);
    if (error) throw error;
  }

  const { data, error } = await supabase
    .from("gym_sessions")
    .select(SESSION_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return mapSession(data as unknown as GymSessionRow);
}
