import { addDays, formatISODate, parseISODate, startOfWeek } from "./date";
import type { GymSubcategory, PerformedSet, Session } from "./types";

export function totalLoad(sets: PerformedSet[]): number {
  return sets.reduce((acc, set) => acc + set.reps * set.weight, 0);
}

export function totalReps(sets: PerformedSet[]): number {
  return sets.reduce((acc, set) => acc + set.reps, 0);
}

export function recordedSets(sets: PerformedSet[]): PerformedSet[] {
  return sets.filter((set) => set.reps > 0 || set.weight > 0);
}

export function estimatedOneRepMax(set: PerformedSet): number {
  if (set.reps <= 0 || set.weight <= 0) return 0;
  return set.weight * (1 + set.reps / 30);
}

export interface SessionMetrics {
  totalLoad: number;
  totalReps: number;
  completedSets: number;
  recordedExercises: number;
  plannedExercises: number;
  heaviestSet: (PerformedSet & { exerciseName: string }) | null;
}

export function getSessionMetrics(session: Session): SessionMetrics {
  let sessionLoad = 0;
  let reps = 0;
  let sets = 0;
  let recordedExercisesCount = 0;
  let heaviestSet: SessionMetrics["heaviestSet"] = null;

  for (const performed of session.performed) {
    const planned = session.exercises.find(
      (exercise) => exercise.id === performed.plannedExerciseId,
    );
    const validSets = recordedSets(performed.sets);
    if (validSets.length === 0) continue;

    recordedExercisesCount += 1;
    sessionLoad += totalLoad(validSets);
    reps += totalReps(validSets);
    sets += validSets.length;

    for (const set of validSets) {
      if (!heaviestSet || set.weight > heaviestSet.weight) {
        heaviestSet = {
          ...set,
          exerciseName: planned?.name ?? "Unknown exercise",
        };
      }
    }
  }

  return {
    totalLoad: sessionLoad,
    totalReps: reps,
    completedSets: sets,
    recordedExercises: recordedExercisesCount,
    plannedExercises: session.exercises.length,
    heaviestSet,
  };
}

export interface ExercisePerformance {
  id: string;
  date: string;
  exerciseId: string;
  exerciseName: string;
  sets: PerformedSet[];
  totalLoad: number;
  totalReps: number;
  maxWeight: number;
  bestEstimatedOneRepMax: number;
}

