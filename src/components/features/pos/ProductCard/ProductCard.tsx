'use client';

import Image from 'next/image';
import { Layers } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { Product } from '@/types/product';
import type { ProductCardProps } from './types';

function isLowStock(product: Product): boolean {
  return (
    product.track_stock &&
    product.low_stock_threshold != null &&
    (product.stock_qty ?? 0) <= product.low_stock_threshold
  );
}

export function ProductCard({
  product,
  categoryColor,
  onSelect,
}: ProductCardProps) {
  const low = isLowStock(product);

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="flex flex-col gap-2 rounded-media border border-hairline bg-surface-1 p-2.5 text-left transition-colors hover:border-ink-subtle"
    >
      <div className="relative">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-md bg-surface-2">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              className="object-cover"
            />
          ) : null}
        </div>
        {low && (
          <span className="badge badge-error absolute left-1.5 top-1.5 h-4.5 px-1.5 text-[10px]">
            Menipis
          </span>
        )}
        {product.has_variants && (
          <span className="absolute right-1.5 top-1.5 inline-flex h-4.5 items-center gap-0.5 rounded-full border border-hairline bg-surface-1 px-1.5 text-[10px] font-medium text-ink-muted">
            <Layers className="size-2.5" />
            varian
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="line-clamp-2 min-h-8 text-[12.5px] font-semibold leading-tight text-ink">
          {product.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[13px] font-bold tabular-nums text-accent">
            {formatCurrency(product.price)}
          </span>
          <span
            className="size-2 rounded-full"
            style={{ background: categoryColor ?? 'var(--hairline)' }}
          />
        </div>
      </div>
    </button>
  );
}
