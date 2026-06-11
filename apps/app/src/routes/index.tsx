import { createFileRoute } from "@tanstack/react-router";

import { Dashboard, DashboardGrid } from "../components/dashboard";
import { TodayInGymCell } from "../components/gym/today-in-gym-cell";

export const Route = createFileRoute("/")({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <Dashboard title="Dashboard">
      <DashboardGrid>
        <TodayInGymCell />
      </DashboardGrid>
    </Dashboard>
  );
}
