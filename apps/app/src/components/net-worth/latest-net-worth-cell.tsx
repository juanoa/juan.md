import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { Badge } from "@juan/ui/components/ui/badge";

import { DashboardCell } from "../dashboard";
import { formatMonth } from "../../lib/net-worth/date";
import { getNetWorthTimeline } from "../../lib/net-worth/stats";
import { useNetWorthContext } from "./NetWorthContext";
import {
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
} from "./net-worth-format";

export function LatestNetWorthCell() {
  const { snapshots, status } = useNetWorthContext();
  const timeline = useMemo(() => getNetWorthTimeline(snapshots), [snapshots]);
  const latest = timeline[timeline.length - 1];

  return (
    <DashboardCell
      title="Net worth"
      link={
        <Link
          to="/net-worth"
          className="text-muted-foreground hover:text-foreground text-xs">
          Open
        </Link>
      }>
      <div className="border-border bg-card flex flex-1 flex-col justify-between border p-4">
        {latest ? (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-xs">
                {formatMonth(latest.month)}
              </span>
              <span className="text-2xl font-medium tabular-nums">
                {formatCurrency(latest.total)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {latest.delta !== 0 && (
                <Badge variant={latest.delta > 0 ? "success" : "destructive"}>
                  {latest.delta > 0 ? <TrendUpIcon /> : <TrendDownIcon />}
                </Badge>
              )}
              <span className="text-muted-foreground tabular-nums">
                {formatSignedCurrency(latest.delta)} ·{" "}
                {formatPercent(latest.deltaPercent)}
              </span>
            </div>
          </>
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
