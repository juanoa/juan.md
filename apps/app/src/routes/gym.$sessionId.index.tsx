import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@juan/ui/components/ui/button";

import { Dashboard } from "../components/dashboard";
import { SessionSummary } from "../components/gym/session-summary";
import { useGymContext } from "../components/gym/GymContext";
import { todayISO } from "../lib/gym/date";

export const Route = createFileRoute("/gym/$sessionId/")({
  component: GymSessionDetailRoute,
});

function GymSessionDetailRoute() {
  const { sessionId } = Route.useParams();
  const { getSession, moveSession } = useGymContext();
  const navigate = useNavigate();
  const session = getSession(sessionId);

  if (!session) {
    return (
      <Dashboard title="Gym">
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            We could not find that session.
          </p>
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link to="/gym">
              <ArrowLeftIcon /> Back to Gym
            </Link>
          </Button>
        </div>
      </Dashboard>
    );
  }

  const today = todayISO();
  const isToday = session.date === today;

  const handleDoToday = () => {
    moveSession(session.id, today);
    navigate({ to: "/gym/$sessionId/run", params: { sessionId: session.id } });
  };

  return (
    <Dashboard title={`Gym - ${session.subcategory}`}>
      <div className="flex items-start justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/gym">
            <ArrowLeftIcon /> Back
          </Link>
        </Button>
        {isToday ? (
          <Button
            size="sm"
            onClick={() =>
              navigate({
                to: "/gym/$sessionId/run",
                params: { sessionId: session.id },
              })
            }
          >
            Start session
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={handleDoToday}>
            Do it today
          </Button>
        )}
      </div>
      <SessionSummary exercises={session.exercises} />
    </Dashboard>
  );
}
