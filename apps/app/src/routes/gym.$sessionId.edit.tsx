import { ArrowLeftIcon } from "@phosphor-icons/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@juan/ui/components/ui/button";

import { Dashboard } from "../components/dashboard";
import { useGymContext } from "../components/gym/GymContext";
import { NewSessionForm } from "../components/gym/new-session-form";

export const Route = createFileRoute("/gym/$sessionId/edit")({
  component: GymEditSessionRoute,
});

function GymEditSessionRoute() {
  const { sessionId } = Route.useParams();
  const { getSession, status } = useGymContext();
  const navigate = useNavigate();
  const session = getSession(sessionId);

  if (!session && status === "loading") {
    return (
      <Dashboard title="Gym - Edit session">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </Dashboard>
    );
  }

  if (!session) {
    return (
      <Dashboard title="Gym - Edit session">
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

  return (
    <Dashboard title="Gym - Edit session">
      <div className="flex items-start justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/gym/$sessionId" params={{ sessionId: session.id }}>
            <ArrowLeftIcon /> Back
          </Link>
        </Button>
      </div>
      <NewSessionForm
        initialSession={session}
        onSaved={(updatedSessionId) =>
          navigate({
            to: "/gym/$sessionId",
            params: { sessionId: updatedSessionId },
          })
        }
        onCancel={() =>
          navigate({ to: "/gym/$sessionId", params: { sessionId: session.id } })
        }
      />
    </Dashboard>
  );
}
