import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@juan/ui/components/ui/chart";

import { formatCompactISODate } from "../../lib/gym/date";
import type { ExerciseHistoryPoint } from "../../lib/gym/stats";

interface ExerciseLoadChartProps {
  data: ExerciseHistoryPoint[];
  currentDate: string;
  valueLabel?: string;
  formatValue?: (value: number) => string;
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: ExerciseHistoryPoint;
}

export function ExerciseLoadChart({
  data,
  currentDate,
  valueLabel = "Load",
  formatValue = (value) => `${value} kg`,
}: ExerciseLoadChartProps) {
  const config = {
    load: {
      label: valueLabel,
      color: "var(--muted-foreground)",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={config} className="aspect-auto h-32 w-full lg:h-40">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          minTickGap={24}
          tickFormatter={formatCompactISODate}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={36}
          tickCount={3}
          tickFormatter={(value: number) => `${value}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                typeof value === "string" ? formatCompactISODate(value) : value
              }
              formatter={(value) =>
                typeof value === "number" ? formatValue(value) : value
              }
              hideIndicator
            />
          }
        />
        <Line
          type="monotone"
          dataKey="load"
          stroke="var(--color-load)"
          strokeWidth={2}
          isAnimationActive={false}
          dot={({ cx, cy, payload }: DotProps) => {
            if (cx == null || cy == null || !payload) {
              return <g key="empty" />;
            }
            const isCurrent = payload.date === currentDate;
            return (
              <circle
                key={payload.date}
                cx={cx}
                cy={cy}
                r={isCurrent ? 5 : 3}
                fill={isCurrent ? "var(--primary)" : "var(--muted-foreground)"}
                stroke={
                  isCurrent ? "var(--primary)" : "var(--muted-foreground)"
                }
              />
            );
          }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
