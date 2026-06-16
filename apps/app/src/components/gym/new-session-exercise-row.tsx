import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useMemo } from "react";

import { Button } from "@juan/ui/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@juan/ui/components/ui/table";

import { formatShortISODate } from "../../lib/gym/date";
import { totalLoad } from "../../lib/gym/stats";
import type {
  Exercise,
  GymSubcategory,
  PerformedSet,
  Session,
  SessionDraftExercise,
} from "../../lib/gym/types";

export interface DraftRow extends Omit<SessionDraftExercise, "targetWeight"> {
  rowId: string;
  targetWeight: string;
}

export interface ExerciseGroup {
  slug: GymSubcategory;
  name: string;
  items: Exercise[];
}

interface ExerciseHistorySummary {
  id: string;
  date: string;
  sets: PerformedSet[];
  totalLoad: number;
}

interface NewSessionExerciseRowProps {
  row: DraftRow;
  index: number;
  sessionDate: string;
  sessions: Session[];
  exerciseGroups: ExerciseGroup[];
  onUpdate: (patch: Partial<DraftRow>) => void;
  onRemove: () => void;
  onCreateExercise: () => void;
}

function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      *
    </span>
  );
}

function getExerciseHistorySummaries(
  sessions: Session[],
  exerciseId: string,
  sessionDate: string,
): ExerciseHistorySummary[] {
  if (exerciseId === "") return [];

  return sessions
    .flatMap((session) => {
      if (session.date >= sessionDate) return [];

      return session.exercises
        .filter((exercise) => exercise.exerciseId === exerciseId)
        .flatMap((exercise) => {
          const performed = session.performed.find(
            (entry) => entry.plannedExerciseId === exercise.id,
          );
          if (!performed || performed.sets.length === 0) return [];

          const sets = performed.sets.filter(
            (set) => set.reps > 0 || set.weight > 0,
          );
          if (sets.length === 0) return [];

          return [
            {
              id: `${session.id}-${exercise.id}`,
              date: session.date,
              sets,
              totalLoad: totalLoad(sets),
            },
          ];
        });
    })
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);
}

function formatWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatSetSummary(sets: PerformedSet[]): string {
  return sets
    .map((set) => `${set.reps} x ${formatWeight(set.weight)}kg`)
    .join(", ");
}

function ExerciseHistoryTable({
  history,
}: {
  history: ExerciseHistorySummary[];
}) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      <h4 className="text-muted-foreground text-xs font-medium">
        Last 5 performances
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="min-w-52">Summary</TableHead>
            <TableHead className="text-right">Load</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="tabular-nums">
                {formatShortISODate(entry.date)}
              </TableCell>
              <TableCell className="whitespace-normal">
                {formatSetSummary(entry.sets)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatWeight(entry.totalLoad)}kg
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function NewSessionExerciseRow({
  row,
  index,
  sessionDate,
  sessions,
  exerciseGroups,
  onUpdate,
  onRemove,
  onCreateExercise,
}: NewSessionExerciseRowProps) {
  const history = useMemo(
    () => getExerciseHistorySummaries(sessions, row.exerciseId, sessionDate),
    [sessions, row.exerciseId, sessionDate],
  );

  return (
    <li className="ring-foreground/10 bg-card flex flex-col gap-3 p-3 ring-1">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs tabular-nums">
          #{index + 1}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
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
            onValueChange={(value) => onUpdate({ exerciseId: value })}>
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
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))
              )}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={onCreateExercise}>
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
              onUpdate({
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
              onUpdate({
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
              onUpdate({
                targetWeight: event.target.value,
              })
            }
          />
        </div>
      </div>
      {history.length > 0 && <ExerciseHistoryTable history={history} />}
    </li>
  );
}
