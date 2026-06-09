'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Banknote, CreditCard, QrCode } from 'lucide-react';
import { PaymentMethodCard } from '../PaymentMethodCard/PaymentMethodCard';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types/pos';

interface PaymentFormProps {
  total: number;
  paymentGatewayEnabled: boolean;
  qrisImage?: string;
  onSubmit: (
    paymentMethod: PaymentMethod,
    amountReceived?: number,
    notes?: string
  ) => void;
  loading?: boolean;
}

function quickAmounts(total: number): number[] {
  const denominations = [10000, 20000, 50000, 100000, 150000, 200000, 500000];
  return denominations.filter((value) => value > total).slice(0, 3);
}

export function PaymentForm({
  total,
  paymentGatewayEnabled,
  qrisImage,
  onSubmit,
  loading = false,
}: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountReceived, setAmountReceived] = useState(0);

  const change = amountReceived - total;
  const cashShort = method === 'cash' && amountReceived < total;

  function handleConfirm() {
    if (cashShort) return;
    onSubmit(method, method === 'cash' ? amountReceived : undefined);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2.5">
        <PaymentMethodCard
          icon={Banknote}
          label="Tunai"
          sublabel="Cash"
          active={method === 'cash'}
          onSelect={() => setMethod('cash')}
        />
        <PaymentMethodCard
          icon={QrCode}
          label="QRIS"
          sublabel="Scan"
          active={method === 'qris'}
          onSelect={() => setMethod('qris')}
        />
        <PaymentMethodCard
          icon={CreditCard}
          label="Gateway"
          sublabel="Midtrans"
          active={method === 'gateway'}
          locked={!paymentGatewayEnabled}
          onSelect={() => setMethod('gateway')}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-canvas px-4 py-3.5">
        <span className="text-[13.5px] text-ink-muted">Total tagihan</span>
        <span className="font-mono text-lg font-bold tabular-nums text-ink">
          {formatCurrency(total)}
        </span>
      </div>

      {method === 'cash' && (
        <>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="amount-received"
              className="text-[13px] font-medium text-ink"
            >
              Uang diterima
            </label>
            <input
              id="amount-received"
              type="number"
              min={0}
              inputMode="numeric"
              value={amountReceived || ''}
              onChange={(event) =>
                setAmountReceived(Number(event.target.value) || 0)
              }
              placeholder="0"
              className="h-12 w-full rounded-md border border-hairline bg-surface-1 px-3 font-mono text-lg font-bold tabular-nums text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAmountReceived(total)}
                className="h-7 rounded-full border border-hairline bg-surface-1 px-3 text-xs font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
              >
                Uang pas
              </button>
              {quickAmounts(total).map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setAmountReceived(amount)}
                  className="h-7 rounded-full border border-hairline bg-surface-1 px-3 text-xs font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
                >
                  {amount.toLocaleString('id-ID')}
                </button>
              ))}
            </div>
          </div>
          <div
            className={cn(
              'flex items-center justify-between rounded-lg px-4 py-3.5',
              cashShort ? 'bg-error-light' : 'bg-success-light'
            )}
          >
            <span
              className={cn(
                'text-[13.5px] font-semibold',
                cashShort ? 'text-error' : 'text-success'
              )}
            >
              {cashShort ? 'Kurang' : 'Kembalian'}
            </span>
            <span
              className={cn(
                'font-mono text-[22px] font-bold tabular-nums',
                cashShort ? 'text-error' : 'text-success'
              )}
            >
              {formatCurrency(Math.abs(change))}
            </span>
          </div>
        </>
      )}

      {method === 'qris' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="text-[13.5px] text-ink-muted">
            Minta pelanggan scan kode untuk membayar
          </span>
          {qrisImage ? (
            <Image
              src={qrisImage}
              alt="Kode QRIS"
              width={220}
              height={220}
              className="size-55 rounded-media border border-hairline object-contain p-3"
            />
          ) : (
            <div className="flex w-full flex-col items-center gap-2 rounded-lg bg-canvas px-4 py-6 text-ink-muted">
              <QrCode className="size-10" strokeWidth={1.4} />
              <p className="max-w-xs text-[13px]">
                QRIS belum dikonfigurasi. Unggah gambar QRIS di Pengaturan.
              </p>
            </div>
          )}
        </div>
      )}

      {method === 'gateway' && (
        <div className="rounded-lg bg-canvas px-4 py-4 text-[13px] text-ink-muted">
          Pembayaran diproses lewat gateway. Pelanggan diarahkan ke halaman
          pembayaran setelah konfirmasi.
        </div>
      )}

      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading || cashShort}
        className="btn-accent h-12 w-full text-base disabled:opacity-50"
      >
        {loading
          ? 'Memproses…'
          : method === 'qris'
            ? 'Tandai lunas'
            : 'Selesaikan pembayaran'}
      </button>
    </div>
  );
}
