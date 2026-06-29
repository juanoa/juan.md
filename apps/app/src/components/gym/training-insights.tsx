import {
  ArrowRightIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { Badge } from "@juan/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";

import { getGymOverviewStats } from "../../lib/gym/stats";
import { todayISO } from "../../lib/gym/date";
import { formatKg, formatLoad, formatVolume } from "./exercise-format";
import { useGymContext } from "./GymContext";

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

export function TrainingInsights() {
  const { sessions } = useGymContext();
  const today = todayISO();
  const stats = useMemo(
    () => getGymOverviewStats(sessions, today),
    [sessions, today],
  );

  const weeklyChange =
    stats.previousWeekLoad > 0
      ? (stats.weekLoadDelta / stats.previousWeekLoad) * 100
      : stats.thisWeekLoad > 0
        ? 100
        : 0;

  const topFocus = stats.focusBreakdown[0];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium">Training insights</h2>
        {stats.completedSessions > 0 && (
          <span className="text-muted-foreground text-xs">
            {stats.completedSessions} completed
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <span>{formatVolume(stats.totalLoad)}</span>
            <span className="text-muted-foreground font-normal">
              total recorded volume
            </span>
            {stats.weekLoadDelta !== 0 && (
              <Badge
                variant={stats.weekLoadDelta > 0 ? "success" : "secondary"}>
                {stats.weekLoadDelta > 0 ? <TrendUpIcon /> : <TrendDownIcon />}
                {formatPercent(weeklyChange)} vs last week
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric
              label="This week"
              value={formatVolume(stats.thisWeekLoad)}
            />
            <Metric
              label="Average session"
              value={formatVolume(stats.averageLoad)}
            />
            <Metric
              label="Recorded sets"
              value={stats.completedSets.toLocaleString()}
            />
            <Metric
              label="Total reps"
              value={stats.totalReps.toLocaleString()}
            />
          </div>

          {stats.completedSessions === 0 ? (
            <p className="text-muted-foreground text-sm">
              Complete a session to start building performance history.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-medium">Session markers</h3>
                <div className="flex flex-col gap-2 text-sm">
                  {stats.lastCompleted && (
                    <InsightLink
                      toSession={stats.lastCompleted.id}
                      label="Last completed"
                      value={`${stats.lastCompleted.date} · ${stats.lastCompleted.subcategory} · ${formatVolume(stats.lastCompleted.load)}`}
                    />
                  )}
                  {stats.bestSession && (
                    <InsightLink
                      toSession={stats.bestSession.id}
                      label="Best volume"
                      value={`${stats.bestSession.date} · ${stats.bestSession.subcategory} · ${formatVolume(stats.bestSession.load)}`}
                    />
                  )}
                  {topFocus && (
                    <div className="flex items-center justify-between gap-3 p-2">
                      <span className="text-muted-foreground text-xs">
                        Main focus
                      </span>
                      <span className="text-right text-xs capitalize">
                        {topFocus.subcategory} · {formatVolume(topFocus.load)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-medium">Top exercises by volume</h3>
                {stats.topExercises.length > 0 ? (
                  <ol className="divide-y">
                    {stats.topExercises.map((exercise, index) => (
                      <li
                        key={exercise.exerciseId}
                        className="grid grid-cols-[auto_1fr_auto] items-center gap-6 px-2 py-3 text-sm">
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {index + 1}
                        </span>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate font-medium">
                            {exercise.name}
                          </span>
                          <span className="text-muted-foreground text-xs capitalize">
                            {exercise.weightType === "weighted"
                              ? `${exercise.sessions} sessions · max ${formatKg(exercise.maxWeight)} · est. 1RM ${formatKg(exercise.bestEstimatedOneRepMax)}`
                              : `${exercise.sessions} sessions · no weight`}
                          </span>
                        </div>
                        <span className="text-xs font-medium tabular-nums">
                          {formatLoad(exercise.load, exercise.weightType)}
                        </span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Record sets to rank exercises by training volume.
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
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

function InsightLink({
  toSession,
  label,
  value,
}: {
  toSession: string;
  label: string;
  value: string;
}) {
  return (
    <Link
      to="/gym/$sessionId"
      params={{ sessionId: toSession }}
      className="hover:bg-muted/60 flex items-center justify-between gap-3 p-2 transition-colors">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="flex items-center gap-4 text-right text-xs capitalize">
        {value}
        <ArrowRightIcon className="size-3" />
      </span>
    </Link>
  );
}
