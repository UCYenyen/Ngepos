'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { ExternalLink, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { GatewayCheckoutProps } from './types';

const POLL_INTERVAL_MS = 3000;

export function GatewayCheckout({
  transactionId,
  invoiceUrl,
  total,
  onPaid,
  onCancel,
}: GatewayCheckoutProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(invoiceUrl, { width: 220, margin: 1 })
      .then((url) => {
        if (alive) setQrDataUrl(url);
      })
      .catch(() => {
        if (alive) setQrDataUrl(null);
      });
    return () => {
      alive = false;
    };
  }, [invoiceUrl]);

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const response = await fetch(
          `/api/transactions/${transactionId}/verify`,
          { method: 'POST' }
        );
        if (!response.ok) return;
        const data = (await response.json()) as { status?: string };
        if (active && data.status === 'paid') {
          active = false;
          onPaid();
        }
      } catch {
        // keep polling on transient errors
      }
    }

    const interval = setInterval(check, POLL_INTERVAL_MS);
    check();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [transactionId, onPaid]);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex w-full items-center justify-between rounded-lg bg-canvas px-4 py-3.5">
        <span className="text-[13.5px] text-ink-muted">Total tagihan</span>
        <span className="font-mono text-lg font-bold tabular-nums text-ink">
          {formatCurrency(total)}
        </span>
      </div>

      <span className="text-[13.5px] text-ink-muted">
        Minta pelanggan scan untuk membayar via Xendit
      </span>

      <div className="flex size-55 items-center justify-center rounded-media border border-hairline bg-surface-1 p-3">
        {qrDataUrl ? (
          <Image
            src={qrDataUrl}
            alt="Kode pembayaran Xendit"
            width={220}
            height={220}
            unoptimized
            className="size-full object-contain"
          />
        ) : (
          <Loader2 className="size-8 animate-spin text-ink-subtle" />
        )}
      </div>

      <a
        href={invoiceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary h-10 w-full gap-2"
      >
        <ExternalLink className="size-4" />
        Buka halaman pembayaran
      </a>

      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-muted">
        <Loader2 className="size-4 animate-spin text-accent" />
        Menunggu pembayaran…
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="text-[13px] text-ink-subtle transition-colors hover:text-ink"
      >
        Batalkan
      </button>
    </div>
  );
}
