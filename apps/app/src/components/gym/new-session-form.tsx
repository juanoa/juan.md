import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@juan/ui/components/ui/select";

import { todayISO } from "../../lib/gym/date";
import {
  GYM_SUBCATEGORIES,
  type Exercise,
  type GymSubcategory,
  type SessionDraftExercise,
} from "../../lib/gym/types";
import { useGymContext } from "./GymContext";

interface NewSessionFormProps {
  initialDate?: string;
  initialSubcategory?: GymSubcategory;
  onCreated: (sessionId: string) => void;
  onCancel: () => void;
}

interface DraftRow extends Omit<SessionDraftExercise, "targetWeight"> {
  rowId: string;
  targetWeight: string;
}

function makeRowId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function isValidTargetWeight(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0;
}

function parseTargetWeight(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  return Number(trimmed);
}

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      *
    </span>
  );
}

export function NewSessionForm({
  initialDate,
  initialSubcategory,
  onCreated,
  onCancel,
}: NewSessionFormProps) {
  const { sessions, exercises, createExercise, createSession } =
    useGymContext();

  const [date, setDate] = useState<string>(initialDate ?? todayISO());
  const [subcategory, setSubcategory] = useState<GymSubcategory>(
    initialSubcategory ?? "back",
  );
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exerciseDialogRowId, setExerciseDialogRowId] = useState<string | null>(
    null,
  );

  const exerciseGroups = useMemo(() => {
    const bySubcategory = new Map<GymSubcategory, Exercise[]>();
    for (const exercise of exercises) {
      const list = bySubcategory.get(exercise.subcategory) ?? [];
      list.push(exercise);
      bySubcategory.set(exercise.subcategory, list);
    }
    const ordered = [
      ...GYM_SUBCATEGORIES.filter((entry) => entry.slug === subcategory),
      ...GYM_SUBCATEGORIES.filter((entry) => entry.slug !== subcategory),
    ];
    return ordered
      .map((entry) => ({
        slug: entry.slug,
        name: entry.name,
        items: bySubcategory.get(entry.slug) ?? [],
      }))
      .filter((group) => group.items.length > 0);
  }, [exercises, subcategory]);

  const dateConflict = useMemo(
    () => sessions.some((session) => session.date === date),
    [sessions, date],
  );

  const updateRow = (rowId: string, patch: Partial<DraftRow>) => {
    setRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        rowId: makeRowId(),
        exerciseId: "",
        targetSets: 4,
        targetReps: 8,
        targetWeight: "",
      },
    ]);
  };

  const removeRow = (rowId: string) => {
    setRows((prev) => prev.filter((row) => row.rowId !== rowId));
  };

  const handleExerciseCreated = (rowId: string, exercise: Exercise) => {
    updateRow(rowId, { exerciseId: exercise.id });
    setExerciseDialogRowId(null);
  };

  const canSubmit =
    !submitting &&
    !dateConflict &&
    rows.length > 0 &&
    rows.every(
      (row) =>
        row.exerciseId !== "" &&
        row.targetSets > 0 &&
        row.targetReps > 0 &&
        isValidTargetWeight(row.targetWeight),
    );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const session = await createSession({
        date,
        subcategory,
        exercises: rows.map(
          ({ exerciseId, targetSets, targetReps, targetWeight }) => ({
            exerciseId,
            targetSets,
            targetReps,
            targetWeight: parseTargetWeight(targetWeight),
          }),
        ),
      });
      onCreated(session.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create session");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="session-date">
            Date <RequiredMark />
          </Label>
          <Input
            id="session-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          {dateConflict && (
            <p className="text-destructive text-xs">
              There is already a session on this date.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="session-subcategory">
            Focus <RequiredMark />
          </Label>
          <Select
            value={subcategory}
            onValueChange={(value) => setSubcategory(value as GymSubcategory)}>
            <SelectTrigger id="session-subcategory" className="w-full">
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
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Exercises</h3>

        {rows.length === 0 ? (
          <div className="border-border text-muted-foreground flex flex-col items-center justify-center gap-5 rounded-none border-2 border-dashed px-4 py-8 text-xs">
            <span>Add at least one exercise to plan this session.</span>
            <Button type="button" size="sm" onClick={addRow}>
              <PlusIcon /> Add exercise
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((row, index) => (
              <li
                key={row.rowId}
                className="ring-foreground/10 bg-card flex flex-col gap-3 p-3 ring-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs tabular-nums">
                    #{index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeRow(row.rowId)}
                    aria-label="Remove exercise">
                    <TrashIcon />
                  </Button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>
                    Exercise <RequiredMark />
                  </Label>
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                    <Select
                      value={row.exerciseId}
                      onValueChange={(value) =>
                        updateRow(row.rowId, { exerciseId: value })
                      }>
                      <SelectTrigger className="w-full sm:flex-1">
                        <SelectValue placeholder="Pick an exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseGroups.length === 0 ? (
                          <div className="text-muted-foreground px-2 py-2 text-xs">
                            No exercises yet.
                          </div>
                        ) : (
                          exerciseGroups.map((group) => (
                            <SelectGroup key={group.slug}>
                              <SelectLabel>{group.name}</SelectLabel>
                              {group.items.map((exercise) => (
                                <SelectItem
                                  key={exercise.id}
                                  value={exercise.id}>
                                  {exercise.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setExerciseDialogRowId(row.rowId)}>
                      <PlusIcon /> New
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`sets-${row.rowId}`}>
                      Sets <RequiredMark />
                    </Label>
                    <Input
                      id={`sets-${row.rowId}`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={row.targetSets}
                      onChange={(event) =>
                        updateRow(row.rowId, {
                          targetSets: Math.max(1, Number(event.target.value)),
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`reps-${row.rowId}`}>
                      Reps <RequiredMark />
                    </Label>
                    <Input
                      id={`reps-${row.rowId}`}
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={row.targetReps}
                      onChange={(event) =>
                        updateRow(row.rowId, {
                          targetReps: Math.max(1, Number(event.target.value)),
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={`weight-${row.rowId}`}>Kg</Label>
                    <Input
                      id={`weight-${row.rowId}`}
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.5"
                      value={row.targetWeight}
                      onChange={(event) =>
                        updateRow(row.rowId, {
                          targetWeight: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </li>
            ))}
            <li>
              <Button type="button" variant="ghost" size="sm" onClick={addRow}>
                <PlusIcon /> Add exercise
              </Button>
            </li>
          </ul>
        )}
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!canSubmit}
          onClick={handleSubmit}>
          {submitting ? "Creating..." : "Create session"}
        </Button>
      </div>

      <NewExerciseDialog
        open={exerciseDialogRowId !== null}
        defaultSubcategory={subcategory}
        onOpenChange={(open) => {
          if (!open) setExerciseDialogRowId(null);
        }}
        onCreate={async (name, exerciseSubcategory) => {
          const exercise = await createExercise(name, exerciseSubcategory);
          if (exerciseDialogRowId) {
            handleExerciseCreated(exerciseDialogRowId, exercise);
          }
        }}
      />
    </div>
  );
}

interface NewExerciseDialogProps {
  open: boolean;
  defaultSubcategory: GymSubcategory;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, subcategory: GymSubcategory) => Promise<void>;
}

function NewExerciseDialog({
  open,
  defaultSubcategory,
  onOpenChange,
  onCreate,
}: NewExerciseDialogProps) {
  const [name, setName] = useState("");
  const [subcategory, setSubcategory] =
    useState<GymSubcategory>(defaultSubcategory);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setSubcategory(defaultSubcategory);
    setSubmitting(false);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError(null);
    try {
      await onCreate(trimmed, subcategory);
      reset();
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create exercise");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New exercise</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-exercise-name">
              Name <RequiredMark />
            </Label>
            <Input
              id="new-exercise-name"
              value={name}
              autoFocus
              onChange={(event) => setName(event.target.value)}
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
            <Label htmlFor="new-exercise-subcategory">
              Focus <RequiredMark />
            </Label>
            <Select
              value={subcategory}
              onValueChange={(value) =>
                setSubcategory(value as GymSubcategory)
              }>
              <SelectTrigger id="new-exercise-subcategory" className="w-full">
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
            disabled={submitting || name.trim() === ""}
            onClick={handleSubmit}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
