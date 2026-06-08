"use client";

import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import type { CategorySalesChartProps } from "./types";

const sliceColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

const chartConfig = {
  revenue: { label: "Revenue" },
} satisfies ChartConfig;

export function CategorySalesChart({ data }: CategorySalesChartProps) {
  return (
    <div className="card">
      <h3 className="text-ink font-semibold mb-4">Sales by Category</h3>
      {data.length === 0 ? (
        <p className="text-ink-muted text-sm">No data for this period</p>
      ) : (
        <ChartContainer config={chartConfig}>
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Pie
              data={data}
              dataKey="revenue"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
            >
              {data.map((slice, index) => (
                <Cell
                  key={slice.categoryId ?? slice.name}
                  fill={sliceColors[index % sliceColors.length]}
                />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      )}
    </div>
  );
}
