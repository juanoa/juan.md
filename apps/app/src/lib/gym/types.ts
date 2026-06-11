export type GymSubcategory =
  | "back"
  | "chest"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"
  | "full-body";

export interface PlannedExercise {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
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