export function getExercisePerformances(
  sessions: Session[],
  exerciseId: string,
  upToDate: string,
  includeUpToDate = true,
): ExercisePerformance[] {
  if (exerciseId === "") return [];

  return sessions
    .flatMap((session) => {
      if (
        includeUpToDate ? session.date > upToDate : session.date >= upToDate
      ) {
        return [];
      }

      return session.exercises
        .filter((exercise) => exercise.exerciseId === exerciseId)
        .flatMap((exercise) => {
          const performed = session.performed.find(
            (entry) => entry.plannedExerciseId === exercise.id,
          );
          if (!performed) return [];

          const sets = recordedSets(performed.sets);
          if (sets.length === 0) return [];

          return [
            {
              id: `${session.id}-${exercise.id}`,
              date: session.date,
              exerciseId,
              exerciseName: exercise.name,
              sets,
              totalLoad: totalLoad(sets),
              totalReps: totalReps(sets),
              maxWeight: Math.max(...sets.map((set) => set.weight)),
              bestEstimatedOneRepMax: Math.max(...sets.map(estimatedOneRepMax)),
            },
          ];
        });
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface FocusLoadSummary {
  subcategory: GymSubcategory;
  sessions: number;
  load: number;
}

export interface ExerciseLoadSummary {
  exerciseId: string;
  name: string;
  sessions: number;
  load: number;
  maxWeight: number;
  bestEstimatedOneRepMax: number;
}

export interface GymOverviewStats {
  completedSessions: number;
  plannedSessions: number;
  inProgressSessions: number;
  totalLoad: number;
  totalReps: number;
  completedSets: number;
  averageLoad: number;
  thisWeekLoad: number;
  previousWeekLoad: number;
  weekLoadDelta: number;
  bestSession: {
    id: string;
    date: string;
    subcategory: GymSubcategory;
    load: number;
  } | null;
  lastCompleted: {
    id: string;
    date: string;
    subcategory: GymSubcategory;
    load: number;
  } | null;
  focusBreakdown: FocusLoadSummary[];
  topExercises: ExerciseLoadSummary[];
}

export function getGymOverviewStats(
  sessions: Session[],
  today: string,
): GymOverviewStats {
  const weekStart = startOfWeek(parseISODate(today));
  const thisWeekStart = formatISODate(weekStart);
  const previousWeekStart = formatISODate(addDays(weekStart, -7));

  const focusMap = new Map<GymSubcategory, FocusLoadSummary>();
  const exerciseMap = new Map<string, ExerciseLoadSummary>();

  let completedSessions = 0;
  let plannedSessions = 0;
  let inProgressSessions = 0;
  let totalGymLoad = 0;
  let reps = 0;
  let sets = 0;
  let thisWeekLoad = 0;
  let previousWeekLoad = 0;
  let bestSession: GymOverviewStats["bestSession"] = null;
  let lastCompleted: GymOverviewStats["lastCompleted"] = null;

  for (const session of sessions) {
    if (session.status === "planned") plannedSessions += 1;
    if (session.status === "in_progress") inProgressSessions += 1;
    if (session.status !== "completed") continue;

    completedSessions += 1;
    const metrics = getSessionMetrics(session);
    totalGymLoad += metrics.totalLoad;
    reps += metrics.totalReps;
    sets += metrics.completedSets;

    if (session.date >= thisWeekStart && session.date <= today) {
      thisWeekLoad += metrics.totalLoad;
    } else if (
      session.date >= previousWeekStart &&
      session.date < thisWeekStart
    ) {
      previousWeekLoad += metrics.totalLoad;
    }

    if (!bestSession || metrics.totalLoad > bestSession.load) {
      bestSession = {
        id: session.id,
        date: session.date,
        subcategory: session.subcategory,
        load: metrics.totalLoad,
      };
    }

    if (!lastCompleted || session.date > lastCompleted.date) {
      lastCompleted = {
        id: session.id,
        date: session.date,
        subcategory: session.subcategory,
        load: metrics.totalLoad,
      };
    }

    const focus = focusMap.get(session.subcategory) ?? {
      subcategory: session.subcategory,
      sessions: 0,
      load: 0,
    };
    focus.sessions += 1;
    focus.load += metrics.totalLoad;
    focusMap.set(session.subcategory, focus);

    for (const performed of session.performed) {
      const planned = session.exercises.find(
        (exercise) => exercise.id === performed.plannedExerciseId,
      );
      if (!planned) continue;

      const validSets = recordedSets(performed.sets);
      if (validSets.length === 0) continue;

      const exercise = exerciseMap.get(planned.exerciseId) ?? {
        exerciseId: planned.exerciseId,
        name: planned.name,
        sessions: 0,
        load: 0,
        maxWeight: 0,
        bestEstimatedOneRepMax: 0,
      };
      exercise.sessions += 1;
      exercise.load += totalLoad(validSets);
      exercise.maxWeight = Math.max(
        exercise.maxWeight,
        ...validSets.map((set) => set.weight),
      );
      exercise.bestEstimatedOneRepMax = Math.max(
        exercise.bestEstimatedOneRepMax,
        ...validSets.map(estimatedOneRepMax),
      );
      exerciseMap.set(planned.exerciseId, exercise);
    }
  }

  return {
    completedSessions,
    plannedSessions,
    inProgressSessions,
    totalLoad: totalGymLoad,
    totalReps: reps,
    completedSets: sets,
    averageLoad:
      completedSessions > 0 ? Math.round(totalGymLoad / completedSessions) : 0,
    thisWeekLoad,
    previousWeekLoad,
    weekLoadDelta: thisWeekLoad - previousWeekLoad,
    bestSession,
    lastCompleted,
    focusBreakdown: [...focusMap.values()].sort((a, b) => b.load - a.load),
    topExercises: [...exerciseMap.values()]
      .sort((a, b) => b.load - a.load)
      .slice(0, 5),
  };
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
    const sets = recordedSets(performed.sets);
    if (sets.length === 0) continue;
    points.push({ date: session.date, load: totalLoad(sets) });
  }
  return points.sort((a, b) => a.date.localeCompare(b.date));
}
