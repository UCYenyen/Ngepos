'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/format';
import type { Product, ProductVariant } from '@/types/product';

interface VariantPickerProps {
  product: Product | null;
  onPick: (product: Product, variant: ProductVariant) => void;
  onOpenChange: (open: boolean) => void;
}

export function VariantPicker({
  product,
  onPick,
  onOpenChange,
}: VariantPickerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${product.id}/variants`);
        if (response.ok) {
          const data = (await response.json()) as ProductVariant[];
          if (alive) setVariants(data);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [product]);

  return (
    <Dialog open={product !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>
            Pilih varian{product ? ` · ${product.name}` : ''}
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex flex-col gap-2">
            {['a', 'b', 'c'].map((key) => (
              <Skeleton key={key} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : variants.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-muted">
            Produk ini belum punya varian.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {product &&
              variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onPick(product, variant)}
                  className="flex items-center justify-between rounded-lg border border-hairline bg-surface-1 p-3 text-left transition-colors hover:border-accent hover:bg-accent/5"
                >
                  <span className="text-sm font-semibold text-ink">
                    {variant.name}
                  </span>
                  <span className="font-mono text-[13px] font-bold tabular-nums text-accent">
                    {formatCurrency(product.price + variant.price_modifier)}
                  </span>
                </button>
              ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
