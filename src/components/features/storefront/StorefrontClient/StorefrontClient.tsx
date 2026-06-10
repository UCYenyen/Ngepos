'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, Minus, Plus, ShoppingBag, Store } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/format';
import { placeOrder } from '@/app/store/[subdomain]/actions';
import type { ProductVariant } from '@/types/product';
import type { CartLine, StorefrontClientProps } from './types';

const INPUT_CLASS =
  'h-11 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

function lineKey(productId: string, variantId: string | null): string {
  return `${productId}:${variantId ?? ''}`;
}

export function StorefrontClient({
  subdomain,
  business,
  categories,
  products,
  variants,
}: StorefrontClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [variantPicker, setVariantPicker] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', note: '' });

  const variantsByProduct = new Map<string, ProductVariant[]>();
  for (const variant of variants) {
    const list = variantsByProduct.get(variant.product_id) ?? [];
    list.push(variant);
    variantsByProduct.set(variant.product_id, list);
  }

  const visibleProducts = activeCategory
    ? products.filter((product) => product.category_id === activeCategory)
    : products;

  const cartLines = Object.values(cart);
  const itemCount = cartLines.reduce((sum, line) => sum + line.qty, 0);
  const total = cartLines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);

  function addLine(productId: string, variant: ProductVariant | null) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const key = lineKey(productId, variant?.id ?? null);
    const unitPrice = Number(product.price) + Number(variant?.price_modifier ?? 0);

    setCart((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          key,
          product,
          variant,
          unitPrice,
          qty: (existing?.qty ?? 0) + 1,
        },
      };
    });
  }

  function changeQty(key: string, delta: number) {
    setCart((prev) => {
      const line = prev[key];
      if (!line) return prev;
      const qty = line.qty + delta;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { ...line, qty } };
    });
  }

  function onAddClick(productId: string) {
    const productVariants = variantsByProduct.get(productId);
    if (productVariants && productVariants.length > 0) {
      setVariantPicker(productId);
      return;
    }
    addLine(productId, null);
  }

  async function handleSubmit() {
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await placeOrder(subdomain, {
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        note: form.note || undefined,
        items: cartLines.map((line) => ({
          product_id: line.product.id,
          variant_id: line.variant?.id ?? null,
          qty: line.qty,
        })),
      });
      if (!result.success) {
        setFormError(result.error ?? 'Gagal mengirim pesanan');
        return;
      }
      setPlacedOrderId(result.orderId ?? null);
      setCheckoutOpen(false);
      setCart({});
    } finally {
      setSubmitting(false);
    }
  }

  if (placedOrderId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
        <CheckCircle2 className="size-14 text-success" />
        <h1 className="mt-4 text-2xl font-semibold text-ink">Pesanan terkirim!</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Terima kasih, {form.name || 'pelanggan'}. {business.name} akan segera
          menghubungi kamu untuk konfirmasi.
        </p>
        <p className="mt-1 text-xs text-ink-subtle">
          Nomor pesanan: {placedOrderId.slice(0, 8).toUpperCase()}
        </p>
        <button
          type="button"
          onClick={() => {
            setPlacedOrderId(null);
            setForm({ name: '', phone: '', email: '', note: '' });
          }}
          className="btn-secondary mt-6"
        >
          Pesan lagi
        </button>
      </main>
    );
  }

  const pickerVariants = variantPicker
    ? variantsByProduct.get(variantPicker) ?? []
    : [];
  const pickerProduct = variantPicker
    ? products.find((item) => item.id === variantPicker)
    : null;

  return (
    <main className="min-h-screen bg-canvas pb-28">
      <header className="border-b border-hairline bg-surface-1">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-5">
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
            {business.logo_url ? (
              <Image
                src={business.logo_url}
                alt={business.name}
                width={48}
                height={48}
                className="size-full object-cover"
              />
            ) : (
              <Store className="size-5 text-ink-muted" />
            )}
          </span>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-ink">{business.name}</h1>
            <span className="text-[12.5px] text-ink-muted">
              Pesan online — tanpa perlu login
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5">
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-4">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-ink text-surface-1'
                  : 'bg-surface-2 text-ink-muted hover:text-ink'
              }`}
            >
              Semua
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-ink text-surface-1'
                    : 'bg-surface-2 text-ink-muted hover:text-ink'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {visibleProducts.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-muted">
            Belum ada menu yang tersedia.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 py-2 sm:grid-cols-3">
            {visibleProducts.map((product) => {
              const hasVariants =
                (variantsByProduct.get(product.id)?.length ?? 0) > 0;
              return (
                <li
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface-1"
                >
                  <div className="relative aspect-square bg-surface-2">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-ink-subtle">
                        <ShoppingBag className="size-7" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <span className="line-clamp-2 text-[13.5px] font-medium text-ink">
                      {product.name}
                    </span>
                    <span className="text-[13px] text-ink-muted">
                      {hasVariants ? 'Mulai ' : ''}
                      {formatCurrency(Number(product.price))}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAddClick(product.id)}
                      className="btn-primary mt-2 h-9 w-full text-[13px]"
                    >
                      Tambah
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-hairline bg-surface-1">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
            <div className="flex flex-col">
              <span className="text-[12px] text-ink-muted">{itemCount} item</span>
              <span className="text-base font-semibold text-ink">
                {formatCurrency(total)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="btn-primary gap-2"
            >
              <ShoppingBag className="size-4" />
              Lihat pesanan
            </button>
          </div>
        </div>
      )}

      <Dialog open={variantPicker !== null} onOpenChange={() => setVariantPicker(null)}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>{pickerProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {pickerVariants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  addLine(variant.product_id, variant);
                  setVariantPicker(null);
                }}
                className="flex items-center justify-between rounded-lg border border-hairline px-4 py-3 text-left transition-colors hover:border-ink-subtle"
              >
                <span className="text-sm font-medium text-ink">{variant.name}</span>
                <span className="text-[13px] text-ink-muted">
                  {formatCurrency(
                    Number(pickerProduct?.price ?? 0) + Number(variant.price_modifier)
                  )}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Konfirmasi pesanan</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2.5">
            {cartLines.map((line) => (
              <div key={line.key} className="flex items-center gap-3">
                <div className="flex flex-1 flex-col">
                  <span className="text-[13.5px] font-medium text-ink">
                    {line.product.name}
                    {line.variant ? ` · ${line.variant.name}` : ''}
                  </span>
                  <span className="text-[12px] text-ink-muted">
                    {formatCurrency(line.unitPrice)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeQty(line.key, -1)}
                    className="flex size-7 items-center justify-center rounded-md border border-hairline text-ink-muted hover:text-ink"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-medium text-ink">
                    {line.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQty(line.key, 1)}
                    className="flex size-7 items-center justify-center rounded-md border border-hairline text-ink-muted hover:text-ink"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-hairline-soft pt-3 text-sm">
            <span className="font-medium text-ink">Total</span>
            <span className="font-semibold text-ink">{formatCurrency(total)}</span>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <input
              value={form.name}
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
              placeholder="Nama lengkap"
              className={INPUT_CLASS}
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))}
              placeholder="Nomor telepon (WhatsApp)"
              inputMode="tel"
              className={INPUT_CLASS}
            />
            <input
              value={form.email}
              onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
              placeholder="Email"
              inputMode="email"
              className={INPUT_CLASS}
            />
            <textarea
              value={form.note}
              onChange={(event) => setForm((f) => ({ ...f, note: event.target.value }))}
              placeholder="Catatan (opsional)"
              rows={2}
              className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {formError && <p className="text-[13px] text-error">{formError}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || cartLines.length === 0}
            className="btn-primary h-11 w-full disabled:opacity-50"
          >
            {submitting ? 'Mengirim…' : `Kirim pesanan · ${formatCurrency(total)}`}
          </button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
