'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Download,
  Receipt as ReceiptIcon,
  RefreshCw,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Receipt } from '@/components/features/pos/Receipt/Receipt';
import { formatCurrency } from '@/lib/format';
import {
  historyTransactionsToCsv,
  type HistoryCsvRow,
} from '@/lib/export/csv';
import { cn } from '@/lib/utils';
import type {
  PaymentMethod,
  PaymentStatus,
  Transaction,
  TransactionItem,
} from '@/types/pos';
import type { ReceiptLineItem } from '@/components/features/pos/Receipt/types';
import type { TransactionHistoryClientProps } from './types';

interface HistoryTransaction extends Transaction {
  transaction_items: TransactionItem[];
}

type Status = 'loading' | 'error' | 'ready';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  gateway: 'Kartu',
};

const STATUS_META: Record<PaymentStatus, { label: string; className: string }> =
  {
    paid: { label: 'Lunas', className: 'bg-success-light text-success' },
    pending: { label: 'Menunggu', className: 'bg-surface-2 text-ink-muted' },
    cancelled: { label: 'Batal', className: 'bg-error-light text-error' },
  };

type DateFilter = 'today' | 'week' | 'all';

const FILTERS: { key: DateFilter; label: string }[] = [
  { key: 'today', label: 'Hari ini' },
  { key: 'week', label: '7 hari' },
  { key: 'all', label: 'Semua' },
];

function startOfTodayMs(): number {
  const day = new Date();
  day.setHours(0, 0, 0, 0);
  return day.getTime();
}

function inRange(createdAt: string, filter: DateFilter): boolean {
  if (filter === 'all') return true;
  const time = new Date(createdAt).getTime();
  if (filter === 'today') return time >= startOfTodayMs();
  return time >= startOfTodayMs() - 6 * 86_400_000;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function toReceiptItems(items: TransactionItem[]): ReceiptLineItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    discount_amount: item.discount_amount,
    subtotal: item.subtotal,
  }));
}

