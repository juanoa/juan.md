import { addDays, formatISODate, startOfWeek } from "./date";
import type { GymSession, PlannedExercise } from "./types";

function exercise(
  id: string,
  name: string,
  targetSets: number,
  targetReps: number,
): PlannedExercise {
  return { id, name, targetSets, targetReps };
}

const BACK: PlannedExercise[] = [
  exercise("back-1", "Bench press", 5, 8),
  exercise("back-2", "Press banca inclinado", 4, 7),
  exercise("back-3", "Curl de Biceps", 5, 6),
];

const CHEST: PlannedExercise[] = [
  exercise("chest-1", "Press militar", 4, 8),
  exercise("chest-2", "Aperturas con mancuerna", 4, 10),
  exercise("chest-3", "Fondos", 3, 12),
];

const LEGS: PlannedExercise[] = [
  exercise("legs-1", "Sentadilla", 5, 6),
  exercise("legs-2", "Prensa", 4, 10),
  exercise("legs-3", "Curl femoral", 4, 12),
];

const SHOULDERS: PlannedExercise[] = [
  exercise("shoulders-1", "Press hombro mancuerna", 4, 8),
  exercise("shoulders-2", "Elevaciones laterales", 4, 12),
  exercise("shoulders-3", "Pajaros", 3, 12),
];

const ARMS: PlannedExercise[] = [
  exercise("arms-1", "Curl barra", 4, 10),
  exercise("arms-2", "Frances con barra", 4, 10),
  exercise("arms-3", "Martillo con mancuerna", 3, 12),
];

export function buildMockSessions(today: Date): GymSession[] {
  const monday = startOfWeek(today);
  const lastMonday = addDays(monday, -7);

  return [
    {
      id: "s-prev-1",
      kind: "gym",
      date: formatISODate(addDays(lastMonday, 0)),
      subcategory: "legs",
      exercises: LEGS,
      performed: [],
      status: "completed",
    },
    {
      id: "s-prev-2",
      kind: "gym",
      date: formatISODate(addDays(lastMonday, 2)),
      subcategory: "chest",
      exercises: CHEST,
      performed: [],
      status: "completed",
    },
    {
      id: "s-prev-3",
      kind: "gym",
      date: formatISODate(addDays(lastMonday, 4)),
      subcategory: "shoulders",
      exercises: SHOULDERS,
      performed: [],
      status: "completed",
    },
    {
      id: "s-cur-1",
      kind: "gym",
      date: formatISODate(addDays(monday, 0)),
      subcategory: "back",
      exercises: BACK,
      performed: [],
      status: "planned",
    },
    {
      id: "s-cur-2",
      kind: "gym",
      date: formatISODate(addDays(monday, 1)),
      subcategory: "chest",
      exercises: CHEST,
      performed: [],
      status: "planned",
    },
    {
      id: "s-cur-3",
      kind: "gym",
      date: formatISODate(addDays(monday, 2)),
      subcategory: "legs",
      exercises: LEGS,
      performed: [],
      status: "planned",
    },
    {
      id: "s-cur-4",
      kind: "gym",
      date: formatISODate(addDays(monday, 3)),
      subcategory: "back",
      exercises: BACK,
      performed: [],
      status: "planned",
    },
    {
      id: "s-cur-5",
      kind: "gym",
      date: formatISODate(addDays(monday, 4)),
      subcategory: "arms",
      exercises: ARMS,
      performed: [],
      status: "planned",
    },
  ];
}
