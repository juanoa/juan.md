import { ArrowCounterClockwiseIcon, PlusIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@juan/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";
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
import { cn } from "@juan/ui/lib/utils";

import { formatShortISODate } from "../../lib/gym/date";
import {
  GYM_SUBCATEGORIES,
  type Exercise,
  type GymSubcategory,
  type PerformedSet,
  type Session,
} from "../../lib/gym/types";
import { useGymContext } from "./GymContext";
import { ExerciseDialog } from "./exercise-dialog";
import {
  NewSessionExerciseRow,
  type DraftRow,
  type ExerciseGroup,
} from "./new-session-exercise-row";

interface NewSessionFormProps {
  initialDate?: string;
  initialSubcategory?: GymSubcategory;
  initialSession?: Session;
  onCreated?: (sessionId: string) => void;
  onSaved?: (sessionId: string) => void;
  onCancel: () => void;
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

function formatTargetWeight(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function getSubcategoryName(subcategory: GymSubcategory): string {
  return (
    GYM_SUBCATEGORIES.find((entry) => entry.slug === subcategory)?.name ??
    subcategory
  );
}

function getRecordedSets(sets: PerformedSet[]): PerformedSet[] {
  return sets.filter((set) => set.reps > 0 || set.weight > 0);
}

function getMostRepeatedNumber(values: number[]): number | undefined {
  const counts = new Map<number, number>();
  let mostRepeated:
    | { value: number; count: number; lastIndex: number }
    | undefined;

  values.forEach((value, index) => {
    const count = (counts.get(value) ?? 0) + 1;
    counts.set(value, count);

    if (
      mostRepeated === undefined ||
      count > mostRepeated.count ||
      (count === mostRepeated.count && index > mostRepeated.lastIndex)
    ) {
      mostRepeated = { value, count, lastIndex: index };
    }
  });

  return mostRepeated?.value;
}

function buildPlanningRows(session: Session): DraftRow[] {
  return session.exercises
    .filter((exercise) => exercise.exerciseId !== "")
    .map((exercise) => ({
      rowId: makeRowId(),
      exerciseId: exercise.exerciseId,
      weightType: exercise.weightType,
      targetSets: exercise.targetSets,
      targetReps: exercise.targetReps,
      targetWeight:
        exercise.weightType === "weighted"
          ? formatTargetWeight(exercise.targetWeight)
          : "",
    }));
}

function buildPerformedRows(session: Session): DraftRow[] {
  return session.exercises.flatMap((exercise) => {
    if (exercise.exerciseId === "") return [];

    const performed = session.performed.find(
      (entry) => entry.plannedExerciseId === exercise.id,
    );
    if (!performed) return [];

    const recordedSets = getRecordedSets(performed.sets);
    if (recordedSets.length === 0) return [];

    const targetReps =
      getMostRepeatedNumber(
        recordedSets.map((set) => set.reps).filter((reps) => reps > 0),
      ) ?? exercise.targetReps;
    const targetWeight = getMostRepeatedNumber(
      recordedSets.map((set) => set.weight),
    );

    return [
      {
        rowId: makeRowId(),
        exerciseId: exercise.exerciseId,
        weightType: exercise.weightType,
        targetSets: recordedSets.length,
        targetReps,
        targetWeight:
          exercise.weightType === "weighted"
            ? formatTargetWeight(targetWeight)
            : "",
      },
    ];
  });
}

function hasPlanningRows(session: Session): boolean {
  return session.exercises.some((exercise) => exercise.exerciseId !== "");
}

function hasPerformedRows(session: Session): boolean {
  return session.exercises.some((exercise) => {
    if (exercise.exerciseId === "") return false;
    const performed = session.performed.find(
      (entry) => entry.plannedExerciseId === exercise.id,
    );
    return (
      performed !== undefined && getRecordedSets(performed.sets).length > 0
    );
  });
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
  initialSession,
  onCreated,
  onSaved,
  onCancel,
}: NewSessionFormProps) {
  const {
    sessions,
    exercises,
    today,
    createExercise,
    createSession,
    updateSession,
  } = useGymContext();
  const isEditing = initialSession !== undefined;

  const [date, setDate] = useState<string>(
    initialSession?.date ?? initialDate ?? today,
  );
  const [subcategory, setSubcategory] = useState<GymSubcategory>(
    initialSession?.subcategory ?? initialSubcategory ?? "back",
  );
  const [rows, setRows] = useState<DraftRow[]>(
    () =>
      initialSession?.exercises.map((exercise) => ({
        rowId: exercise.id,
        exerciseId: exercise.exerciseId,
        weightType: exercise.weightType,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        targetWeight:
          exercise.weightType === "weighted" && exercise.targetWeight !== null
            ? String(exercise.targetWeight)
            : "",
      })) ?? [],
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exerciseDialogRowId, setExerciseDialogRowId] = useState<string | null>(
    null,
  );
  const [reuseDialogOpen, setReuseDialogOpen] = useState(false);
  const [selectedReuseSessionId, setSelectedReuseSessionId] = useState<
    string | null
  >(null);
  const previousTodayRef = useRef(today);

  useEffect(() => {
    const previousToday = previousTodayRef.current;
    if (previousToday === today) return;

    if (!isEditing && initialDate === undefined) {
      setDate((value) => (value === previousToday ? today : value));
    }
    previousTodayRef.current = today;
  }, [initialDate, isEditing, today]);

  const exerciseGroups = useMemo<ExerciseGroup[]>(() => {
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

  const exerciseById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  );

  const pastSessions = useMemo(
    () =>
      sessions
        .filter(
          (session) =>
            session.date < date &&
            (!initialSession || session.id !== initialSession.id),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [sessions, date, initialSession],
  );

  const selectedReuseSession = useMemo(
    () => pastSessions.find((session) => session.id === selectedReuseSessionId),
    [pastSessions, selectedReuseSessionId],
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
        weightType: "weighted",
        targetSets: 4,
        targetReps: 8,
        targetWeight: "",
      },
    ]);
  };

  const removeRow = (rowId: string) => {
    setRows((prev) => prev.filter((row) => row.rowId !== rowId));
  };

  const moveRow = (rowId: string, direction: -1 | 1) => {
    setRows((prev) => {
      const currentIndex = prev.findIndex((row) => row.rowId === rowId);
      if (currentIndex === -1) return prev;

      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;

      const next = [...prev];
      [next[currentIndex], next[nextIndex]] = [
        next[nextIndex],
        next[currentIndex],
      ];
      return next;
    });
  };

  const openReuseDialog = () => {
    setSelectedReuseSessionId(null);
    setReuseDialogOpen(true);
  };

  const closeReuseDialog = () => {
    setSelectedReuseSessionId(null);
    setReuseDialogOpen(false);
  };

  const applyReuseSession = (source: Session, rowsFromSource: DraftRow[]) => {
    if (rowsFromSource.length === 0) return;
    setSubcategory(source.subcategory);
    setRows(rowsFromSource);
    setError(null);
    closeReuseDialog();
  };

  const handleExerciseCreated = (rowId: string, exercise: Exercise) => {
    updateRow(rowId, {
      exerciseId: exercise.id,
      weightType: exercise.weightType,
      ...(exercise.weightType === "unweighted" ? { targetWeight: "" } : {}),
    });
    setExerciseDialogRowId(null);
  };

  const getRowWeightType = (row: DraftRow) =>
    exerciseById.get(row.exerciseId)?.weightType ?? row.weightType;

  const canSubmit =
    !submitting &&
    rows.length > 0 &&
    rows.every(
      (row) =>
        row.exerciseId !== "" &&
        row.targetSets > 0 &&
        row.targetReps > 0 &&
        (getRowWeightType(row) === "unweighted" ||
          isValidTargetWeight(row.targetWeight)),
    );

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    const draft = {
      date,
      subcategory,
      exercises: rows.map((row) => {
        const { exerciseId, targetSets, targetReps, targetWeight } = row;
        const weightType = getRowWeightType(row);
        return {
          exerciseId,
          targetSets,
          targetReps,
          targetWeight:
            weightType === "weighted"
              ? parseTargetWeight(targetWeight)
              : undefined,
        };
      }),
    };
    try {
      const session = isEditing
        ? await updateSession(initialSession.id, draft)
        : await createSession(draft);
      if (isEditing) {
        onSaved?.(session.id);
      } else {
        onCreated?.(session.id);
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : `Failed to ${isEditing ? "save" : "create"} session`,
      );
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
          <p className="text-muted-foreground text-xs">
            You can plan more than one session on the same day.
          </p>
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
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button type="button" size="sm" onClick={addRow}>
                <PlusIcon /> Add exercise
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={openReuseDialog}>
                <ArrowCounterClockwiseIcon /> Reuse session
              </Button>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((row, index) => (
              <NewSessionExerciseRow
                key={row.rowId}
                row={row}
                index={index}
                sessionDate={date}
                sessions={sessions}
                exerciseGroups={exerciseGroups}
                onUpdate={(patch) => updateRow(row.rowId, patch)}
                onMoveUp={() => moveRow(row.rowId, -1)}
                onMoveDown={() => moveRow(row.rowId, 1)}
                canMoveUp={index > 0}
                canMoveDown={index < rows.length - 1}
                onRemove={() => removeRow(row.rowId)}
                onCreateExercise={() => setExerciseDialogRowId(row.rowId)}
              />
            ))}
            <li>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addRow}>
                  <PlusIcon /> Add exercise
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={openReuseDialog}>
                  <ArrowCounterClockwiseIcon /> Reuse session
                </Button>
              </div>
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
          {submitting
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save session"
              : "Create session"}
        </Button>
      </div>

      <ExerciseDialog
        open={exerciseDialogRowId !== null}
        title="New exercise"
        submitLabel="Create"
        submittingLabel="Creating..."
        defaultSubcategory={subcategory}
        exercises={exercises}
        onOpenChange={(open) => {
          if (!open) setExerciseDialogRowId(null);
        }}
        onSubmit={async (input) => {
          const exercise = await createExercise(input);
          if (exerciseDialogRowId) {
            handleExerciseCreated(exerciseDialogRowId, exercise);
          }
        }}
      />
      <ReuseSessionDialog
        open={reuseDialogOpen}
        sessions={pastSessions}
        selectedSession={selectedReuseSession}
        selectedSessionId={selectedReuseSessionId}
        onOpenChange={(open) => {
          if (open) {
            setReuseDialogOpen(true);
            return;
          }
          closeReuseDialog();
        }}
        onSelectSession={setSelectedReuseSessionId}
        onCopyPlanning={(source) =>
          applyReuseSession(source, buildPlanningRows(source))
        }
        onCopySession={(source) =>
          applyReuseSession(source, buildPerformedRows(source))
        }
      />
    </div>
  );
}

