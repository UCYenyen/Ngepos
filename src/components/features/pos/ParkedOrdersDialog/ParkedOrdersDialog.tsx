'use client';

import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/format';
import type { ParkedOrder } from '@/types/pos';
import type { ParkedOrdersDialogProps } from './types';

function parkedTotal(order: ParkedOrder): number {
  return order.items.reduce(
    (sum, item) => sum + item.price * item.quantity - item.discount_amount,
    0
  );
}

export function ParkedOrdersDialog({
  open,
  orders,
  onOpenChange,
  onRecall,
  onDiscard,
}: ParkedOrdersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-115">
        <DialogHeader>
          <DialogTitle>Pesanan ditahan</DialogTitle>
        </DialogHeader>
        {orders.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">
            Tidak ada pesanan ditahan.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-hairline p-3"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[13.5px] font-semibold text-ink">
                    {order.label || 'Tanpa nama'}
                  </span>
                  <span className="text-[12px] text-ink-muted">
                    {order.items.length} item ·{' '}
                    {formatCurrency(parkedTotal(order))}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDiscard(order)}
                    aria-label="Hapus pesanan ditahan"
                    className="btn-icon size-9 text-ink-subtle hover:text-error"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRecall(order)}
                    className="btn-accent h-9 px-4 text-[13px]"
                  >
                    Panggil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
