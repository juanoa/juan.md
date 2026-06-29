import { useState } from "react";

import { Input } from "@juan/ui/components/ui/input";
import { Label } from "@juan/ui/components/ui/label";

import type { ExerciseWeightType, PerformedSet } from "../../lib/gym/types";
import { RepsSelector } from "./reps-selector";

interface SetRowProps {
  setIndex: number;
  performed: PerformedSet | undefined;
  weightType: ExerciseWeightType;
  targetWeight: number | null;
  onCommit: (set: PerformedSet) => void;
}

export function SetRow({
  setIndex,
  performed,
  weightType,
  targetWeight,
  onCommit,
}: SetRowProps) {
  const [reps, setReps] = useState<number | undefined>(performed?.reps);
  const [weight, setWeight] = useState<string>(
    performed?.weight !== undefined ? String(performed.weight) : "",
  );
  const usesWeight = weightType === "weighted";

  const tryCommit = (nextReps: number | undefined, nextWeight: string) => {
    if (nextReps === undefined) return;
    const parsedWeight = usesWeight
      ? nextWeight === ""
        ? 0
        : Number(nextWeight)
      : 0;
    if (!Number.isFinite(parsedWeight) || parsedWeight < 0) return;
    if (
      performed &&
      performed.reps === nextReps &&
      performed.weight === parsedWeight
    ) {
      return;
    }
    onCommit({ reps: nextReps, weight: parsedWeight });
  };

  const handleRepsChange = (nextReps: number) => {
    setReps(nextReps);
    tryCommit(nextReps, weight);
  };

  const handleWeightBlur = () => {
    tryCommit(reps, weight);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <span className="text-muted-foreground text-xs font-medium tabular-nums sm:w-12">
        Set {setIndex + 1}
      </span>
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
        <Label className="text-muted-foreground">Reps</Label>
        <RepsSelector value={reps} onChange={handleRepsChange} />
      </div>
      {usesWeight && (
        <div className="flex items-center gap-1.5">
          <Label
            htmlFor={`weight-${setIndex}`}
            className="text-muted-foreground">
            Kg
          </Label>
          <Input
            id={`weight-${setIndex}`}
            type="number"
            inputMode="decimal"
            min={0}
            step="0.5"
            value={weight}
            placeholder={
              targetWeight !== null ? String(targetWeight) : undefined
            }
            onChange={(event) => setWeight(event.target.value)}
            onBlur={handleWeightBlur}
            className="h-7 w-20"
          />
        </div>
      )}
    </div>
  );
}