export function TransactionHistoryClient({
  businessId,
  business,
}: TransactionHistoryClientProps) {
  const [transactions, setTransactions] = useState<HistoryTransaction[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [selected, setSelected] = useState<HistoryTransaction | null>(null);
  const [filter, setFilter] = useState<DateFilter>('today');
  const [query, setQuery] = useState('');
  const [refundConfirm, setRefundConfirm] = useState(false);
  const [restoreStock, setRestoreStock] = useState(true);
  const [refunding, setRefunding] = useState(false);

  async function handleRefund() {
    if (!selected) return;
    setRefunding(true);
    try {
      const response = await fetch(
        `/api/transactions/${selected.id}/refund`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ restoreStock }),
        }
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal melakukan refund');
      }
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === selected.id
            ? { ...transaction, payment_status: 'cancelled' as const }
            : transaction
        )
      );
      setSelected((prev) =>
        prev ? { ...prev, payment_status: 'cancelled' as const } : prev
      );
      setRefundConfirm(false);
      toast.success(
        restoreStock ? 'Transaksi direfund, stok dikembalikan' : 'Transaksi direfund'
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal melakukan refund'
      );
    } finally {
      setRefunding(false);
    }
  }

  function closeDetail() {
    setSelected(null);
    setRefundConfirm(false);
    setRestoreStock(true);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      setStatus('loading');
      try {
        const response = await fetch(
          `/api/transactions?businessId=${businessId}`
        );
        if (!response.ok) throw new Error('fetch failed');
        const data = (await response.json()) as HistoryTransaction[];
        if (!alive) return;
        setTransactions(data);
        setStatus('ready');
      } catch {
        if (alive) setStatus('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [businessId]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-2.5">
        {['a', 'b', 'c', 'd', 'e'].map((key) => (
          <Skeleton key={key} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface-1 px-5 py-12 text-center">
        <p className="text-sm text-ink-muted">Gagal memuat riwayat transaksi.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-secondary gap-2"
        >
          <RefreshCw className="size-4" />
          Coba lagi
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-hairline px-5 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-subtle">
          <ReceiptIcon className="size-6" />
        </span>
        <div className="flex max-w-sm flex-col gap-1.5">
          <p className="text-base font-semibold text-ink">Belum ada transaksi</p>
          <p className="text-[13px] text-ink-muted">
            Transaksi yang kamu proses di POS akan muncul di sini.
          </p>
        </div>
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = transactions.filter(
    (transaction) =>
      inRange(transaction.created_at, filter) &&
      (!q || transaction.id.toLowerCase().includes(q))
  );
  const paidTotal = filtered
    .filter((transaction) => transaction.payment_status === 'paid')
    .reduce((sum, transaction) => sum + transaction.total, 0);
  const activeLabel = FILTERS.find((item) => item.key === filter)?.label ?? '';

  function handleExport() {
    if (filtered.length === 0) return;
    const rows: HistoryCsvRow[] = filtered.map((transaction) => ({
      id: transaction.id,
      created_at: transaction.created_at,
      payment_method: PAYMENT_LABEL[transaction.payment_method],
      payment_status: STATUS_META[transaction.payment_status].label,
      item_count: transaction.transaction_items?.length ?? 0,
      subtotal: transaction.subtotal,
      discount_amount: transaction.discount_amount,
      tax_amount: transaction.tax_amount,
      total: transaction.total,
    }));
    const csv = historyTransactionsToCsv(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `riwayat-${filter}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5 rounded-xl border border-hairline bg-surface-1 px-4 py-2.5">
          <span className="text-[12px] text-ink-muted">
            Penjualan · {activeLabel} · {filtered.length} transaksi
          </span>
          <span className="font-mono text-xl font-bold tabular-nums text-ink">
            {formatCurrency(paidTotal)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari #ID"
              aria-label="Cari transaksi"
              className="h-8 w-32 rounded-full border border-hairline bg-surface-1 pl-8 pr-3 text-[12.5px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="flex gap-1.5">
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={cn(
                  'h-8 rounded-full border px-3 text-[12.5px] font-medium transition-colors',
                  filter === item.key
                    ? 'border-ink bg-ink text-surface-1'
                    : 'border-hairline bg-surface-1 text-ink-muted hover:bg-canvas hover:text-ink'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="btn-secondary h-8 gap-1.5 px-3 text-[12.5px] disabled:opacity-50"
          >
            <Download className="size-3.5" />
            CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-hairline px-5 py-10 text-center text-sm text-ink-muted">
          {q
            ? 'Tidak ada transaksi yang cocok.'
            : 'Tidak ada transaksi pada periode ini.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((transaction) => {
          const statusMeta = STATUS_META[transaction.payment_status];
          const itemCount = transaction.transaction_items?.length ?? 0;
          return (
            <button
              key={transaction.id}
              type="button"
              onClick={() => setSelected(transaction)}
              className="flex items-center justify-between gap-4 rounded-xl border border-hairline bg-surface-1 px-4 py-3.5 text-left transition-colors hover:border-ink-subtle"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-[13.5px] font-semibold text-ink">
                  #{transaction.id.slice(0, 8).toUpperCase()}
                </span>
                <span className="text-[12px] text-ink-muted">
                  {formatDateTime(transaction.created_at)} · {itemCount} item
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-[12px] text-ink-muted sm:inline">
                  {PAYMENT_LABEL[transaction.payment_method]}
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-medium',
                    statusMeta.className
                  )}
                >
                  {statusMeta.label}
                </span>
                <span className="font-mono text-[14px] font-bold tabular-nums text-ink">
                  {formatCurrency(transaction.total)}
                </span>
              </div>
            </button>
          );
          })}
        </div>
      )}

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) closeDetail();
        }}
      >
        <DialogContent className="sm:max-w-115">
          <DialogHeader>
            <DialogTitle className="sr-only">Detail transaksi</DialogTitle>
          </DialogHeader>
          {selected && (
            <>
              <Receipt
                transaction={selected}
                items={toReceiptItems(selected.transaction_items ?? [])}
                business={business}
                closeLabel="Tutup"
                onClose={closeDetail}
              />
              {selected.payment_status === 'cancelled' ? (
                <p className="mt-1 rounded-lg bg-surface-2 px-3 py-2.5 text-center text-[12.5px] text-ink-muted print:hidden">
                  Transaksi ini sudah direfund.
                </p>
              ) : refundConfirm ? (
                <div className="mt-1 flex flex-col gap-3 rounded-lg border border-hairline p-3.5 print:hidden">
                  <label className="flex items-center gap-2.5 text-[13px] text-ink">
                    <input
                      type="checkbox"
                      checked={restoreStock}
                      onChange={(event) => setRestoreStock(event.target.checked)}
                      className="size-4 accent-accent"
                    />
                    Kembalikan stok ke inventaris
                  </label>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRefundConfirm(false)}
                      className="btn-secondary h-10 flex-1"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleRefund}
                      disabled={refunding}
                      className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-error font-medium text-surface-1 transition-colors hover:bg-error/90 disabled:opacity-50"
                    >
                      {refunding ? 'Memproses…' : 'Ya, refund'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setRefundConfirm(true)}
                  className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-hairline font-medium text-error transition-colors hover:bg-error-light print:hidden"
                >
                  <RotateCcw className="size-4" />
                  Refund transaksi
                </button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
