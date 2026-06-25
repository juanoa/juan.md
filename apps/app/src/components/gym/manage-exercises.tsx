import {
  ArrowRightIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@juan/ui/components/ui/alert-dialog";
import { Badge } from "@juan/ui/components/ui/badge";
import { Button } from "@juan/ui/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@juan/ui/components/ui/table";

import { formatShortISODate } from "../../lib/gym/date";
import {
  getExerciseCatalogSummaries,
  type ExerciseCatalogSummary,
} from "../../lib/gym/stats";
import {
  GYM_SUBCATEGORIES,
  type Exercise,
  type GymSubcategory,
} from "../../lib/gym/types";
import { formatKg, getSubcategoryName } from "./exercise-format";
import { ExerciseDialog } from "./exercise-dialog";
import { useGymContext } from "./GymContext";

type FocusFilter = GymSubcategory | "all";

export function ManageExercises() {
  const {
    createExercise,
    deleteExercise,
    error,
    exercises,
    sessions,
    status,
    updateExercise,
  } = useGymContext();
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState<FocusFilter>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>(
    undefined,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<ExerciseCatalogSummary | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const summaries = useMemo(
    () => getExerciseCatalogSummaries(exercises, sessions),
    [exercises, sessions],
  );

  const filteredSummaries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return summaries.filter(({ exercise }) => {
      const matchesFocus = focus === "all" || exercise.subcategory === focus;
      const matchesQuery =
        normalizedQuery === "" ||
        exercise.name.toLocaleLowerCase().includes(normalizedQuery);
      return matchesFocus && matchesQuery;
    });
  }, [focus, query, summaries]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setActionError(null);
    setDeleteTarget(null);
    try {
      await deleteExercise(target.exercise.id);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Failed to remove exercise",
      );
    }
  };

  if (status === "loading") {
    return (
      <p className="text-muted-foreground text-sm">Loading exercises...</p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-destructive text-sm">
        {error ?? "Failed to load exercises"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Exercise catalog</h2>
          <p className="text-muted-foreground text-xs">
            {summaries.length} active{" "}
            {summaries.length === 1 ? "exercise" : "exercises"}
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon /> New exercise
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exercise-search">Search</Label>
          <Input
            id="exercise-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Bench press"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="exercise-focus">Focus</Label>
          <Select
            value={focus}
            onValueChange={(value) => setFocus(value as FocusFilter)}>
            <SelectTrigger id="exercise-focus" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All focus</SelectItem>
              {GYM_SUBCATEGORIES.map((option) => (
                <SelectItem key={option.slug} value={option.slug}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {actionError && <p className="text-destructive text-xs">{actionError}</p>}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-52">Exercise</TableHead>
              <TableHead>Focus</TableHead>
              <TableHead className="text-right">Used</TableHead>
              <TableHead>Last</TableHead>
              <TableHead className="text-right">Load</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSummaries.map((summary) => (
              <ExerciseRow
                key={summary.exercise.id}
                summary={summary}
                onEdit={() => setEditingExercise(summary.exercise)}
                onDelete={() => setDeleteTarget(summary)}
              />
            ))}
            {filteredSummaries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-24 text-center">
                  No exercises found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ExerciseDialog
        open={createOpen}
        title="New exercise"
        submitLabel="Create"
        submittingLabel="Creating..."
        defaultSubcategory="back"
        exercises={exercises}
        onOpenChange={setCreateOpen}
        onSubmit={async (input) => {
          await createExercise(input.name, input.subcategory);
        }}
      />

      <ExerciseDialog
        open={editingExercise !== undefined}
        title="Edit exercise"
        submitLabel="Save"
        submittingLabel="Saving..."
        defaultSubcategory={editingExercise?.subcategory ?? "back"}
        exercises={exercises}
        initialExercise={editingExercise}
        onOpenChange={(open) => {
          if (!open) setEditingExercise(undefined);
        }}
        onSubmit={async (input) => {
          if (!editingExercise) return;
          await updateExercise(editingExercise.id, input);
        }}
      />

      <ExerciseDeleteDialog
        summary={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ExerciseRow({
  summary,
  onEdit,
  onDelete,
}: {
  summary: ExerciseCatalogSummary;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { exercise } = summary;

  return (
    <TableRow>
      <TableCell>
        <Link
          to="/gym/exercises/$exerciseId"
          params={{ exerciseId: exercise.id }}
          className="hover:text-primary font-medium">
          {exercise.name}
        </Link>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {getSubcategoryName(exercise.subcategory)}
        </Badge>
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {summary.sessions}
      </TableCell>
      <TableCell className="text-muted-foreground tabular-nums">
        {summary.lastUsedDate ? formatShortISODate(summary.lastUsedDate) : "-"}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatKg(summary.totalLoad)}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <Button type="button" variant="ghost" size="icon-sm" asChild>
            <Link
              to="/gym/exercises/$exerciseId"
              params={{ exerciseId: exercise.id }}
              aria-label={`Open ${exercise.name}`}>
              <ArrowRightIcon />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${exercise.name}`}
            onClick={onEdit}>
            <PencilSimpleIcon />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${exercise.name}`}
            onClick={onDelete}>
            <TrashIcon />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ExerciseDeleteDialog({
  summary,
  onOpenChange,
  onConfirm,
}: {
  summary: ExerciseCatalogSummary | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const hasUsage = (summary?.sessions ?? 0) > 0;

  return (
    <AlertDialog open={summary !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasUsage ? "Archive exercise?" : "Delete exercise?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasUsage
              ? "This exercise appears in past sessions, so it will be hidden from future planning while keeping history intact."
              : "This exercise has no sessions yet and will be permanently deleted."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="sm"
            onClick={onConfirm}>
            {hasUsage ? "Archive" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
