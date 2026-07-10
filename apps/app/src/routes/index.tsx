import { createFileRoute } from "@tanstack/react-router";

import { Dashboard, DashboardGrid } from "../components/dashboard";
import { TodayInGymCell } from "../components/gym/today-in-gym-cell";
import { LatestNetWorthCell } from "../components/net-worth/latest-net-worth-cell";
import { NetWorthProgressCell } from "../components/net-worth/net-worth-progress-cell";
import { TodayTodosCell } from "../components/todos/today-todos-cell";

export const Route = createFileRoute("/")({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <Dashboard title="Dashboard">
      <DashboardGrid>
        <TodayTodosCell />
        <TodayInGymCell />
        <LatestNetWorthCell />
        <NetWorthProgressCell />
      </DashboardGrid>
    </Dashboard>
  );
}
