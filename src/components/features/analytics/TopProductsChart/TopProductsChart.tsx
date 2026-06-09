'use client';

import type { TopProductsChartProps } from './types';

const BAR_COLORS = [
  'var(--accent)',
  'var(--chart-1)',
  'var(--chart-5)',
  'var(--chart-4)',
  'var(--chart-3)',
];

export function TopProductsChart({ data }: TopProductsChartProps) {
  const max = Math.max(...data.map((item) => item.quantity), 1);

  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-ink">Produk terlaris</h3>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">
          Belum ada data untuk periode ini.
        </p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {data.map((product, index) => (
            <div key={product.productId} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-ink">{product.name}</span>
                <span className="font-mono tabular-nums text-ink-muted">
                  {product.quantity} terjual
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(product.quantity / max) * 100}%`,
                    background: BAR_COLORS[index % BAR_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
