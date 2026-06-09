'use client';

import { Users } from 'lucide-react';
import { TABLE_STATUS_META } from '../tableStatus';
import { cn } from '@/lib/utils';
import type { Table } from '@/types/pos';

interface TableCardProps {
  table: Table;
  onClick: (table: Table) => void;
}

export function TableCard({ table, onClick }: TableCardProps) {
  const meta = TABLE_STATUS_META[table.status];

  return (
    <button
      type="button"
      onClick={() => onClick(table)}
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-surface-1 p-4 text-left transition-colors hover:border-ink-subtle',
        table.status === 'occupied' ? 'border-accent' : 'border-hairline'
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-semibold text-ink">{table.name}</span>
        <span
          className="size-2.5 rounded-full"
          style={{ background: meta.dot }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[13px] text-ink-muted">
          <Users className="size-3.5" />
          {table.capacity ?? '—'} kursi
        </span>
        <span className={cn('text-[12px] font-medium', meta.text)}>
          {meta.label}
        </span>
      </div>
    </button>
  );
}
