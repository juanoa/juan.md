import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "../components/dashboard";

export const Route = createFileRoute("/")({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <Dashboard title="Dashboard">
      <p className="text-muted-foreground text-sm">
        Welcome back! Pick a section from the sidebar.
      </p>
    </Dashboard>
  );
}
