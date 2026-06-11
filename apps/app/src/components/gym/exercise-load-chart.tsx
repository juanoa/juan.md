import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@juan/ui/components/ui/chart";

import { parseISODate } from "../../lib/gym/date";
import type { ExerciseHistoryPoint } from "../../lib/gym/stats";

interface ExerciseLoadChartProps {
  data: ExerciseHistoryPoint[];
  currentDate: string;
}

const config = {
  load: {
    label: "Carga total",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

function formatTick(date: string): string {
  const d = parseISODate(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${month}`;
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: ExerciseHistoryPoint;
}

export function ExerciseLoadChart({
  data,
  currentDate,
}: ExerciseLoadChartProps) {
  return (
    <ChartContainer config={config} className="aspect-auto h-32 w-full">
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          minTickGap={24}
          tickFormatter={formatTick}
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
                typeof value === "string" ? formatTick(value) : value
              }
              formatter={(value) => `${value} kg`}
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
                fill={
                  isCurrent ? "var(--primary)" : "var(--muted-foreground)"
                }
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
