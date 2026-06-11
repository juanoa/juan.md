import type { PerformedSet, Session } from "./types";

export function totalLoad(sets: PerformedSet[]): number {
  return sets.reduce((acc, set) => acc + set.reps * set.weight, 0);
}

export interface ExerciseHistoryPoint {
  date: string;
  load: number;
}

export function getExerciseHistory(
  sessions: Session[],
  exerciseId: string,
  upToDate: string,
): ExerciseHistoryPoint[] {
  const points: ExerciseHistoryPoint[] = [];
  for (const session of sessions) {
    if (session.date > upToDate) continue;
    const planned = session.exercises.find(
      (entry) => entry.exerciseId === exerciseId,
    );
    if (!planned) continue;
    const performed = session.performed.find(
      (entry) => entry.plannedExerciseId === planned.id,
    );
    if (!performed || performed.sets.length === 0) continue;
    points.push({ date: session.date, load: totalLoad(performed.sets) });
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}
