export type GymSubcategory =
  | "back"
  | "chest"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "full-body";

export const GYM_SUBCATEGORIES: { slug: GymSubcategory; name: string }[] = [
  { slug: "back", name: "Back" },
  { slug: "chest", name: "Chest" },
  { slug: "legs", name: "Legs" },
  { slug: "shoulders", name: "Shoulders" },
  { slug: "arms", name: "Arms" },
  { slug: "core", name: "Core" },
  { slug: "full-body", name: "Full body" },
];

export type ExerciseWeightType = "weighted" | "unweighted";

export const EXERCISE_WEIGHT_TYPES: {
  value: ExerciseWeightType;
  name: string;
}[] = [
  { value: "weighted", name: "Weighted" },
  { value: "unweighted", name: "No weight" },
];

export interface Exercise {
  id: string;
  name: string;
  subcategory: GymSubcategory;
  weightType: ExerciseWeightType;
  archivedAt: string | null;
}

export interface ExerciseInput {
  name: string;
  subcategory: GymSubcategory;
  weightType: ExerciseWeightType;
}

export type ExerciseDeleteResult = {
  action: "deleted" | "archived";
};

export interface SessionDraftExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeight?: number;
}

export interface SessionDraft {
  date: string;
  subcategory: GymSubcategory;
  exercises: SessionDraftExercise[];
}

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  name: string;
  weightType: ExerciseWeightType;
  targetSets: number;
  targetReps: number;
  targetWeight: number | null;
}

export interface PerformedSet {
  reps: number;
  weight: number;
}

export interface PerformedExercise {
  plannedExerciseId: string;
  sets: PerformedSet[];
}

export type SessionStatus = "planned" | "in_progress" | "completed";

export interface GymSession {
  id: string;
  kind: "gym";
  date: string;
  subcategory: GymSubcategory;
  exercises: PlannedExercise[];
  performed: PerformedExercise[];
  status: SessionStatus;
}

export type Session = GymSession;
