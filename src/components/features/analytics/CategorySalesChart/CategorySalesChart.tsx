'use client';

import { Cell, Pie, PieChart } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/format';
import type { CategorySalesChartProps } from './types';

const SLICE_COLORS = [
  'var(--accent)',
  'var(--chart-1)',
  'var(--chart-5)',
  'var(--chart-4)',
  'var(--chart-3)',
];

const chartConfig = {
  revenue: { label: 'Pendapatan' },
} satisfies ChartConfig;

export function CategorySalesChart({ data }: CategorySalesChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.revenue, 0);

  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-ink">
        Penjualan per kategori
      </h3>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">
          Belum ada data untuk periode ini.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-square h-40 shrink-0"
          >
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
                innerRadius={48}
                outerRadius={70}
                strokeWidth={2}
                stroke="var(--surface-1)"
              >
                {data.map((slice, index) => (
                  <Cell
                    key={slice.categoryId ?? slice.name}
                    fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="flex w-full flex-col gap-2">
            {data.map((slice, index) => (
              <div
                key={slice.categoryId ?? slice.name}
                className="flex items-center gap-2 text-[12.5px]"
              >
                <span
                  className="size-2.5 shrink-0 rounded-sm"
                  style={{
                    background: SLICE_COLORS[index % SLICE_COLORS.length],
                  }}
                />
                <span className="flex-1 truncate font-medium text-ink">
                  {slice.name}
                </span>
                <span className="font-mono tabular-nums text-ink-muted">
                  {total > 0 ? Math.round((slice.revenue / total) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
