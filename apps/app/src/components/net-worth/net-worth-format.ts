import {
  NET_WORTH_ASSET_CATEGORIES,
  NET_WORTH_ASSET_LIQUIDITY_LEVELS,
  type NetWorthAssetCategory,
  type NetWorthAssetLiquidity,
} from "../../lib/net-worth/types";

const CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const COMPACT_CURRENCY_FORMATTER = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const CATEGORY_NAMES = Object.fromEntries(
  NET_WORTH_ASSET_CATEGORIES.map((entry) => [entry.value, entry.name]),
) as Record<NetWorthAssetCategory, string>;

export const LIQUIDITY_NAMES = Object.fromEntries(
  NET_WORTH_ASSET_LIQUIDITY_LEVELS.map((entry) => [entry.value, entry.name]),
) as Record<NetWorthAssetLiquidity, string>;

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

export function formatCompactCurrency(value: number): string {
  return COMPACT_CURRENCY_FORMATTER.format(value);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0.00%";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatSignedCurrency(value: number): string {
  if (value === 0) return formatCurrency(0);
  return `${value > 0 ? "+" : ""}${formatCurrency(value)}`;
}

export function getCategoryName(category: NetWorthAssetCategory): string {
  return CATEGORY_NAMES[category];
}

export function getLiquidityName(liquidity: NetWorthAssetLiquidity): string {
  return LIQUIDITY_NAMES[liquidity];
}
