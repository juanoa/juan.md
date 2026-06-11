import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "../components/dashboard";
import { TodayCard } from "../components/gym/today-card";
import { WeekCalendar } from "../components/gym/week-calendar";

export const Route = createFileRoute("/gym/")({
  component: GymOverviewRoute,
});

function GymOverviewRoute() {
  return (
    <Dashboard title="Gym">
      <TodayCard />
      <WeekCalendar />
    </Dashboard>
  );
}
