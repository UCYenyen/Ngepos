'use client';

import { useState } from 'react';
import { Check, ChevronDown, UtensilsCrossed } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Table, TableStatus } from '@/types/pos';

interface TableSelectProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelect: (tableId: string | null) => void;
}

const STATUS_LABEL: Record<TableStatus, string> = {
  available: 'Kosong',
  occupied: 'Terisi',
  reserved: 'Reservasi',
};

export function TableSelect({
  tables,
  selectedTableId,
  onSelect,
}: TableSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = tables.find((table) => table.id === selectedTableId);

  function choose(id: string | null) {
    onSelect(id);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex h-9.5 w-full items-center justify-between rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink transition-colors hover:bg-canvas">
        <span className="flex items-center gap-2">
          <UtensilsCrossed className="size-4 text-ink-subtle" />
          {selected ? (
            <span className="font-medium">
              {selected.name}
              {selected.capacity ? (
                <span className="text-ink-muted"> · {selected.capacity} org</span>
              ) : null}
            </span>
          ) : (
            <span className="text-ink-muted">Pilih meja</span>
          )}
        </span>
        <ChevronDown className="size-4 text-ink-subtle" />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} className="w-64 gap-0.5 p-1.5">
        <button
          type="button"
          onClick={() => choose(null)}
          className={cn(
            'flex w-full items-center justify-between rounded-md p-2 text-left text-[13px] transition-colors hover:bg-surface-2',
            !selectedTableId && 'bg-surface-2'
          )}
        >
          <span className="text-ink-muted">Tanpa meja</span>
          {!selectedTableId && <Check className="size-4 text-accent" />}
        </button>
        {tables.length === 0 ? (
          <p className="px-2 py-3 text-center text-[12.5px] text-ink-muted">
            Belum ada meja. Tambahkan di menu Meja.
          </p>
        ) : (
          tables.map((table) => (
            <button
              key={table.id}
              type="button"
              onClick={() => choose(table.id)}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-md p-2 text-left transition-colors hover:bg-surface-2',
                table.id === selectedTableId && 'bg-surface-2'
              )}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-semibold text-ink">
                  {table.name}
                </span>
                <span className="text-[11px] text-ink-muted">
                  {table.capacity ? `${table.capacity} kursi` : 'kapasitas —'} ·{' '}
                  {STATUS_LABEL[table.status]}
                </span>
              </span>
              {table.id === selectedTableId && (
                <Check className="size-4 shrink-0 text-accent" />
              )}
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
