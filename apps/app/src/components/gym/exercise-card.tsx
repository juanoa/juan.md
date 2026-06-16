import { PlusIcon } from "@phosphor-icons/react";
import { Fragment, useMemo, useState } from "react";

import { Button } from "@juan/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";

import type {
  PerformedExercise,
  PerformedSet,
  PlannedExercise,
} from "../../lib/gym/types";
import { getExercisePerformances } from "../../lib/gym/stats";
import { useGymContext } from "./GymContext";
import { SetRow } from "./set-row";

interface ExerciseCardProps {
  sessionId: string;
  sessionDate: string;
  exercise: PlannedExercise;
  performed: PerformedExercise | undefined;
}

export function ExerciseCard({
  sessionId,
  sessionDate,
  exercise,
  performed,
}: ExerciseCardProps) {
  const { recordSet, sessions } = useGymContext();
  const [extraSets, setExtraSets] = useState(0);
  const history = useMemo(
    () =>
      getExercisePerformances(
        sessions,
        exercise.exerciseId,
        sessionDate,
        false,
      ),
    [exercise.exerciseId, sessionDate, sessions],
  );
  const latest = history[history.length - 1];
  const best = history.reduce(
    (currentBest, entry) =>
      !currentBest || entry.totalLoad > currentBest.totalLoad
        ? entry
        : currentBest,
    null as (typeof history)[number] | null,
  );
  const suggestedWeight =
    latest?.sets.find((set) => set.reps >= exercise.targetReps)?.weight ??
    latest?.maxWeight ??
    exercise.targetWeight;
  const shouldShowSuggestedWeight =
    suggestedWeight !== null &&
    suggestedWeight !== undefined &&
    suggestedWeight > 0;

  const totalSets = Math.max(
    exercise.targetSets,
    performed?.sets.length ?? 0,
    exercise.targetSets + extraSets,
  );

  const handleCommit = (setIndex: number) => (set: PerformedSet) => {
    recordSet(sessionId, exercise.id, setIndex, set);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
          <span>
            {exercise.targetSets}x{exercise.targetReps}
          </span>
          <span className="text-muted-foreground font-normal">
            {exercise.name}
          </span>
          {shouldShowSuggestedWeight && (
            <span className="text-muted-foreground text-xs font-normal">
              target {formatKg(suggestedWeight)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {latest && (
          <ExerciseHistoryStrip
            latest={latest}
            bestLoad={best?.totalLoad ?? latest.totalLoad}
          />
        )}
        <div className="flex flex-col gap-8 lg:gap-2">
          {Array.from({ length: totalSets }, (_, setIndex) => (
            <Fragment key={setIndex}>
              <SetRow
                setIndex={setIndex}
                performed={performed?.sets[setIndex]}
                targetWeight={exercise.targetWeight}
                onCommit={handleCommit(setIndex)}
              />
              <hr className="lg:hidden" />
            </Fragment>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="w-fit"
            onClick={() => setExtraSets((value) => value + 1)}>
            <PlusIcon /> Add set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatKg(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}kg`;
}

function ExerciseHistoryStrip({
  latest,
  bestLoad,
}: {
  latest: NonNullable<
    ReturnType<typeof getExercisePerformances>[number] | undefined
  >;
  bestLoad: number;
}) {
  return (
    <div className="ring-foreground/10 grid grid-cols-2 gap-2 p-2 text-xs ring-1 lg:grid-cols-4">
      <HistoryMetric label="Last" value={`${latest.date}`} />
      <HistoryMetric label="Last load" value={formatKg(latest.totalLoad)} />
      <HistoryMetric label="Best load" value={formatKg(bestLoad)} />
      <HistoryMetric
        label="Est. 1RM"
        value={formatKg(latest.bestEstimatedOneRepMax)}
      />
    </div>
  );
}

function HistoryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium tabular-nums">{value}</span>
    </div>
  );
}
