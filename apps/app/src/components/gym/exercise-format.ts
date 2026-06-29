import type {
  ExerciseWeightType,
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

export function formatVolume(value: number): string {
  return Math.round(value).toLocaleString();
}

export function formatLoad(
  value: number,
  weightType: ExerciseWeightType,
): string {
  return weightType === "weighted" ? formatKg(value) : formatVolume(value);
}

export function getVolumeLabel(weightType: ExerciseWeightType): string {
  return weightType === "weighted" ? "Load" : "Volume";
}

export function formatSessionCount(value: number): string {
  return `${value} ${value === 1 ? "session" : "sessions"}`;
}

export function formatPlanSummary(planned: PlannedExercise[]): string {
  if (planned.length === 0) return "No plan";
  return planned
    .map((exercise) => {
      const base = `${exercise.targetSets}x${exercise.targetReps}`;
      return exercise.weightType === "unweighted" ||
        exercise.targetWeight === null
        ? base
        : `${base} @ ${formatWeight(exercise.targetWeight)}kg`;
    })
    .join(", ");
}

export function formatSetSummary(
  sets: PerformedSet[],
  weightType: ExerciseWeightType,
): string {
  if (sets.length === 0) return "No recorded sets";
  return sets
    .map((set) =>
      weightType === "weighted"
        ? `${set.reps} x ${formatWeight(set.weight)}kg`
        : `${set.reps} reps`,
    )
    .join(", ");
}

export function getStatusLabel(status: SessionStatus): string {
  if (status === "in_progress") return "In progress";
  return status[0].toUpperCase() + status.slice(1);
}
