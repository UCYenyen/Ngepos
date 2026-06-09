'use client';

import { InitialAvatar } from '@/components/common/InitialAvatar/InitialAvatar';
import { formatCurrency } from '@/lib/format';
import type { StaffPerformanceProps } from './types';

export function StaffPerformance({ data }: StaffPerformanceProps) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-1 p-5">
      <h3 className="mb-4 text-[15px] font-semibold text-ink">Kinerja kasir</h3>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-muted">
          Belum ada data untuk periode ini.
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-subtle">
              <th className="pb-3">Kasir</th>
              <th className="pb-3 text-right">Pendapatan</th>
              <th className="pb-3 text-right">Transaksi</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.cashierId} className="border-t border-hairline-soft">
                <td className="py-2.5">
                  <div className="flex items-center gap-2.5">
                    <InitialAvatar name={row.name} size={28} shape="circle" />
                    <span className="text-[13.5px] text-ink">{row.name}</span>
                  </div>
                </td>
                <td className="py-2.5 text-right">
                  <span className="font-mono font-semibold tabular-nums text-ink">
                    {formatCurrency(row.revenue)}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <span className="font-mono tabular-nums text-ink-muted">
                    {row.transactions}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
