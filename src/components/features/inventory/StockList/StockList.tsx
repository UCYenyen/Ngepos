'use client';

import { Fragment, useEffect, useState, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  Package,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryBadge } from '@/components/features/products/CategoryBadge/CategoryBadge';
import { StockAdjustment } from '../StockAdjustment/StockAdjustment';
import { StockHistory } from '../StockHistory/StockHistory';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/inventory';

interface StockListProps {
  businessId: string;
}

type Status = 'loading' | 'error' | 'ready';
type FilterBy = 'all' | 'low';

async function fetchInventory(businessId: string): Promise<InventoryProduct[]> {
  const response = await fetch(`/api/inventory?businessId=${businessId}`);
  if (!response.ok) throw new Error('fetch failed');
  return response.json();
}

function isLow(product: InventoryProduct): boolean {
  return (
    product.low_stock_threshold != null &&
    product.current_stock <= product.low_stock_threshold
  );
}

export function StockList({ businessId }: StockListProps) {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterBy>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [adjustTarget, setAdjustTarget] = useState<InventoryProduct | null>(null);
  const [historyTarget, setHistoryTarget] = useState<InventoryProduct | null>(
    null
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      setStatus('loading');
      try {
        const data = await fetchInventory(businessId);
        if (!alive) return;
        setProducts(data);
        setStatus('ready');
      } catch {
        if (alive) setStatus('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, [businessId]);

  async function refetch() {
    try {
      setProducts(await fetchInventory(businessId));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'loading') return <TableSkeleton />;
  if (status === 'error') return <ErrorBox onRetry={refetch} />;
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-hairline px-5 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-subtle">
          <Package className="size-6" />
        </span>
        <p className="text-sm text-ink-muted">
          Belum ada produk untuk dipantau stoknya.
        </p>
      </div>
    );
  }

  const query = search.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      (product.sku?.toLowerCase().includes(query) ?? false);
    const matchesFilter = filter === 'all' || isLow(product);
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-75">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari produk…"
            className="h-10 w-full rounded-md border border-hairline bg-surface-1 pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex gap-1.5">
          <FilterPill
            label="Semua"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <FilterPill
            label="Stok menipis"
            active={filter === 'low'}
            onClick={() => setFilter('low')}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-hairline bg-surface-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-2">
              <Th className="w-10" />
              <Th>Produk</Th>
              <Th>SKU</Th>
              <Th>Kategori</Th>
              <Th className="text-right">Stok saat ini</Th>
              <Th>Batas minimum</Th>
              <Th>Status</Th>
              <Th className="w-44" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <Td colSpan={8} className="py-8 text-center text-ink-muted">
                  Tidak ada produk yang cocok.
                </Td>
              </tr>
            ) : (
              filtered.map((product) => {
                const low = isLow(product);
                const open = expanded[product.id];
                const canExpand =
                  product.has_variants && product.variants.length > 0;

                return (
                  <Fragment key={product.id}>
                    <tr className="border-t border-hairline-soft">
                      <Td>
                        {canExpand && (
                          <button
                            type="button"
                            aria-label="Lihat varian"
                            onClick={() =>
                              setExpanded((prev) => ({
                                ...prev,
                                [product.id]: !prev[product.id],
                              }))
                            }
                            className="btn-icon size-7 text-ink-subtle"
                          >
                            {open ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </button>
                        )}
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink">
                            {product.name}
                          </span>
                          {product.has_variants && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
                              <Layers className="size-2.5" />
                              varian
                            </span>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <span className="font-mono text-[12.5px] text-ink-muted">
                          {product.sku || '—'}
                        </span>
                      </Td>
                      <Td>
                        {product.category_name ? (
                          <CategoryBadge name={product.category_name} />
                        ) : (
                          <span className="text-ink-tertiary">—</span>
                        )}
                      </Td>
                      <Td className="text-right">
                        <span
                          className={cn(
                            'font-mono text-[15px] font-bold tabular-nums',
                            low ? 'text-error' : 'text-ink'
                          )}
                        >
                          {product.current_stock}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-mono text-ink-muted">
                          {product.low_stock_threshold ?? '—'}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge
                          low={low}
                          tracked={product.low_stock_threshold != null}
                        />
                      </Td>
                      <Td>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setAdjustTarget(product)}
                            className="btn-secondary h-8 px-3 text-[13px]"
                          >
                            Sesuaikan
                          </button>
                          <button
                            type="button"
                            onClick={() => setHistoryTarget(product)}
                            aria-label="Riwayat stok"
                            className="btn-icon size-8 text-ink-subtle hover:text-ink"
                          >
                            <Clock className="size-4" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                    {canExpand &&
                      open &&
                      product.variants.map((variant) => (
                        <tr key={variant.id} className="bg-canvas">
                          <Td />
                          <Td colSpan={7}>
                            <div className="flex items-center justify-between pl-4 pr-2">
                              <span className="flex items-center gap-2 text-[13px] text-ink-muted">
                                <Layers className="size-3.5" />
                                {variant.name}
                              </span>
                              <span
                                className={cn(
                                  'font-mono text-[13px] tabular-nums',
                                  variant.stock_qty <= 5
                                    ? 'text-error'
                                    : 'text-ink-muted'
                                )}
                              >
                                {variant.stock_qty} unit
                              </span>
                            </div>
                          </Td>
                        </tr>
                      ))}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {adjustTarget && (
        <StockAdjustment
          businessId={businessId}
          product={adjustTarget}
          open
          onOpenChange={(open) => {
            if (!open) setAdjustTarget(null);
          }}
          onComplete={() => {
            setAdjustTarget(null);
            refetch();
          }}
        />
      )}

      {historyTarget && (
        <StockHistory
          businessId={businessId}
          productId={historyTarget.id}
          productName={historyTarget.name}
          open
          onOpenChange={(open) => {
            if (!open) setHistoryTarget(null);
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ low, tracked }: { low: boolean; tracked: boolean }) {
  if (!tracked) return <span className="text-[13px] text-ink-tertiary">—</span>;
  return low ? (
    <span className="badge badge-error gap-1.5">
      <span className="size-1.5 rounded-full bg-error" />
      Stok menipis
    </span>
  ) : (
    <span className="badge badge-success gap-1.5">
      <span className="size-1.5 rounded-full bg-success" />
      Aman
    </span>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors',
        active
          ? 'border-ink bg-ink text-surface-1'
          : 'border-hairline bg-surface-1 text-ink-muted hover:bg-canvas hover:text-ink'
      )}
    >
      {label}
    </button>
  );
}

function Th({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-subtle',
        className
      )}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn('px-4 py-3 align-middle text-[13.5px] text-ink', className)}
    >
      {children}
    </td>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-1">
      {['a', 'b', 'c', 'd', 'e'].map((key) => (
        <div
          key={key}
          className="flex items-center gap-4 border-t border-hairline-soft px-4 py-3.5 first:border-t-0"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-4 w-12" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface-1 px-5 py-12 text-center">
      <p className="text-sm text-ink-muted">Gagal memuat inventaris.</p>
      <button type="button" onClick={onRetry} className="btn-secondary gap-2">
        <RefreshCw className="size-4" />
        Coba lagi
      </button>
    </div>
  );
}
