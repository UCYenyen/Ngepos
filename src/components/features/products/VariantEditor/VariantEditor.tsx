'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import type { ProductVariant } from '@/types/product';

const INPUT_CLASS =
  'h-9 rounded-md border border-hairline bg-surface-1 px-2.5 text-[13px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

export function VariantEditor({ productId }: { productId: string }) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [priceModifier, setPriceModifier] = useState<number | ''>('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState<number | ''>('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/products/${productId}/variants`);
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
  }, [productId]);

  async function addVariant() {
    if (!name.trim()) return;
    setAdding(true);
    try {
      const response = await fetch(`/api/products/${productId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          price_modifier: priceModifier === '' ? 0 : Number(priceModifier),
          sku: sku.trim() || null,
          stock_qty: stock === '' ? 0 : Number(stock),
        }),
      });
      if (!response.ok) throw new Error();
      const created = (await response.json()) as ProductVariant;
      setVariants((prev) => [...prev, created]);
      setName('');
      setPriceModifier('');
      setSku('');
      setStock('');
    } catch {
      toast.error('Gagal menambah varian');
    } finally {
      setAdding(false);
    }
  }

  async function removeVariant(id: string) {
    try {
      const response = await fetch(`/api/variants/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setVariants((prev) => prev.filter((variant) => variant.id !== id));
    } catch {
      toast.error('Gagal menghapus varian');
    }
  }

  if (loading) {
    return <p className="text-[12.5px] text-ink-muted">Memuat varian…</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {variants.map((variant) => (
        <div
          key={variant.id}
          className="flex items-center gap-2 rounded-lg border border-hairline bg-surface-1 p-2.5"
        >
          <span className="flex-1 truncate text-[13px] font-semibold text-ink">
            {variant.name}
          </span>
          <span className="font-mono text-[11.5px] text-ink-muted">
            {variant.price_modifier > 0 ? '+' : ''}
            {formatCurrency(variant.price_modifier)}
          </span>
          {variant.sku && (
            <span className="font-mono text-[11px] text-ink-subtle">
              {variant.sku}
            </span>
          )}
          <span className="font-mono text-[11.5px] text-ink-muted">
            {variant.stock_qty} stok
          </span>
          <button
            type="button"
            onClick={() => removeVariant(variant.id)}
            aria-label="Hapus varian"
            className="text-ink-subtle transition-colors hover:text-error"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-hairline p-2.5">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nama (mis. Large)"
          className={`${INPUT_CLASS} min-w-28 flex-1`}
        />
        <input
          type="number"
          inputMode="numeric"
          value={priceModifier}
          onChange={(event) =>
            setPriceModifier(
              event.target.value === '' ? '' : Number(event.target.value)
            )
          }
          placeholder="+harga"
          className={`${INPUT_CLASS} w-20 font-mono`}
        />
        <input
          value={sku}
          onChange={(event) => setSku(event.target.value)}
          placeholder="SKU"
          className={`${INPUT_CLASS} w-24 font-mono`}
        />
        <input
          type="number"
          inputMode="numeric"
          value={stock}
          onChange={(event) =>
            setStock(event.target.value === '' ? '' : Number(event.target.value))
          }
          placeholder="stok"
          className={`${INPUT_CLASS} w-16 font-mono`}
        />
        <button
          type="button"
          onClick={addVariant}
          disabled={!name.trim() || adding}
          className="inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-[13px] font-semibold text-accent disabled:opacity-50"
        >
          <Plus className="size-4" />
          Tambah
        </button>
      </div>
    </div>
  );
}
