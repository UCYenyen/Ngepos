'use client';

import { formatCompactCurrency, formatCurrency } from '@/lib/format';
import type { MetricCardsProps } from './types';

export function MetricCards({ summary }: MetricCardsProps) {
  const metrics = [
    {
      label: 'Total Pendapatan',
      value: formatCompactCurrency(summary.totalRevenue),
    },
    {
      label: 'Jumlah Transaksi',
      value: summary.transactionCount.toLocaleString('id-ID'),
    },
    {
      label: 'Rata-rata Order (AOV)',
      value: formatCurrency(summary.averageOrderValue),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex flex-col gap-2 rounded-xl border border-hairline bg-surface-1 p-5"
        >
          <span className="text-[13px] text-ink-muted">{metric.label}</span>
          <span className="font-mono text-2xl font-bold tracking-tight tabular-nums text-ink">
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
}
