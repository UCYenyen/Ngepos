"use client";

import { formatCurrency } from "@/lib/format";
import type { MetricCardsProps } from "./types";

export function MetricCards({ summary }: MetricCardsProps) {
  const metrics = [
    { label: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
    { label: "Transactions", value: summary.transactionCount },
    {
      label: "Avg Order Value",
      value: formatCurrency(summary.averageOrderValue),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="card">
          <p className="text-ink-muted text-sm">{metric.label}</p>
          <p className="text-ink text-2xl font-semibold">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
