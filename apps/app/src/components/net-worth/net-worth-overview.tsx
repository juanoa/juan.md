import { TrendDownIcon, TrendUpIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { Badge } from "@juan/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@juan/ui/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@juan/ui/components/ui/select";

import { formatMonth } from "../../lib/net-worth/date";
import {
  getAssetHistory,
  getBreakdownByCategory,
  getBreakdownByLiquidity,
  getCategoryTrend,
  getLatestAssetSummaries,
  getLatestSnapshot,
  getLiquidValue,
  getNetWorthTimeline,
  getSnapshotTotal,
  getTrailingTwelveMonthChange,
} from "../../lib/net-worth/stats";
import { NET_WORTH_ASSET_CATEGORIES } from "../../lib/net-worth/types";
import { NetWorthAssetManagement } from "./asset-management";
import { MonthlyUpdatePanel } from "./monthly-update-panel";
import { useNetWorthContext } from "./NetWorthContext";
import {
  CHART_COLORS,
  NetWorthAssetBarChart,
  NetWorthAssetHistoryChart,
  NetWorthBreakdownChart,
  NetWorthCategoryTrendChart,
  NetWorthDeltaChart,
  NetWorthMoverChart,
  NetWorthTimelineChart,
} from "./net-worth-charts";
import {
  CATEGORY_NAMES,
  LIQUIDITY_NAMES,
  formatCurrency,
  formatPercent,
  formatSignedCurrency,
} from "./net-worth-format";

export function NetWorthOverview() {
  const { assets, snapshots, status, error } = useNetWorthContext();
  const [selectedAssetId, setSelectedAssetId] = useState("");

  const timeline = useMemo(() => getNetWorthTimeline(snapshots), [snapshots]);
  const latestSnapshot = useMemo(
    () => getLatestSnapshot(snapshots),
    [snapshots],
  );
  const latestPoint = timeline[timeline.length - 1];
  const assetSummaries = useMemo(
    () => getLatestAssetSummaries(assets, snapshots),
    [assets, snapshots],
  );
  const categoryBreakdown = useMemo(
    () => getBreakdownByCategory(assets, latestSnapshot, CATEGORY_NAMES),
    [assets, latestSnapshot],
  );
  const liquidityBreakdown = useMemo(
    () => getBreakdownByLiquidity(assets, latestSnapshot, LIQUIDITY_NAMES),
    [assets, latestSnapshot],
  );
  const categoryTrend = useMemo(
    () => getCategoryTrend(assets, snapshots, CATEGORY_NAMES),
    [assets, snapshots],
  );
  const activeCategories = useMemo(
    () =>
      NET_WORTH_ASSET_CATEGORIES.map((category) => category.value).filter(
        (category) =>
          categoryTrend.some((point) => Number(point[category] ?? 0) > 0),
      ),
    [categoryTrend],
  );

  const total = latestSnapshot ? getSnapshotTotal(latestSnapshot) : 0;
  const trailingYearChange = getTrailingTwelveMonthChange(timeline);
  const liquidValue = getLiquidValue(assets, latestSnapshot);
  const effectiveSelectedAssetId =
    selectedAssetId || assetSummaries[0]?.asset.id || "";
  const selectedAsset = assets.find(
    (asset) => asset.id === effectiveSelectedAssetId,
  );
  const selectedAssetHistory = effectiveSelectedAssetId
    ? getAssetHistory(snapshots, effectiveSelectedAssetId)
    : [];
  const topAssets = assetSummaries
    .slice(0, 8)
    .map((summary) => ({ name: summary.asset.name, value: summary.value }));
  const topMovers = [...assetSummaries]
    .filter((summary) => summary.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 8)
    .map((summary) => ({ name: summary.asset.name, value: summary.delta }));

  if (status === "loading") {
    return (
      <p className="text-muted-foreground text-sm">Loading net worth data...</p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-destructive text-sm">
        {error ?? "Failed to load net worth data"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          label="Latest net worth"
          value={formatCurrency(total)}
          detail={latestSnapshot ? formatMonth(latestSnapshot.month) : "-"}
        />
        <Metric
          label="Monthly change"
          value={formatSignedCurrency(latestPoint?.delta ?? 0)}
          detail={formatPercent(latestPoint?.deltaPercent ?? 0)}
          trend={latestPoint?.delta ?? 0}
        />
        <Metric
          label="Last 12 months change"
          value={formatSignedCurrency(trailingYearChange.delta)}
          detail={formatPercent(trailingYearChange.deltaPercent)}
          trend={trailingYearChange.delta}
        />
        <Metric
          label="Instant liquidity"
          value={formatCurrency(liquidValue)}
          detail={`${total > 0 ? ((liquidValue / total) * 100).toFixed(1) : "0.0"}% of latest`}
        />
      </div>

      <div className="flex justify-end">
        <MonthlyUpdatePanel />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Net worth progression">
          {timeline.length > 0 ? (
            <NetWorthTimelineChart data={timeline} />
          ) : (
            <EmptyChartMessage />
          )}
        </ChartCard>

        <ChartCard title="Monthly change">
          {timeline.length > 1 ? (
            <NetWorthDeltaChart data={timeline} />
          ) : (
            <EmptyChartMessage />
          )}
        </ChartCard>

        <ChartCard title="Category allocation">
          {categoryBreakdown.length > 0 ? (
            <NetWorthBreakdownChart data={categoryBreakdown} />
          ) : (
            <EmptyChartMessage />
          )}
          <BreakdownLegend data={categoryBreakdown} />
        </ChartCard>

        <ChartCard title="Liquidity allocation">
          {liquidityBreakdown.length > 0 ? (
            <NetWorthBreakdownChart data={liquidityBreakdown} />
          ) : (
            <EmptyChartMessage />
          )}
          <BreakdownLegend data={liquidityBreakdown} />
        </ChartCard>

        <ChartCard title="Category trend">
          {categoryTrend.length > 0 && activeCategories.length > 0 ? (
            <NetWorthCategoryTrendChart
              data={categoryTrend}
              categories={activeCategories}
            />
          ) : (
            <EmptyChartMessage />
          )}
        </ChartCard>

        <ChartCard title="Top assets">
          {topAssets.length > 0 ? (
            <NetWorthAssetBarChart data={topAssets} />
          ) : (
            <EmptyChartMessage />
          )}
        </ChartCard>

        <ChartCard title="Top movers">
          {topMovers.length > 0 ? (
            <NetWorthMoverChart data={topMovers} />
          ) : (
            <EmptyChartMessage />
          )}
        </ChartCard>

        <ChartCard
          title="Asset history"
          action={
            <Select
              value={effectiveSelectedAssetId}
              onValueChange={setSelectedAssetId}>
              <SelectTrigger className="h-7 w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assetSummaries.map((summary) => (
                  <SelectItem key={summary.asset.id} value={summary.asset.id}>
                    {summary.asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }>
          {selectedAsset ? (
            <NetWorthAssetHistoryChart data={selectedAssetHistory} />
          ) : (
            <EmptyChartMessage />
          )}
        </ChartCard>
      </div>

      <NetWorthAssetManagement />
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  trend,
}: {
  label: string;
  value: string;
  detail: string;
  trend?: number;
}) {
  return (
    <div className="ring-foreground/10 flex flex-col gap-2 p-3 ring-1">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-lg font-medium tabular-nums">{value}</span>
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        {trend !== undefined && trend !== 0 && (
          <Badge variant={trend > 0 ? "success" : "destructive"}>
            {trend > 0 ? <TrendUpIcon /> : <TrendDownIcon />}
          </Badge>
        )}
        <span>{detail}</span>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-3">
          <span>{title}</span>
          {action}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">{children}</CardContent>
    </Card>
  );
}

function EmptyChartMessage() {
  return (
    <div className="text-muted-foreground flex h-48 items-center justify-center text-sm">
      No monthly values yet.
    </div>
  );
}

function BreakdownLegend({
  data,
}: {
  data: { key: string; name: string; value: number }[];
}) {
  if (data.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-2 sm:gap-x-8">
      {data.map((entry, index) => (
        <div key={entry.key} className="flex justify-between gap-3 text-xs">
          <span className="text-muted-foreground flex items-center gap-2">
            <span
              aria-hidden="true"
              className="border-border h-2.5 w-2.5 shrink-0 border"
              style={{
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
            <span>{entry.name}</span>
          </span>
          <span className="font-medium tabular-nums">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
