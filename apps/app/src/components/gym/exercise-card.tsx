import { PlusIcon } from "@phosphor-icons/react";
import { useState } from "react";

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
import { useGymContext } from "./GymContext";
import { SetRow } from "./set-row";

interface ExerciseCardProps {
  sessionId: string;
  exercise: PlannedExercise;
  performed: PerformedExercise | undefined;
}

export function ExerciseCard({
  sessionId,
  exercise,
  performed,
}: ExerciseCardProps) {
  const { recordSet } = useGymContext();
  const [extraSets, setExtraSets] = useState(0);

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
        <CardTitle className="text-sm">
          {exercise.targetSets}x{exercise.targetReps}{" "}
          <span className="text-muted-foreground font-normal">
            {exercise.name}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8 lg:gap-2">
          {Array.from({ length: totalSets }, (_, setIndex) => (
            <>
              <SetRow
                key={setIndex}
                setIndex={setIndex}
                performed={performed?.sets[setIndex]}
                onCommit={handleCommit(setIndex)}
              />
              <hr className="lg:hidden" />
            </>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="w-fit"
            onClick={() => setExtraSets((value) => value + 1)}
          >
            <PlusIcon /> Add set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
