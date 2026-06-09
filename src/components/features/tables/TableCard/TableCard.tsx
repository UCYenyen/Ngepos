'use client';

import { Users } from 'lucide-react';
import { TABLE_STATUS_META } from '../tableStatus';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { OpenTableOrder, Table } from '@/types/pos';

interface TableCardProps {
  table: Table;
  openOrder?: OpenTableOrder | null;
  onClick: (table: Table) => void;
}

function tabTotal(order: OpenTableOrder): number {
  return order.items.reduce(
    (sum, item) => sum + item.price * item.quantity - item.discount_amount,
    0
  );
}

export function TableCard({ table, openOrder, onClick }: TableCardProps) {
  const meta = TABLE_STATUS_META[table.status];
  const hasTab = Boolean(openOrder);

  return (
    <button
      type="button"
      onClick={() => onClick(table)}
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-surface-1 p-4 text-left transition-colors hover:border-ink-subtle',
        hasTab || table.status === 'occupied'
          ? 'border-accent'
          : 'border-hairline'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-ink">{table.name}</span>
        <span
          className="size-2.5 rounded-full"
          style={{ background: meta.dot }}
        />
      </div>
      {openOrder ? (
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-accent">
            Tab terbuka
          </span>
          <span className="font-mono text-[13px] font-bold tabular-nums text-ink">
            {formatCurrency(tabTotal(openOrder))}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[13px] text-ink-muted">
            <Users className="size-3.5" />
            {table.capacity ?? '—'} kursi
          </span>
          <span className={cn('text-[12px] font-medium', meta.text)}>
            {meta.label}
          </span>
        </div>
      )}
    </button>
  );
}
