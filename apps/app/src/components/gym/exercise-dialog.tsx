import { useMemo, useState } from "react";

import { Button } from "@juan/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@juan/ui/components/ui/dialog";
import { Input } from "@juan/ui/components/ui/input";
import { Label } from "@juan/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@juan/ui/components/ui/select";

import {
  GYM_SUBCATEGORIES,
  type Exercise,
  type ExerciseInput,
  type GymSubcategory,
} from "../../lib/gym/types";

interface ExerciseDialogProps {
  open: boolean;
  title: string;
  submitLabel: string;
  submittingLabel: string;
  defaultSubcategory: GymSubcategory;
  exercises: Exercise[];
  initialExercise?: Exercise;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: ExerciseInput) => Promise<void>;
}

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      *
    </span>
  );
}

function normalizeExerciseName(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function ExerciseDialog({
  open,
  title,
  submitLabel,
  submittingLabel,
  defaultSubcategory,
  exercises,
  initialExercise,
  onOpenChange,
  onSubmit,
}: ExerciseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <ExerciseDialogForm
          key={initialExercise?.id ?? "new"}
          title={title}
          submitLabel={submitLabel}
          submittingLabel={submittingLabel}
          defaultSubcategory={defaultSubcategory}
          exercises={exercises}
          initialExercise={initialExercise}
          onOpenChange={onOpenChange}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

type ExerciseDialogFormProps = Omit<ExerciseDialogProps, "open">;

function ExerciseDialogForm({
  title,
  submitLabel,
  submittingLabel,
  defaultSubcategory,
  exercises,
  initialExercise,
  onOpenChange,
  onSubmit,
}: ExerciseDialogFormProps) {
  const [name, setName] = useState(initialExercise?.name ?? "");
  const [subcategory, setSubcategory] = useState<GymSubcategory>(
    initialExercise?.subcategory ?? defaultSubcategory,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const duplicateExercise = useMemo(() => {
    if (trimmedName === "") return false;
    const normalized = normalizeExerciseName(trimmedName);
    return exercises.some(
      (exercise) =>
        exercise.id !== initialExercise?.id &&
        exercise.subcategory === subcategory &&
        normalizeExerciseName(exercise.name) === normalized,
    );
  }, [exercises, initialExercise?.id, subcategory, trimmedName]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSubmitting(false);
      setError(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (trimmedName === "" || duplicateExercise) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: trimmedName, subcategory });
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save exercise");
      setSubmitting(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exercise-name">
            Name <RequiredMark />
          </Label>
          <Input
            id="exercise-name"
            value={name}
            autoFocus
            onChange={(event) => {
              setName(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSubmit();
              }
            }}
            placeholder="Bench press"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exercise-subcategory">
            Focus <RequiredMark />
          </Label>
          <Select
            value={subcategory}
            onValueChange={(value) => {
              setSubcategory(value as GymSubcategory);
              setError(null);
            }}>
            <SelectTrigger id="exercise-subcategory" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GYM_SUBCATEGORIES.map((option) => (
                <SelectItem key={option.slug} value={option.slug}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {duplicateExercise && (
          <p className="text-destructive text-xs">
            An exercise with this name already exists in this focus.
          </p>
        )}
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={submitting || trimmedName === "" || duplicateExercise}
          onClick={handleSubmit}>
          {submitting ? submittingLabel : submitLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
