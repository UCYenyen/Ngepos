'use client';

import { useEffect, useState } from 'react';
import {
  PackagePlus,
  PackageX,
  RefreshCw,
  ShoppingCart,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_name: string | null;
  type: 'sale' | 'restock' | 'adjustment' | 'damage';
  quantity_change: number;
  note: string | null;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

interface StockHistoryProps {
  businessId: string;
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPE_META: Record<
  StockMovement['type'],
  { label: string; icon: LucideIcon; tone: string }
> = {
  sale: { label: 'Penjualan', icon: ShoppingCart, tone: 'bg-error-light text-error' },
  restock: {
    label: 'Restock',
    icon: PackagePlus,
    tone: 'bg-success-light text-success',
  },
  adjustment: {
    label: 'Penyesuaian',
    icon: SlidersHorizontal,
    tone: 'bg-surface-2 text-ink-muted',
  },
  damage: { label: 'Rusak', icon: PackageX, tone: 'bg-error-light text-error' },
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function StockHistory({
  businessId,
  productId,
  productName,
  open,
  onOpenChange,
}: StockHistoryProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>(
    'loading'
  );

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      setStatus('loading');
      try {
        const response = await fetch(
          `/api/inventory/movements?businessId=${businessId}&productId=${productId}&limit=50`
        );
        if (!response.ok) throw new Error('fetch failed');
        const data = await response.json();
        if (!alive) return;
        setMovements(data.movements ?? []);
        setStatus('ready');
      } catch {
        if (alive) setStatus('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, businessId, productId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-hairline-soft px-5 py-4">
          <SheetTitle className="text-base font-semibold text-ink">
            Riwayat stok
          </SheetTitle>
          <SheetDescription className="text-[13px] text-ink-muted">
            {productName} · 50 pergerakan terakhir
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto px-5 py-5">
          {status === 'loading' && (
            <div className="flex flex-col gap-4">
              {['a', 'b', 'c', 'd'].map((key) => (
                <div key={key} className="flex gap-3">
                  <Skeleton className="size-8 shrink-0 rounded-full" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-ink-muted">Gagal memuat riwayat.</p>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="btn-secondary gap-2"
              >
                <RefreshCw className="size-4" />
                Tutup
              </button>
            </div>
          )}

          {status === 'ready' && movements.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-muted">
              Belum ada pergerakan stok untuk produk ini.
            </p>
          )}

          {status === 'ready' && movements.length > 0 && (
            <div className="flex flex-col">
              {movements.map((movement, index) => {
                const meta = TYPE_META[movement.type];
                const Icon = meta.icon;
                const last = index === movements.length - 1;
                return (
                  <div key={movement.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-full',
                          meta.tone
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      {!last && <span className="w-px flex-1 bg-hairline-soft" />}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 pb-5">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-ink">
                          {meta.label}
                        </span>
                        <span
                          className={cn(
                            'font-mono text-[13px] font-bold tabular-nums',
                            movement.quantity_change > 0
                              ? 'text-success'
                              : 'text-error'
                          )}
                        >
                          {movement.quantity_change > 0 ? '+' : ''}
                          {movement.quantity_change}
                        </span>
                      </div>
                      <span className="text-[12px] text-ink-muted">
                        {formatDateTime(movement.created_at)} ·{' '}
                        {movement.created_by_name}
                        {movement.variant_name
                          ? ` · ${movement.variant_name}`
                          : ''}
                      </span>
                      {movement.note && (
                        <span className="rounded-md bg-canvas px-2.5 py-1.5 text-[12px] text-ink-muted">
                          {movement.note}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
