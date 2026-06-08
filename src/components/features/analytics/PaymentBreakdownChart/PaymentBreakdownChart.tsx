"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import type { PaymentBreakdownSlice } from "@/types/analytics";
import type { PaymentBreakdownChartProps } from "./types";

const methodLabels: Record<PaymentBreakdownSlice["method"], string> = {
  cash: "Cash",
  qris: "QRIS",
  gateway: "Gateway",
};

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--color-chart-3)" },
} satisfies ChartConfig;

export function PaymentBreakdownChart({ data }: PaymentBreakdownChartProps) {
  const chartData = data.map((slice) => ({
    ...slice,
    method: methodLabels[slice.method],
  }));

  return (
    <div className="card">
      <h3 className="text-ink font-semibold mb-4">Payment Methods</h3>
      {chartData.length === 0 ? (
        <p className="text-ink-muted text-sm">No data for this period</p>
      ) : (
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="method" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(Number(value))}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Bar dataKey="revenue" fill="var(--color-chart-3)" radius={4} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
