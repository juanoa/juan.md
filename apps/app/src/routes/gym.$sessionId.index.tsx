import {
  ArrowLeftIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@juan/ui/components/ui/alert-dialog";
import { Button, buttonVariants } from "@juan/ui/components/ui/button";

import { Dashboard } from "../components/dashboard";
import { CompletedSessionView } from "../components/gym/completed-session-view";
import { SessionSummary } from "../components/gym/session-summary";
import { useGymContext } from "../components/gym/GymContext";

export const Route = createFileRoute("/gym/$sessionId/")({
  component: GymSessionDetailRoute,
});

function GymSessionDetailRoute() {
  const { sessionId } = Route.useParams();
  const { deleteSession, getSession, moveSession, status, sessions, today } =
    useGymContext();
  const navigate = useNavigate();
  const session = getSession(sessionId);

  if (!session && status === "loading") {
    return (
      <Dashboard title="Gym">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </Dashboard>
    );
  }

  if (!session) {
    return (
      <Dashboard title="Gym">
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

  const handleDelete = () => {
    void deleteSession(session.id)
      .then(() => {
        navigate({ to: "/gym" });
      })
      .catch(() => {
        // Keep the user on the session if the delete request fails.
      });
  };

  if (session.status === "completed") {
    return (
      <Dashboard title={`Gym - ${session.subcategory}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Link
            to="/gym"
            className={buttonVariants({ variant: "ghost", size: "sm" })}>
            <ArrowLeftIcon /> Back
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <DeleteSessionDialog onDelete={handleDelete} />
            <Link
              to="/gym/$sessionId/run"
              params={{ sessionId: session.id }}
              className={buttonVariants({ variant: "outline", size: "sm" })}>
              <PencilSimpleIcon /> Edit sets
            </Link>
          </div>
        </div>
        <CompletedSessionView session={session} sessions={sessions} />
      </Dashboard>
    );
  }

  const isToday = session.date === today;

  const handleDoToday = () => {
    moveSession(session.id, today);
    navigate({ to: "/gym/$sessionId/run", params: { sessionId: session.id } });
  };

  return (
    <Dashboard title={`Gym - ${session.subcategory}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link
          to="/gym"
          className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeftIcon /> Back
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <DeleteSessionDialog onDelete={handleDelete} />
          <Link
            to="/gym/$sessionId/edit"
            params={{ sessionId: session.id }}
            className={buttonVariants({ variant: "outline", size: "sm" })}>
            <PencilSimpleIcon /> Edit plan
          </Link>
          {isToday ? (
            <Button
              size="sm"
              onClick={() =>
                navigate({
                  to: "/gym/$sessionId/run",
                  params: { sessionId: session.id },
                })
              }>
              <PlayIcon />
              {session.status === "in_progress" ? "Continue" : "Start session"}
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={handleDoToday}>
              Do it today
            </Button>
          )}
        </div>
      </div>
      <SessionSummary exercises={session.exercises} />
    </Dashboard>
  );
}

function DeleteSessionDialog({ onDelete }: { onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm">
            <TrashIcon /> Delete
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete session?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the session and all recorded sets.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
