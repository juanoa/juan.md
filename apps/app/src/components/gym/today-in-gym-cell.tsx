import { Link } from "@tanstack/react-router";

import { todayISO } from "../../lib/gym/date";
import { DashboardCell } from "../dashboard";
import { useGymContext } from "./GymContext";
import { TodayCard } from "./today-card";

export function TodayInGymCell() {
  const { getSessionByDate } = useGymContext();
  const today = getSessionByDate(todayISO());

  return (
    <DashboardCell
      title="Today in the gym"
      link={
        <Link
          to="/gym"
          className="text-muted-foreground hover:text-foreground text-xs">
          More
        </Link>
      }>
      {today ? (
        <TodayCard />
      ) : (
        <div className="border-border text-muted-foreground flex flex-1 items-center justify-center rounded-lg border-2 border-dashed px-8 py-16 text-sm">
          Nothing planned for today
        </div>
      )}
    </DashboardCell>
  );
}
