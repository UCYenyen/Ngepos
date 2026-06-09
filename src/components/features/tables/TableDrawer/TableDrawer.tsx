'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TABLE_STATUSES, TABLE_STATUS_META } from '../tableStatus';
import { cn } from '@/lib/utils';
import type { Table, TableStatus } from '@/types/pos';

interface TableDrawerProps {
  table: Table | null;
  businessId: string;
  canManage: boolean;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (table: Table, status: TableStatus) => void;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
}

export function TableDrawer({
  table,
  businessId,
  canManage,
  busy,
  onOpenChange,
  onStatusChange,
  onEdit,
  onDelete,
}: TableDrawerProps) {
  const router = useRouter();

  return (
    <Sheet open={table !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        {table && (
          <>
            <SheetHeader className="border-b border-hairline-soft px-5 py-4">
              <SheetTitle className="text-base font-semibold text-ink">
                {table.name}
              </SheetTitle>
              <SheetDescription className="text-[13px] text-ink-muted">
                {table.capacity ?? '—'} kursi
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-auto px-5 py-5">
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-medium text-ink">Status</span>
                <div className="grid grid-cols-3 gap-2">
                  {TABLE_STATUSES.map((status) => {
                    const meta = TABLE_STATUS_META[status];
                    const active = table.status === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        disabled={busy}
                        onClick={() => onStatusChange(table, status)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors disabled:opacity-50',
                          active
                            ? 'border-accent bg-accent/10'
                            : 'border-hairline bg-surface-1 hover:bg-canvas'
                        )}
                      >
                        <span
                          className="size-2.5 rounded-full"
                          style={{ background: meta.dot }}
                        />
                        <span className="text-[12px] font-medium text-ink">
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="rounded-lg bg-canvas px-3 py-2.5 text-[12.5px] text-ink-muted">
                Pesanan per meja dikelola lewat POS. Buka POS untuk menambah item
                ke meja ini.
              </p>

              <button
                type="button"
                onClick={() => router.push(`/dashboard/${businessId}/pos`)}
                className="btn-accent h-11 w-full gap-2"
              >
                <ArrowRight className="size-4" />
                Buka di POS
              </button>
            </div>

            {canManage && (
              <div className="flex gap-3 border-t border-hairline-soft px-5 py-4">
                <button
                  type="button"
                  onClick={() => onEdit(table)}
                  className="btn-secondary flex-1 gap-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(table)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-hairline px-6 py-2.5 font-medium text-error transition-colors hover:bg-error-light"
                >
                  <Trash2 className="size-4" />
                  Hapus
                </button>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
