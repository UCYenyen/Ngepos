'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PackagePlus, PackageX, SlidersHorizontal } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/inventory';

type AdjustmentType = 'restock' | 'adjustment' | 'damage';

interface StockAdjustmentProps {
  businessId: string;
  product: InventoryProduct;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const TYPES = [
  {
    value: 'restock' as const,
    label: 'Restock',
    description: 'Tambah stok masuk (positif)',
    icon: PackagePlus,
  },
  {
    value: 'adjustment' as const,
    label: 'Penyesuaian',
    description: 'Koreksi salah hitung (boleh ±)',
    icon: SlidersHorizontal,
  },
  {
    value: 'damage' as const,
    label: 'Rusak',
    description: 'Keluarkan barang rusak/hilang (negatif)',
    icon: PackageX,
  },
];

const INPUT_CLASS =
  'h-10 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

export function StockAdjustment({
  businessId,
  product,
  open,
  onOpenChange,
  onComplete,
}: StockAdjustmentProps) {
  const [type, setType] = useState<AdjustmentType>('restock');
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const quantityNum = quantity ? parseInt(quantity, 10) : 0;
  const baseStock = product.has_variants
    ? (product.variants.find((variant) => variant.id === variantId)?.stock_qty ??
      0)
    : product.current_stock;
  const resulting = baseStock + quantityNum;
  const willGoNegative = resulting < 0;
  const noteRequired = type === 'damage' || type === 'adjustment';

  const valid =
    quantityNum !== 0 &&
    !(type === 'restock' && quantityNum < 0) &&
    !(type === 'damage' && quantityNum > 0) &&
    !(noteRequired && !note.trim()) &&
    !willGoNegative;

  async function handleSubmit() {
    if (!valid) return;
    setLoading(true);
    try {
      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          productId: product.id,
          variantId: product.has_variants ? variantId : undefined,
          type,
          quantity_change: quantityNum,
          note: note.trim() || null,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal menyesuaikan stok');
      }
      toast.success('Stok berhasil disesuaikan');
      onComplete();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menyesuaikan stok'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-115">
        <DialogHeader>
          <DialogTitle>Sesuaikan stok · {product.name}</DialogTitle>
          <DialogDescription>
            Stok saat ini: {baseStock} unit
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {product.has_variants && product.variants.length > 0 && (
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink">Varian</span>
              <select
                value={variantId}
                onChange={(event) => setVariantId(event.target.value)}
                className={INPUT_CLASS}
              >
                {product.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name} · stok {variant.stock_qty}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="flex flex-col gap-2">
            {TYPES.map((option) => {
              const Icon = option.icon;
              const active = type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-accent bg-accent/10'
                      : 'border-hairline bg-surface-1 hover:bg-canvas'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-9 items-center justify-center rounded-lg',
                      active
                        ? 'bg-accent text-surface-1'
                        : 'bg-surface-2 text-ink-muted'
                    )}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[13.5px] font-semibold text-ink">
                      {option.label}
                    </span>
                    <span className="text-[12px] text-ink-muted">
                      {option.description}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'ml-auto size-4 rounded-full border-2',
                      active ? 'border-accent bg-accent' : 'border-hairline'
                    )}
                  />
                </button>
              );
            })}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink">
              Jumlah perubahan
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder={type === 'damage' ? '-5' : type === 'restock' ? '10' : '±'}
              className={cn(
                `${INPUT_CLASS} font-mono`,
                willGoNegative && 'border-error focus:ring-error'
              )}
            />
            {willGoNegative && (
              <span className="text-[12px] text-error">
                Penyesuaian ini membuat stok jadi negatif ({resulting}).
              </span>
            )}
            {!willGoNegative && quantityNum !== 0 && (
              <span className="text-[12px] text-ink-muted">
                Stok menjadi{' '}
                <span className="font-mono font-semibold text-ink">
                  {resulting}
                </span>{' '}
                unit
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink">
              Alasan{' '}
              {noteRequired ? (
                <span className="text-error">*</span>
              ) : (
                <span className="text-ink-tertiary">(opsional)</span>
              )}
            </span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="mis. kiriman supplier, barang kedaluwarsa, audit…"
              className={INPUT_CLASS}
            />
          </label>

          <div className="mt-1 flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!valid || loading}
              className="btn-accent flex-1 disabled:opacity-50"
            >
              {loading ? 'Menyimpan…' : 'Sesuaikan stok'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
