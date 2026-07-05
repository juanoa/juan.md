import { useMemo } from "react";

import type { GymSession, Session } from "../../lib/gym/types";
import { getExerciseHistory, getSessionMetrics } from "../../lib/gym/stats";
import { CompletedExerciseCard } from "./completed-exercise-card";
import { formatVolume, formatWeight } from "./exercise-format";

interface CompletedSessionViewProps {
  session: GymSession;
  sessions: Session[];
}

export function CompletedSessionView({
  session,
  sessions,
}: CompletedSessionViewProps) {
  const cards = useMemo(() => {
    return session.exercises
      .map((planned) => {
        const performed = session.performed.find(
          (entry) => entry.plannedExerciseId === planned.id,
        );
        const sets = performed?.sets ?? [];
        if (sets.length === 0 && planned.notes.trim().length === 0) {
          return null;
        }
        const history = getExerciseHistory(
          sessions,
          planned.exerciseId,
          session.date,
        );
        return { planned, sets, history };
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);
  }, [session, sessions]);
  const metrics = useMemo(() => getSessionMetrics(session), [session]);

  if (cards.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No exercises recorded for this session.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="ring-foreground/10 grid grid-cols-2 gap-3 p-3 ring-1 lg:grid-cols-4">
        <Metric label="Total volume" value={formatVolume(metrics.totalLoad)} />
        <Metric label="Sets" value={String(metrics.completedSets)} />
        <Metric label="Reps" value={String(metrics.totalReps)} />
        <Metric
          label="Heaviest"
          value={
            metrics.heaviestSet
              ? `${metrics.heaviestSet.exerciseName} · ${formatWeight(metrics.heaviestSet.weight)}kg`
              : "None"
          }
        />
      </div>
      {cards.map(({ planned, sets, history }) => (
        <CompletedExerciseCard
          key={planned.id}
          name={planned.name}
          weightType={planned.weightType}
          sets={sets}
          notes={planned.notes}
          history={history}
          currentDate={session.date}
        />
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="truncate text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
