"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import type { TopProductsChartProps } from "./types";

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <div className="card">
      <h3 className="text-ink font-semibold mb-4">Top Products</h3>
      {data.length === 0 ? (
        <p className="text-ink-muted text-sm">No data for this period</p>
      ) : (
        <ChartContainer config={chartConfig}>
          <BarChart data={data} layout="vertical">
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(Number(value))}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Bar dataKey="revenue" fill="var(--color-chart-2)" radius={4} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
