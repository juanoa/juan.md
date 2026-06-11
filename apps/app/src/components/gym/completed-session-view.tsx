import { useMemo } from "react";

import type { GymSession, Session } from "../../lib/gym/types";
import { getExerciseHistory } from "../../lib/gym/stats";
import { CompletedExerciseCard } from "./completed-exercise-card";

interface CompletedSessionViewProps {
  session: GymSession;
  sessions: Session[];
}

export function CompletedSessionView({
  session,
  sessions,
}: CompletedSessionViewProps) {
  const cards = useMemo(() => {
    return session.performed
      .map((entry) => {
        const planned = session.exercises.find((e) => e.id === entry.plannedExerciseId);
        if (!planned) return null;
        const history = getExerciseHistory(
          sessions,
          planned.exerciseId,
          session.date,
        );
        return { planned, sets: entry.sets, history };
      })
      .filter((card): card is NonNullable<typeof card> => card !== null);
  }, [session, sessions]);

  if (cards.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No exercises recorded for this session.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {cards.map(({ planned, sets, history }) => (
        <CompletedExerciseCard
          key={planned.id}
          name={planned.name}
          sets={sets}
          history={history}
          currentDate={session.date}
        />
      ))}
    </div>
  );
}
