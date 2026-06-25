import type {
  GymSubcategory,
  PerformedSet,
  PlannedExercise,
  SessionStatus,
} from "../../lib/gym/types";
import { GYM_SUBCATEGORIES } from "../../lib/gym/types";

export function getSubcategoryName(subcategory: GymSubcategory): string {
  return (
    GYM_SUBCATEGORIES.find((entry) => entry.slug === subcategory)?.name ??
    subcategory
  );
}

export function formatWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatKg(value: number): string {
  return `${Math.round(value).toLocaleString()}kg`;
}

export function formatSessionCount(value: number): string {
  return `${value} ${value === 1 ? "session" : "sessions"}`;
}

export function formatPlanSummary(planned: PlannedExercise[]): string {
  if (planned.length === 0) return "No plan";
  return planned
    .map((exercise) => {
      const base = `${exercise.targetSets}x${exercise.targetReps}`;
      return exercise.targetWeight === null
        ? base
        : `${base} @ ${formatWeight(exercise.targetWeight)}kg`;
    })
    .join(", ");
}

export function formatSetSummary(sets: PerformedSet[]): string {
  if (sets.length === 0) return "No recorded sets";
  return sets
    .map((set) => `${set.reps} x ${formatWeight(set.weight)}kg`)
    .join(", ");
}

export function getStatusLabel(status: SessionStatus): string {
  if (status === "in_progress") return "In progress";
  return status[0].toUpperCase() + status.slice(1);
}
