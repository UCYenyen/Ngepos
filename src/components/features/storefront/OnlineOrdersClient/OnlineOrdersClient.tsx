'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Mail, Phone } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import type { OnlineOrder, OrderStatus } from '@/types/storefront';

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Menunggu', className: 'bg-accent/10 text-accent' },
  confirmed: { label: 'Dikonfirmasi', className: 'bg-success-light text-success' },
  completed: { label: 'Selesai', className: 'bg-surface-2 text-ink-muted' },
  cancelled: { label: 'Dibatalkan', className: 'bg-error-light text-error' },
};

const FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
  { value: 'all', label: 'Semua' },
];

export function OnlineOrdersClient({ orders }: { orders: OnlineOrder[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('pending');
  const [busyId, setBusyId] = useState<string | null>(null);

  const visible =
    filter === 'all' ? orders : orders.filter((order) => order.status === filter);

  async function updateStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/online-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success('Status pesanan diperbarui');
      router.refresh();
    } catch {
      toast.error('Gagal memperbarui status');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
              filter === option.value
                ? 'bg-ink text-surface-1'
                : 'bg-surface-2 text-ink-muted hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">
          Tidak ada pesanan pada kategori ini.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((order) => {
            const meta = STATUS_META[order.status];
            const busy = busyId === order.id;
            return (
              <li
                key={order.id}
                className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface-1 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-[14.5px] font-semibold text-ink">
                      {order.customer_name}
                    </span>
                    <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px] text-ink-muted">
                      <span className="flex items-center gap-1">
                        <Phone className="size-3.5" /> {order.customer_phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="size-3.5" /> {order.customer_email}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11.5px] font-medium ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                    <span className="text-[11.5px] text-ink-subtle">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-1 border-t border-hairline-soft pt-2.5">
                  {order.items.map((item, index) => (
                    <li
                      key={`${order.id}-${index}`}
                      className="flex justify-between text-[13px] text-ink-muted"
                    >
                      <span>
                        {item.qty}× {item.name}
                        {item.variant_name ? ` · ${item.variant_name}` : ''}
                      </span>
                      <span>{formatCurrency(item.line_total)}</span>
                    </li>
                  ))}
                </ul>

                {order.note && (
                  <p className="rounded-md bg-surface-2 px-3 py-2 text-[12.5px] text-ink-muted">
                    {order.note}
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 border-t border-hairline-soft pt-2.5">
                  <span className="text-[14px] font-semibold text-ink">
                    {formatCurrency(order.total)}
                  </span>
                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          className="text-[13px] font-medium text-error hover:underline disabled:opacity-50"
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => updateStatus(order.id, 'confirmed')}
                          className="btn-primary h-9 text-[13px] disabled:opacity-50"
                        >
                          Konfirmasi
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateStatus(order.id, 'completed')}
                        className="btn-primary h-9 text-[13px] disabled:opacity-50"
                      >
                        Tandai selesai
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
