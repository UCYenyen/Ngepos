'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  formatCompactCurrency,
  formatCurrency,
  formatDayMonth,
} from '@/lib/format';
import type { RevenueChartProps } from './types';

const chartConfig = {
  revenue: { label: 'Pendapatan', color: 'var(--accent)' },
} satisfies ChartConfig;

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-ink">Pendapatan</h3>
        <span className="flex items-center gap-1.5 text-[12.5px] text-ink-muted">
          <span className="size-2 rounded-full bg-accent" />
          Revenue
        </span>
      </div>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">
          Belum ada data untuk periode ini.
        </p>
      ) : (
        <ChartContainer config={chartConfig} className="aspect-auto h-60 w-full">
          <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--hairline-soft)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickMargin={8}
              tickFormatter={(value) => formatDayMonth(String(value))}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={60}
              tickFormatter={(value) => formatCompactCurrency(Number(value))}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatCurrency(Number(value))}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--accent)"
              strokeWidth={2.5}
              fill="url(#revenueFill)"
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
