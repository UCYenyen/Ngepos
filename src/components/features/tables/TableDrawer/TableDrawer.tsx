'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Pencil, Trash2, XCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TABLE_STATUSES, TABLE_STATUS_META } from '../tableStatus';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { OpenTableOrder, Table, TableStatus } from '@/types/pos';

interface TableDrawerProps {
  table: Table | null;
  businessId: string;
  canManage: boolean;
  busy: boolean;
  openOrder?: OpenTableOrder | null;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (table: Table, status: TableStatus) => void;
  onCancelTab: (table: Table) => void;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
}

function tabTotal(order: OpenTableOrder): number {
  return order.items.reduce(
    (sum, item) => sum + item.price * item.quantity - item.discount_amount,
    0
  );
}

export function TableDrawer({
  table,
  businessId,
  canManage,
  busy,
  openOrder,
  onOpenChange,
  onStatusChange,
  onCancelTab,
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

              {openOrder ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-ink">
                      Pesanan berjalan
                    </span>
                    <span className="text-[12px] text-ink-muted">
                      {openOrder.items.length} item
                    </span>
                  </div>
                  <div className="flex flex-col divide-y divide-hairline-soft rounded-lg border border-hairline">
                    {openOrder.items.map((item, index) => (
                      <div
                        key={`${item.product_id}-${item.variant_id ?? ''}-${index}`}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-[13px]"
                      >
                        <span className="truncate text-ink-muted">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="shrink-0 font-mono tabular-nums text-ink">
                          {formatCurrency(
                            item.price * item.quantity - item.discount_amount
                          )}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-3 py-2.5">
                      <span className="text-[13px] font-semibold text-ink">
                        Total
                      </span>
                      <span className="font-mono text-[14px] font-bold tabular-nums text-ink">
                        {formatCurrency(tabTotal(openOrder))}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="rounded-lg bg-canvas px-3 py-2.5 text-[12.5px] text-ink-muted">
                  Pesanan per meja dikelola lewat POS. Buka POS untuk menambah
                  item ke meja ini.
                </p>
              )}

              <button
                type="button"
                onClick={() => router.push(`/dashboard/${businessId}/pos`)}
                className="btn-accent h-11 w-full gap-2"
              >
                <ArrowRight className="size-4" />
                {openOrder ? 'Lanjutkan di POS' : 'Buka di POS'}
              </button>

              {openOrder && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onCancelTab(table)}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-hairline font-medium text-error transition-colors hover:bg-error-light disabled:opacity-50"
                >
                  <XCircle className="size-4" />
                  Batalkan pesanan
                </button>
              )}
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
