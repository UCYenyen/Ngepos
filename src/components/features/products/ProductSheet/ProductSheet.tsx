'use client';

import { useState, type ChangeEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Package, Upload } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { VariantEditor } from '../VariantEditor/VariantEditor';
import { useAssetUpload } from '@/hooks/business/useAssetUpload';
import type { Category, Product } from '@/types/product';
import type { ProductFormValues, ProductSheetProps } from './types';

const INPUT_CLASS =
  'h-10 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

export function ProductSheet({
  open,
  onOpenChange,
  product,
  categories,
  businessId,
  saving,
  onSubmit,
}: ProductSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <ProductSheetForm
          key={product?.id ?? 'new'}
          product={product}
          categories={categories}
          businessId={businessId}
          saving={saving}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </SheetContent>
    </Sheet>
  );
}

interface ProductSheetFormProps {
  product: Product | null;
  categories: Category[];
  businessId: string;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: ProductFormValues) => void;
}

function ProductSheetForm({
  product,
  categories,
  businessId,
  saving,
  onCancel,
  onSubmit,
}: ProductSheetFormProps) {
  const { uploading, upload } = useAssetUpload();
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.image_url ?? null
  );
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [price, setPrice] = useState(product?.price ?? 0);
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [trackStock, setTrackStock] = useState(product?.track_stock ?? false);
  const [stockQty, setStockQty] = useState(product?.stock_qty ?? 0);
  const [lowThreshold, setLowThreshold] = useState<number | ''>(
    product?.low_stock_threshold ?? ''
  );
  const [hasVariants, setHasVariants] = useState(product?.has_variants ?? false);

  const valid = name.trim().length > 0 && price >= 0;

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const url = await upload(file, businessId, 'product');
    if (!url) {
      toast.error('Gagal mengunggah foto');
      return;
    }
    setImageUrl(url);
  }

  function handleSubmit() {
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      sku: sku.trim(),
      price,
      categoryId: categoryId || null,
      track_stock: trackStock,
      has_variants: hasVariants,
      stock_qty: trackStock ? stockQty : 0,
      low_stock_threshold:
        trackStock && lowThreshold !== '' ? Number(lowThreshold) : null,
      image_url: imageUrl,
    });
  }

  return (
    <>
      <SheetHeader className="border-b border-hairline-soft px-5 py-4">
        <SheetTitle className="text-base font-semibold text-ink">
          {product ? 'Edit produk' : 'Tambah produk'}
        </SheetTitle>
      </SheetHeader>

      <div className="flex-1 overflow-auto px-5 py-5">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink">Foto produk</span>
            <div className="flex items-center gap-3">
              <div className="flex size-18 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Foto produk"
                    width={72}
                    height={72}
                    className="size-full object-cover"
                  />
                ) : (
                  <Package className="size-6 text-ink-subtle" />
                )}
              </div>
              <label className="flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-hairline px-4 py-3.5 text-center transition-colors hover:border-ink-subtle">
                <Upload className="size-4 text-ink-subtle" />
                <span className="text-[12px] text-ink-muted">
                  {uploading ? 'Mengunggah…' : 'Unggah foto (PNG/JPG)'}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <Field label="Nama produk">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="mis. Caffe Latte"
              className={INPUT_CLASS}
            />
          </Field>

          <div className="flex gap-3">
            <Field label="SKU" className="flex-1">
              <input
                value={sku}
                onChange={(event) => setSku(event.target.value)}
                placeholder="KOP-001"
                className={`${INPUT_CLASS} font-mono`}
              />
            </Field>
            <Field label="Harga" className="flex-1">
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={price || ''}
                onChange={(event) => setPrice(Number(event.target.value) || 0)}
                placeholder="0"
                className={`${INPUT_CLASS} font-mono`}
              />
            </Field>
          </div>

          <Field label="Kategori">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Tanpa kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>

          <ToggleRow
            title="Lacak stok"
            description="Kurangi stok otomatis tiap penjualan"
            checked={trackStock}
            onChange={setTrackStock}
          />

          {trackStock && (
            <div className="flex gap-3">
              <Field label="Stok saat ini" className="flex-1">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={stockQty || ''}
                  onChange={(event) =>
                    setStockQty(Number(event.target.value) || 0)
                  }
                  placeholder="0"
                  className={`${INPUT_CLASS} font-mono`}
                />
              </Field>
              <Field label="Batas minimum" className="flex-1">
                <input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={lowThreshold}
                  onChange={(event) =>
                    setLowThreshold(
                      event.target.value === '' ? '' : Number(event.target.value)
                    )
                  }
                  placeholder="—"
                  className={`${INPUT_CLASS} font-mono`}
                />
              </Field>
            </div>
          )}

          <div className="border-t border-hairline-soft" />

          <ToggleRow
            title="Punya varian"
            description="Ukuran, topping, dll."
            checked={hasVariants}
            onChange={setHasVariants}
          />

          {hasVariants &&
            (product ? (
              <VariantEditor productId={product.id} />
            ) : (
              <p className="rounded-lg bg-canvas px-3 py-2.5 text-[12.5px] text-ink-muted">
                Simpan produk dulu, lalu buka kembali produk ini untuk menambah
                varian.
              </p>
            ))}
        </div>
      </div>

      <SheetFooter className="flex-row gap-3 border-t border-hairline-soft px-5 py-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!valid || saving}
          className="btn-accent flex-1 disabled:opacity-50"
        >
          {saving ? 'Menyimpan…' : 'Simpan produk'}
        </button>
      </SheetFooter>
    </>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-[13px] font-medium text-ink">{title}</span>
        <span className="text-[12px] text-ink-muted">{description}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
