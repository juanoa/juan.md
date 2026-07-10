import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { DashboardCell } from "../dashboard";
import { getNetWorthTimeline } from "../../lib/net-worth/stats";
import { useNetWorthContext } from "./NetWorthContext";
import { NetWorthTimelineChart } from "./net-worth-charts";

export function NetWorthProgressCell() {
  const { snapshots, status } = useNetWorthContext();
  const timeline = useMemo(() => getNetWorthTimeline(snapshots), [snapshots]);

  return (
    <DashboardCell
      title="Net worth progression"
      link={
        <Link
          to="/net-worth"
          className="text-muted-foreground hover:text-foreground text-xs">
          Open
        </Link>
      }>
      <div className="border-border bg-card flex flex-1 flex-col border p-3">
        {timeline.length > 0 ? (
          <NetWorthTimelineChart data={timeline} compact />
        ) : (
          <Link
            to="/net-worth"
            className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-center px-8 py-16 text-sm transition-colors">
            {status === "loading" ? "Loading net worth" : "No values yet"}
          </Link>
        )}
      </div>
    </DashboardCell>
  );
}
