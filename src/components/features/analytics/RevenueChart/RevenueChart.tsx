"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import type { RevenueChartProps } from "./types";

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="card">
      <h3 className="text-ink font-semibold mb-4">Revenue</h3>
      {data.length === 0 ? (
        <p className="text-ink-muted text-sm">No data for this period</p>
      ) : (
        <ChartContainer config={chartConfig}>
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(Number(value))}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-chart-1)"
              fill="var(--color-chart-1)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
