import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "../components/dashboard";

export const Route = createFileRoute("/gym")({
  component: GymRoute,
});

function GymRoute() {
  return (
    <Dashboard title="Gym">
      <p className="text-muted-foreground text-sm">
        Workouts, splits, and personal records.
      </p>
    </Dashboard>
  );
}
