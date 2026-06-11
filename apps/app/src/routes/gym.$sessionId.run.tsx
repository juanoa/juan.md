import { ArrowLeftIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@juan/ui/components/ui/button";

import { Dashboard } from "../components/dashboard";
import { ExerciseCard } from "../components/gym/exercise-card";
import { useGymContext } from "../components/gym/GymContext";

export const Route = createFileRoute("/gym/$sessionId/run")({
  component: GymSessionRunRoute,
});

function GymSessionRunRoute() {
  const { sessionId } = Route.useParams();
  const { getSession, finishSession } = useGymContext();
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

  const handleFinish = () => {
    finishSession(session.id);
    navigate({
      to: "/gym/$sessionId",
      params: { sessionId: session.id },
    });
  };

  return (
    <Dashboard title={`Gym - ${session.subcategory} · Run`}>
      <div className="flex items-start justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link
            to="/gym/$sessionId"
            params={{ sessionId: session.id }}
          >
            <ArrowLeftIcon /> Back
          </Link>
        </Button>
        <Button size="sm" onClick={handleFinish}>
          <CheckCircleIcon /> Finish session
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {session.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            sessionId={session.id}
            exercise={exercise}
            performed={session.performed.find(
              (entry) => entry.plannedExerciseId === exercise.id,
            )}
          />
        ))}
      </div>
    </Dashboard>
  );
}
