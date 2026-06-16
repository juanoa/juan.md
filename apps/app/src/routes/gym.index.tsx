import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "../components/dashboard";
import { TodayCard } from "../components/gym/today-card";
import { TrainingInsights } from "../components/gym/training-insights";
import { WeekCalendar } from "../components/gym/week-calendar";
import { GymSettings } from "../components/gym/gym-settings";

export const Route = createFileRoute("/gym/")({
  component: GymOverviewRoute,
});

function GymOverviewRoute() {
  return (
    <Dashboard title="Gym">
      <TodayCard />
      <TrainingInsights />
      <WeekCalendar />
      <GymSettings />
    </Dashboard>
  );
}