interface ReuseSessionDialogProps {
  open: boolean;
  sessions: Session[];
  selectedSession: Session | undefined;
  selectedSessionId: string | null;
  onOpenChange: (open: boolean) => void;
  onSelectSession: (sessionId: string) => void;
  onCopyPlanning: (session: Session) => void;
  onCopySession: (session: Session) => void;
}

function summarizeExercises(session: Session): string {
  if (session.exercises.length === 0) return "No planned exercises";

  const names = session.exercises
    .slice(0, 3)
    .map((exercise) => exercise.name)
    .join(", ");
  const remaining = session.exercises.length - 3;
  return remaining > 0 ? `${names} +${remaining}` : names;
}

function ReuseSessionDialog({
  open,
  sessions,
  selectedSession,
  selectedSessionId,
  onOpenChange,
  onSelectSession,
  onCopyPlanning,
  onCopySession,
}: ReuseSessionDialogProps) {
  const canCopyPlanning =
    selectedSession !== undefined && hasPlanningRows(selectedSession);
  const canCopySession =
    selectedSession !== undefined && hasPerformedRows(selectedSession);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reuse past session</DialogTitle>
        </DialogHeader>

        {sessions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No previous sessions before this date.
          </p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto p-px">
            <div className="flex flex-col gap-2">
              {sessions.map((session) => {
                const selected = session.id === selectedSessionId;

                return (
                  <Card
                    key={session.id}
                    size="sm"
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    className={cn(
                      "hover:bg-muted/60 cursor-pointer transition-colors",
                      selected && "bg-muted",
                    )}
                    onClick={() => onSelectSession(session.id)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      onSelectSession(session.id);
                    }}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2">
                        <span>{formatShortISODate(session.date)}</span>
                        <span className="text-muted-foreground font-normal">
                          {getSubcategoryName(session.subcategory)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{summarizeExercises(session)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {selectedSession && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canCopyPlanning}
              onClick={() => onCopyPlanning(selectedSession)}>
              Copy plan
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!canCopySession}
              onClick={() => onCopySession(selectedSession)}>
              Copy session
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
