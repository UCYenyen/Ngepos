'use client';

import { Check, Mail, MessageCircle, Plus, Printer } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { PaymentMethod } from '@/types/pos';
import type { ReceiptProps } from './types';

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: 'Tunai',
  qris: 'QRIS',
  gateway: 'Kartu / Online',
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function Receipt({
  transaction,
  items,
  business,
  amountReceived,
  tableName,
  onClose,
}: ReceiptProps) {
  const change = amountReceived != null ? amountReceived - transaction.total : null;

  function handlePrint() {
    window.print();
  }

  function handleWhatsApp() {
    const message = `Terima kasih telah berbelanja di ${business.name}!\nNo. Transaksi: ${transaction.id}\nTotal: ${formatCurrency(transaction.total)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }

  function handleEmail() {
    const lines = items
      .map(
        (item) =>
          `${item.quantity}x ${item.name} - ${formatCurrency(item.subtotal)}`
      )
      .join('\n');
    const subject = `Struk Pembelian - ${business.name}`;
    const body = `${business.name}\n${formatDateTime(transaction.created_at)}\nNo. Transaksi: ${transaction.id}\n\n${lines}\n\nTotal: ${formatCurrency(transaction.total)}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <div className="flex flex-col" data-print-receipt>
      <div className="flex flex-col items-center gap-2.5 px-6 pt-2 text-center print:hidden">
        <span className="flex size-12 items-center justify-center rounded-full bg-success-light text-success">
          <Check className="size-6.5" strokeWidth={2.4} />
        </span>
        <p className="text-lg font-semibold text-ink">Pembayaran berhasil</p>
        <p className="text-[13px] text-ink-muted">
          Transaksi #{transaction.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="my-5 rounded-lg border border-dashed border-hairline bg-canvas p-4.5 font-mono text-ink print:border-solid">
        <div className="mb-3 flex flex-col items-center text-center">
          <span className="text-sm font-bold uppercase text-ink">
            {business.name}
          </span>
          {business.address && (
            <span className="text-[11px] text-ink-muted">{business.address}</span>
          )}
          <span className="text-[11px] text-ink-muted">
            {formatDateTime(transaction.created_at)}
          </span>
          {tableName && (
            <span className="text-[11px] text-ink-muted">Meja: {tableName}</span>
          )}
        </div>
        <div className="border-t border-hairline" />
        <div className="flex flex-col gap-1.5 py-3 text-xs">
          {items.map((item, index) => (
            <div
              key={item.id ?? `${item.name}-${index}`}
              className="flex justify-between gap-2"
            >
              <span className="text-ink-muted">
                {item.quantity}x {item.name}
              </span>
              <span className="tabular-nums">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-hairline" />
        <div className="flex flex-col gap-1.5 pt-3 text-xs">
          <ReceiptRow label="Subtotal" value={formatCurrency(transaction.subtotal)} />
          {transaction.discount_amount > 0 && (
            <ReceiptRow
              label="Diskon"
              value={`−${formatCurrency(transaction.discount_amount)}`}
            />
          )}
          {transaction.tax_amount > 0 && (
            <ReceiptRow label="Pajak" value={formatCurrency(transaction.tax_amount)} />
          )}
          <div className="mt-1 flex justify-between text-sm font-bold text-ink">
            <span>TOTAL</span>
            <span className="tabular-nums">
              {formatCurrency(transaction.total)}
            </span>
          </div>
          <ReceiptRow
            label="Metode"
            value={PAYMENT_LABEL[transaction.payment_method]}
          />
          {amountReceived != null && (
            <>
              <ReceiptRow label="Tunai" value={formatCurrency(amountReceived)} />
              {change != null && change >= 0 && (
                <ReceiptRow label="Kembalian" value={formatCurrency(change)} />
              )}
            </>
          )}
        </div>
        <div className="mt-3 border-t border-hairline pt-3 text-center text-[11px] text-ink-muted">
          Terima kasih telah berbelanja
        </div>
      </div>

      <div className="flex flex-col gap-3 print:hidden">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary h-11 flex-1 gap-2"
          >
            <Printer className="size-4" />
            Cetak
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-accent h-11 flex-1 gap-2"
          >
            <Plus className="size-4" />
            Transaksi baru
          </button>
        </div>
        <div className="flex items-center justify-center gap-4 text-[12.5px] text-ink-subtle">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-1 transition-colors hover:text-ink"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp
          </button>
          <button
            type="button"
            onClick={handleEmail}
            className="inline-flex items-center gap-1 transition-colors hover:text-ink"
          >
            <Mail className="size-3.5" />
            Email
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-muted">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
