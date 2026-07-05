import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";

import type { ExerciseWeightType, PerformedSet } from "../../lib/gym/types";
import { totalLoad, type ExerciseHistoryPoint } from "../../lib/gym/stats";
import {
  formatLoad,
  formatSetSummary,
  getVolumeLabel,
} from "./exercise-format";
import { ExerciseLoadChart } from "./exercise-load-chart";

interface CompletedExerciseCardProps {
  name: string;
  weightType: ExerciseWeightType;
  sets: PerformedSet[];
  notes: string;
  history: ExerciseHistoryPoint[];
  currentDate: string;
}

export function CompletedExerciseCard({
  name,
  weightType,
  sets,
  notes,
  history,
  currentDate,
}: CompletedExerciseCardProps) {
  const load = totalLoad(sets, weightType);
  const trimmedNotes = notes.trim();
  const hasSets = sets.length > 0;

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <span>{name}</span>
          {hasSets && (
            <span className="text-muted-foreground">
              {formatLoad(load, weightType)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      {(hasSets || trimmedNotes.length > 0) && (
        <CardContent className="flex flex-col gap-6">
          {hasSets && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span className="whitespace-normal">
                {formatSetSummary(sets, weightType)}
              </span>
            </div>
          )}
          {trimmedNotes.length > 0 && (
            <p className="border-border bg-muted/20 border p-3 text-xs/relaxed whitespace-pre-wrap">
              {trimmedNotes}
            </p>
          )}
          {hasSets && history.length > 0 && (
            <ExerciseLoadChart
              data={history}
              currentDate={currentDate}
              valueLabel={getVolumeLabel(weightType)}
              formatValue={(value) => formatLoad(value, weightType)}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
