import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@juan/ui/components/ui/chart";

import { formatCompactMonth } from "../../lib/net-worth/date";
import type {
  NetWorthAssetHistoryPoint,
  NetWorthBreakdownPoint,
  NetWorthCategoryTrendPoint,
  NetWorthTimelinePoint,
} from "../../lib/net-worth/stats";
import type { NetWorthAssetCategory } from "../../lib/net-worth/types";
import {
  CATEGORY_NAMES,
  formatCompactCurrency,
  formatCurrency,
} from "./net-worth-format";

export const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#64748b",
];

const currencyFormatter = (value: unknown) =>
  typeof value === "number" ? formatCurrency(value) : String(value);

const labeledCurrencyFormatter = (value: unknown, name: unknown) => (
  <>
    <span className="text-muted-foreground">{formatTooltipName(name)}</span>
    <span className="text-foreground ml-auto font-mono font-medium tabular-nums">
      {currencyFormatter(value)}
    </span>
  </>
);

const compactCurrencyFormatter = (value: number) =>
  value === 0 ? "0" : formatCompactCurrency(value);

const HORIZONTAL_BAR_CHART_MARGIN = {
  top: 8,
  right: 8,
  left: -16,
  bottom: 0,
};
const HORIZONTAL_BAR_AXIS_WIDTH = 140;
const HORIZONTAL_BAR_LABEL_LENGTH = 21;

function formatTooltipName(name: unknown): string {
  if (typeof name !== "string") return String(name);
  if (name in CATEGORY_NAMES) {
    return CATEGORY_NAMES[name as NetWorthAssetCategory];
  }
  return name;
}

function formatHorizontalBarAxisLabel(value: string): string {
  if (value.length <= HORIZONTAL_BAR_LABEL_LENGTH) return value;
  return `${value.slice(0, HORIZONTAL_BAR_LABEL_LENGTH)}...`;
}

export function NetWorthTimelineChart({
  data,
  compact = false,
}: {
  data: NetWorthTimelinePoint[];
  compact?: boolean;
}) {
  const config = {
    total: {
      label: "Net worth",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer
      config={config}
      className={
        compact ? "aspect-auto h-36 w-full" : "aspect-auto h-64 w-full"
      }>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          minTickGap={compact ? 20 : 28}
          tickFormatter={formatCompactMonth}
        />
        <YAxis
          hide={compact}
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={48}
          tickFormatter={compactCurrencyFormatter}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                typeof value === "string" ? formatCompactMonth(value) : value
              }
              formatter={currencyFormatter}
              hideIndicator
            />
          }
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="var(--color-total)"
          strokeWidth={2}
          dot={!compact}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

export function NetWorthDeltaChart({
  data,
}: {
  data: NetWorthTimelinePoint[];
}) {
  const config = {
    delta: {
      label: "Monthly change",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart data={data.slice(1)} margin={{ top: 8, right: 8, left: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          minTickGap={24}
          tickFormatter={formatCompactMonth}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={48}
          tickFormatter={compactCurrencyFormatter}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                typeof value === "string" ? formatCompactMonth(value) : value
              }
              formatter={currencyFormatter}
              hideIndicator
            />
          }
        />
        <Bar dataKey="delta" isAnimationActive={false}>
          {data.slice(1).map((entry) => (
            <Cell
              key={entry.month}
              fill={entry.delta >= 0 ? "#16a34a" : "#dc2626"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function NetWorthBreakdownChart({
  data,
}: {
  data: NetWorthBreakdownPoint[];
}) {
  const config = {
    value: {
      label: "Value",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={labeledCurrencyFormatter}
              hideLabel
            />
          }
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={52}
          outerRadius={90}
          paddingAngle={2}
          isAnimationActive={false}>
          {data.map((entry, index) => (
            <Cell
              key={entry.key}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

export function NetWorthCategoryTrendChart({
  data,
  categories,
}: {
  data: NetWorthCategoryTrendPoint[];
  categories: NetWorthAssetCategory[];
}) {
  const config = Object.fromEntries(
    categories.map((category, index) => [
      category,
      {
        label: CATEGORY_NAMES[category],
        color: CHART_COLORS[index % CHART_COLORS.length],
      },
    ]),
  ) satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          minTickGap={24}
          tickFormatter={formatCompactMonth}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={48}
          tickFormatter={compactCurrencyFormatter}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                typeof value === "string" ? formatCompactMonth(value) : value
              }
              formatter={labeledCurrencyFormatter}
            />
          }
        />
        {categories.map((category, index) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stackId="category"
            fill={CHART_COLORS[index % CHART_COLORS.length]}
            stroke={CHART_COLORS[index % CHART_COLORS.length]}
            fillOpacity={0.45}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}

export function NetWorthAssetBarChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const config = {
    value: {
      label: "Value",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={HORIZONTAL_BAR_CHART_MARGIN}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={HORIZONTAL_BAR_AXIS_WIDTH}
          tickFormatter={formatHorizontalBarAxisLabel}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent formatter={currencyFormatter} hideLabel />
          }
        />
        <Bar
          dataKey="value"
          fill="var(--color-value)"
          radius={0}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}

export function NetWorthMoverChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const config = {
    value: {
      label: "Delta",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={HORIZONTAL_BAR_CHART_MARGIN}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={HORIZONTAL_BAR_AXIS_WIDTH}
          tickFormatter={formatHorizontalBarAxisLabel}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent formatter={currencyFormatter} hideLabel />
          }
        />
        <Bar dataKey="value" radius={0} isAnimationActive={false}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.value >= 0 ? "#16a34a" : "#dc2626"}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function NetWorthAssetHistoryChart({
  data,
}: {
  data: NetWorthAssetHistoryPoint[];
}) {
  const config = {
    value: {
      label: "Value",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          minTickGap={24}
          tickFormatter={formatCompactMonth}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={48}
          tickFormatter={compactCurrencyFormatter}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                typeof value === "string" ? formatCompactMonth(value) : value
              }
              formatter={currencyFormatter}
              hideIndicator
            />
          }
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
