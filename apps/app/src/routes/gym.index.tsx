import { createFileRoute } from "@tanstack/react-router";

import { Dashboard } from "../components/dashboard";
import { TodayCard } from "../components/gym/today-card";
import { TrainingInsights } from "../components/gym/training-insights";
import { WeekCalendar } from "../components/gym/week-calendar";
import { GymSettings } from "../components/gym/gym-settings";

const PAGE_NAME = "Gym";

export const Route = createFileRoute("/gym/")({
  component: GymOverviewRoute,
  head: () => ({
    meta: [
      {
        title: PAGE_NAME,
      },
    ],
  }),
});

function GymOverviewRoute() {
  return (
    <Dashboard title={PAGE_NAME}>
      <TodayCard />
      <TrainingInsights />
      <WeekCalendar />
      <GymSettings />
    </Dashboard>
  );
}
