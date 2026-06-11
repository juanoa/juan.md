import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";

import type { PerformedSet } from "../../lib/gym/types";
import { totalLoad, type ExerciseHistoryPoint } from "../../lib/gym/stats";
import { ExerciseLoadChart } from "./exercise-load-chart";

interface CompletedExerciseCardProps {
  name: string;
  sets: PerformedSet[];
  history: ExerciseHistoryPoint[];
  currentDate: string;
}

export function CompletedExerciseCard({
  name,
  sets,
  history,
  currentDate,
}: CompletedExerciseCardProps) {
  const load = totalLoad(sets);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <span>{name}</span>
          <span className="text-muted-foreground">{load}kg</span>
        </CardTitle>
      </CardHeader>
      {sets.length > 0 && (
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {sets.map((set, index) => (
              <span key={index} className="whitespace-nowrap">
                <span className="font-medium">{set.reps}</span>
                <span className="text-muted-foreground"> x {set.weight}kg</span>
              </span>
            ))}
          </div>
          {history.length > 0 && (
            <ExerciseLoadChart data={history} currentDate={currentDate} />
          )}
        </CardContent>
      )}
    </Card>
  );
}
