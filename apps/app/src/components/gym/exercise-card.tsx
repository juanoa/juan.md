import { PlusIcon } from "@phosphor-icons/react";
import { Fragment, useMemo, useState } from "react";

import { Button } from "@juan/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";
import { Label } from "@juan/ui/components/ui/label";
import { Textarea } from "@juan/ui/components/ui/textarea";

import type {
  PerformedExercise,
  PerformedSet,
  PlannedExercise,
} from "../../lib/gym/types";
import { getExercisePerformances } from "../../lib/gym/stats";
import {
  formatKg,
  formatLoad,
  formatWeight,
  getVolumeLabel,
} from "./exercise-format";
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
  const { recordExerciseNotes, recordSet, sessions } = useGymContext();
  const [extraSets, setExtraSets] = useState(0);
  const [notes, setNotes] = useState(exercise.notes);
  const usesWeight = exercise.weightType === "weighted";
  const notesId = `session-notes-${exercise.id}`;
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
  const suggestedWeight = usesWeight
    ? (latest?.sets.find((set) => set.reps >= exercise.targetReps)?.weight ??
      latest?.maxWeight ??
      exercise.targetWeight)
    : null;
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

  const handleNotesBlur = () => {
    if (notes === exercise.notes) return;
    recordExerciseNotes(sessionId, exercise.id, notes);
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
              target {formatWeight(suggestedWeight)}kg
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {latest && (
          <ExerciseHistoryStrip
            latest={latest}
            bestLoad={best?.totalLoad ?? latest.totalLoad}
            weightType={exercise.weightType}
          />
        )}
        <div className="flex flex-col gap-8 lg:gap-2">
          {Array.from({ length: totalSets }, (_, setIndex) => (
            <Fragment key={setIndex}>
              <SetRow
                setIndex={setIndex}
                performed={performed?.sets[setIndex]}
                weightType={exercise.weightType}
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={notesId} className="text-muted-foreground">
            Session notes
          </Label>
          <Textarea
            id={notesId}
            value={notes}
            placeholder="Add notes for this exercise"
            className="min-h-20 resize-y"
            onChange={(event) => setNotes(event.target.value)}
            onBlur={handleNotesBlur}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ExerciseHistoryStrip({
  latest,
  bestLoad,
  weightType,
}: {
  latest: NonNullable<
    ReturnType<typeof getExercisePerformances>[number] | undefined
  >;
  bestLoad: number;
  weightType: PlannedExercise["weightType"];
}) {
  const usesWeight = weightType === "weighted";
  const volumeLabel = getVolumeLabel(weightType).toLowerCase();

  return (
    <div className="ring-foreground/10 grid grid-cols-2 gap-2 p-2 text-xs ring-1 lg:grid-cols-4">
      <HistoryMetric label="Last" value={`${latest.date}`} />
      <HistoryMetric
        label={`Last ${volumeLabel}`}
        value={formatLoad(latest.totalLoad, weightType)}
      />
      <HistoryMetric
        label={`Best ${volumeLabel}`}
        value={formatLoad(bestLoad, weightType)}
      />
      {usesWeight ? (
        <HistoryMetric
          label="Est. 1RM"
          value={formatKg(latest.bestEstimatedOneRepMax)}
        />
      ) : (
        <HistoryMetric
          label="Sets"
          value={latest.sets.length.toLocaleString()}
        />
      )}
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
