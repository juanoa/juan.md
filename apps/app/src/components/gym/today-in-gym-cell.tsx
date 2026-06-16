import { PlusIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { todayISO } from "../../lib/gym/date";
import { DashboardCell } from "../dashboard";
import { useGymContext } from "./GymContext";
import { TodayCard } from "./today-card";

export function TodayInGymCell() {
  const { getSessionsByDate } = useGymContext();
  const todayIso = todayISO();
  const todaySessions = getSessionsByDate(todayIso);

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
      {todaySessions.length > 0 ? (
        <TodayCard />
      ) : (
        <Link
          to="/gym/new"
          search={{ date: todayIso }}
          className="border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-dashed px-8 py-16 text-sm transition-colors">
          <PlusIcon /> Plan today&apos;s session
        </Link>
      )}
    </DashboardCell>
  );
}
