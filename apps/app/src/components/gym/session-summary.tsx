import type { PlannedExercise } from "../../lib/gym/types";

interface SessionSummaryProps {
  exercises: PlannedExercise[];
}

export function SessionSummary({ exercises }: SessionSummaryProps) {
  return (
    <ul className="flex flex-col gap-1.5">
      {exercises.map((exercise) => (
        <li key={exercise.id} className="text-sm">
          <span className="font-medium">
            {exercise.targetSets}x{exercise.targetReps}
          </span>{" "}
          <span className="text-muted-foreground">{exercise.name}</span>
        </li>
      ))}
    </ul>
  );
}
