import type {
  NetWorthAsset,
  NetWorthAssetCategory,
  NetWorthAssetLiquidity,
  NetWorthSnapshot,
} from "./types";

export interface NetWorthTimelinePoint {
  month: string;
  total: number;
  delta: number;
  deltaPercent: number;
}

export interface NetWorthTrailingChange {
  baseline: NetWorthTimelinePoint | undefined;
  delta: number;
  deltaPercent: number;
}

export interface NetWorthAssetSummary {
  asset: NetWorthAsset;
  value: number;
  previousValue: number;
  delta: number;
  deltaPercent: number;
}

export interface NetWorthBreakdownPoint {
  key: string;
  name: string;
  value: number;
}

export interface NetWorthCategoryTrendPoint {
  month: string;
  [category: string]: string | number;
}

export interface NetWorthAssetHistoryPoint {
  month: string;
  value: number;
}

export function sortSnapshots(
  snapshots: NetWorthSnapshot[],
): NetWorthSnapshot[] {
  return [...snapshots].sort((a, b) => a.month.localeCompare(b.month));
}

export function getLatestSnapshot(
  snapshots: NetWorthSnapshot[],
): NetWorthSnapshot | undefined {
  const sorted = sortSnapshots(snapshots);
  return sorted[sorted.length - 1];
}

export function getPreviousSnapshot(
  snapshots: NetWorthSnapshot[],
  snapshot: NetWorthSnapshot | undefined,
): NetWorthSnapshot | undefined {
  if (!snapshot) return undefined;
  const sorted = sortSnapshots(snapshots);
  const index = sorted.findIndex((entry) => entry.id === snapshot.id);
  if (index <= 0) return undefined;
  return sorted[index - 1];
}

export function getSnapshotValue(
  snapshot: NetWorthSnapshot | undefined,
  assetId: string,
): number {
  if (!snapshot) return 0;
  return snapshot.values.find((entry) => entry.assetId === assetId)?.value ?? 0;
}

export function getSnapshotTotal(snapshot: NetWorthSnapshot | undefined) {
  if (!snapshot) return 0;
  return snapshot.values.reduce((total, entry) => total + entry.value, 0);
}

export function getNetWorthTimeline(
  snapshots: NetWorthSnapshot[],
): NetWorthTimelinePoint[] {
  return sortSnapshots(snapshots).map((snapshot, index, sorted) => {
    const total = getSnapshotTotal(snapshot);
    const previousTotal =
      index > 0 ? getSnapshotTotal(sorted[index - 1]) : total;
    const delta = index > 0 ? total - previousTotal : 0;
    const deltaPercent =
      index > 0 && previousTotal > 0 ? (delta / previousTotal) * 100 : 0;
    return {
      month: snapshot.month,
      total,
      delta,
      deltaPercent,
    };
  });
}

export function getTrailingTwelveMonthChange(
  timeline: NetWorthTimelinePoint[],
): NetWorthTrailingChange {
  const latestPoint = timeline[timeline.length - 1];
  if (!latestPoint) {
    return { baseline: undefined, delta: 0, deltaPercent: 0 };
  }

  const targetMonth = getMonthOrdinal(latestPoint.month) - 12;
  const baseline = timeline
    .slice(0, -1)
    .reduce<NetWorthTimelinePoint | undefined>((closest, point) => {
      if (!closest) return point;

      const pointMonth = getMonthOrdinal(point.month);
      const closestMonth = getMonthOrdinal(closest.month);
      const pointDistance = Math.abs(pointMonth - targetMonth);
      const closestDistance = Math.abs(closestMonth - targetMonth);

      if (pointDistance < closestDistance) return point;
      if (pointDistance > closestDistance) return closest;

      return pointMonth > closestMonth ? point : closest;
    }, undefined);

  if (!baseline) {
    return { baseline: undefined, delta: 0, deltaPercent: 0 };
  }

  const delta = latestPoint.total - baseline.total;
  const deltaPercent = baseline.total > 0 ? (delta / baseline.total) * 100 : 0;

  return { baseline, delta, deltaPercent };
}

export function getLatestAssetSummaries(
  assets: NetWorthAsset[],
  snapshots: NetWorthSnapshot[],
): NetWorthAssetSummary[] {
  const latest = getLatestSnapshot(snapshots);
  const previous = getPreviousSnapshot(snapshots, latest);

  return assets
    .map((asset) => {
      const value = getSnapshotValue(latest, asset.id);
      const previousValue = getSnapshotValue(previous, asset.id);
      const delta = value - previousValue;
      const deltaPercent =
        previousValue > 0 ? (delta / previousValue) * 100 : 0;
      return { asset, value, previousValue, delta, deltaPercent };
    })
    .filter((summary) => summary.value > 0 || summary.previousValue > 0)
    .sort((a, b) => b.value - a.value);
}

export function getBreakdownByCategory(
  assets: NetWorthAsset[],
  snapshot: NetWorthSnapshot | undefined,
  categoryNames: Record<NetWorthAssetCategory, string>,
): NetWorthBreakdownPoint[] {
  return groupBreakdown(
    assets,
    snapshot,
    (asset) => asset.category,
    categoryNames,
  );
}

export function getBreakdownByLiquidity(
  assets: NetWorthAsset[],
  snapshot: NetWorthSnapshot | undefined,
  liquidityNames: Record<NetWorthAssetLiquidity, string>,
): NetWorthBreakdownPoint[] {
  return groupBreakdown(
    assets,
    snapshot,
    (asset) => asset.liquidity,
    liquidityNames,
  );
}

export function getCategoryTrend(
  assets: NetWorthAsset[],
  snapshots: NetWorthSnapshot[],
  categoryNames: Record<NetWorthAssetCategory, string>,
): NetWorthCategoryTrendPoint[] {
  const categories = Object.keys(categoryNames) as NetWorthAssetCategory[];
  return sortSnapshots(snapshots).map((snapshot) => {
    const point: NetWorthCategoryTrendPoint = { month: snapshot.month };
    for (const category of categories) {
      point[category] = assets
        .filter((asset) => asset.category === category)
        .reduce(
          (total, asset) => total + getSnapshotValue(snapshot, asset.id),
          0,
        );
    }
    return point;
  });
}

export function getAssetHistory(
  snapshots: NetWorthSnapshot[],
  assetId: string,
): NetWorthAssetHistoryPoint[] {
  return sortSnapshots(snapshots).map((snapshot) => ({
    month: snapshot.month,
    value: getSnapshotValue(snapshot, assetId),
  }));
}

export function getLiquidValue(
  assets: NetWorthAsset[],
  snapshot: NetWorthSnapshot | undefined,
): number {
  return assets
    .filter((asset) => asset.liquidity === "instant")
    .reduce((total, asset) => total + getSnapshotValue(snapshot, asset.id), 0);
}

function getMonthOrdinal(month: string): number {
  const [year, monthNumber] = month.split("-").map(Number);
  return year * 12 + monthNumber - 1;
}

function groupBreakdown<T extends string>(
  assets: NetWorthAsset[],
  snapshot: NetWorthSnapshot | undefined,
  getKey: (asset: NetWorthAsset) => T,
  names: Record<T, string>,
): NetWorthBreakdownPoint[] {
  const totals = new Map<T, number>();
  for (const asset of assets) {
    const key = getKey(asset);
    totals.set(
      key,
      (totals.get(key) ?? 0) + getSnapshotValue(snapshot, asset.id),
    );
  }

  return [...totals.entries()]
    .map(([key, value]) => ({ key, name: names[key], value }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value);
}
