import { ArrowLeftIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { buttonVariants } from "@juan/ui/components/ui/button";

import { Dashboard } from "../components/dashboard";
import { useGymContext } from "../components/gym/GymContext";
import { NewSessionForm } from "../components/gym/new-session-form";

const PAGE_NAME = "Gym - Edit session";

export const Route = createFileRoute("/gym/$sessionId/edit")({
  component: GymEditSessionRoute,
  head: () => ({
    meta: [
      {
        title: PAGE_NAME,
      },
    ],
  }),
});

function GymEditSessionRoute() {
  const { sessionId } = Route.useParams();
  const { getSession, status } = useGymContext();
  const navigate = useNavigate();
  const session = getSession(sessionId);

  if (!session && status === "loading") {
    return (
      <Dashboard title={PAGE_NAME}>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </Dashboard>
    );
  }

  if (!session) {
    return (
      <Dashboard title={PAGE_NAME}>
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            We could not find that session.
          </p>
          <Link
            to="/gym"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "w-fit",
            })}>
            <ArrowLeftIcon /> Back to Gym
          </Link>
        </div>
      </Dashboard>
    );
  }

  if (session.status === "completed") {
    return (
      <Dashboard title="Gym - Plan locked">
        <div className="flex flex-col gap-4">
          <Link
            to="/gym/$sessionId"
            params={{ sessionId: session.id }}
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "w-fit",
            })}>
            <ArrowLeftIcon /> Back
          </Link>
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-sm">
              Completed sessions keep their plan locked. You can still edit the
              recorded sets.
            </p>
            <Link
              to="/gym/$sessionId/run"
              params={{ sessionId: session.id }}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "w-fit",
              })}>
              <PencilSimpleIcon /> Edit sets
            </Link>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard title="Gym - Edit session">
      <div className="flex items-start justify-between gap-3">
        <Link
          to="/gym/$sessionId"
          params={{ sessionId: session.id }}
          className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeftIcon /> Back
        </Link>
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
