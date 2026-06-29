import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { Badge } from "@juan/ui/components/ui/badge";
import { Button } from "@juan/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";
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
  getExerciseSessionSummaries,
  type ExerciseSessionSummary,
} from "../../lib/gym/stats";
import type { SessionStatus } from "../../lib/gym/types";
import {
  formatKg,
  formatLoad,
  formatPlanSummary,
  formatSetSummary,
  getVolumeLabel,
  getStatusLabel,
  getSubcategoryName,
} from "./exercise-format";
import { ExerciseLoadChart } from "./exercise-load-chart";
import { useGymContext } from "./GymContext";

interface ExerciseDetailProps {
  exerciseId: string;
}

export function ExerciseDetail({ exerciseId }: ExerciseDetailProps) {
  const { error, exercises, sessions, status } = useGymContext();
  const exercise = exercises.find((entry) => entry.id === exerciseId);

  const history = useMemo(
    () => getExerciseSessionSummaries(sessions, exerciseId),
    [exerciseId, sessions],
  );
  const summary = useMemo(
    () =>
      exercise
        ? getExerciseCatalogSummaries([exercise], sessions)[0]
        : undefined,
    [exercise, sessions],
  );
  const chartData = useMemo(
    () =>
      history
        .filter((entry) => entry.totalLoad > 0)
        .map((entry) => ({ date: entry.date, load: entry.totalLoad }))
        .reverse(),
    [history],
  );
  const currentDate = chartData[chartData.length - 1]?.date ?? "";

  if (status === "loading") {
    return <p className="text-muted-foreground text-sm">Loading exercise...</p>;
  }

  if (status === "error") {
    return (
      <p className="text-destructive text-sm">
        {error ?? "Failed to load exercise"}
      </p>
    );
  }

  if (!exercise || !summary) {
    return <ExerciseNotFound />;
  }
  const usesWeight = exercise.weightType === "weighted";
  const volumeLabel = getVolumeLabel(exercise.weightType);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="w-fit">
            <Link to="/gym/exercises">
              <ArrowLeftIcon /> Exercises
            </Link>
          </Button>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium">{exercise.name}</h2>
            <Badge variant="outline" className="w-fit">
              {getSubcategoryName(exercise.subcategory)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Metric label="Sessions" value={String(summary.sessions)} />
        <Metric label="Recorded" value={String(summary.performedSessions)} />
        <Metric
          label={`Total ${volumeLabel.toLowerCase()}`}
          value={formatLoad(summary.totalLoad, exercise.weightType)}
        />
        {usesWeight && (
          <>
            <Metric label="Max weight" value={formatKg(summary.maxWeight)} />
            <Metric
              label="Est. 1RM"
              value={formatKg(summary.bestEstimatedOneRepMax)}
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ExerciseLoadChart
              data={chartData}
              currentDate={currentDate}
              valueLabel={volumeLabel}
              formatValue={(value) => formatLoad(value, exercise.weightType)}
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              No recorded sets yet.
            </p>
          )}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Latest sessions</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-32">Plan</TableHead>
                <TableHead className="min-w-64">Results</TableHead>
                <TableHead className="text-right">{volumeLabel}</TableHead>
                <TableHead className="w-16 text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <ExerciseSessionRow
                  key={entry.id}
                  entry={entry}
                  volumeLabel={volumeLabel}
                />
              ))}
              {history.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground h-24 text-center">
                    No sessions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="ring-foreground/10 flex flex-col gap-1 p-2 ring-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

function ExerciseSessionRow({
  entry,
  volumeLabel,
}: {
  entry: ExerciseSessionSummary;
  volumeLabel: string;
}) {
  return (
    <TableRow>
      <TableCell className="tabular-nums">
        {formatShortISODate(entry.date)}
      </TableCell>
      <TableCell>
        <StatusBadge status={entry.status} />
      </TableCell>
      <TableCell>{formatPlanSummary(entry.planned)}</TableCell>
      <TableCell className="whitespace-normal">
        {formatSetSummary(entry.sets, entry.weightType)}
      </TableCell>
      <TableCell
        className="text-right tabular-nums"
        aria-label={`${volumeLabel}: ${formatLoad(entry.totalLoad, entry.weightType)}`}>
        {formatLoad(entry.totalLoad, entry.weightType)}
      </TableCell>
      <TableCell>
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="icon-sm" asChild>
            <Link
              to="/gym/$sessionId"
              params={{ sessionId: entry.sessionId }}
              aria-label={`Open ${formatShortISODate(entry.date)}`}>
              <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function StatusBadge({ status }: { status: SessionStatus }) {
  const variant =
    status === "completed"
      ? "success"
      : status === "in_progress"
        ? "secondary"
        : "outline";

  return <Badge variant={variant}>{getStatusLabel(status)}</Badge>;
}

function ExerciseNotFound() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-muted-foreground text-sm">Exercise not found.</p>
      <Button type="button" variant="outline" size="sm" asChild>
        <Link to="/gym/exercises">
          <ArrowLeftIcon /> Exercises
        </Link>
      </Button>
    </div>
  );
}
