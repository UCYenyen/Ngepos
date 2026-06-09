'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Layers, Pencil, Trash2 } from 'lucide-react';
import { CategoryBadge } from '../CategoryBadge/CategoryBadge';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types/product';

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({
  products,
  categories,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const categoryOf = (id?: string): Category | undefined =>
    categories.find((category) => category.id === id);

  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-1">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-surface-2">
            <Th className="w-13" />
            <Th>Nama</Th>
            <Th>SKU</Th>
            <Th>Kategori</Th>
            <Th className="text-right">Harga</Th>
            <Th>Stok</Th>
            <Th className="w-24" />
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const category = categoryOf(product.category_id);
            const low =
              product.track_stock &&
              product.low_stock_threshold != null &&
              (product.stock_qty ?? 0) <= product.low_stock_threshold;

            return (
              <tr key={product.id} className="border-t border-hairline-soft">
                <Td>
                  <div className="flex size-9 items-center justify-center overflow-hidden rounded-md bg-surface-2">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={36}
                        height={36}
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
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
                  {category ? (
                    <CategoryBadge name={category.name} color={category.color} />
                  ) : (
                    <span className="text-ink-tertiary">—</span>
                  )}
                </Td>
                <Td className="text-right">
                  <span className="font-mono font-semibold tabular-nums text-ink">
                    {formatCurrency(product.price)}
                  </span>
                </Td>
                <Td>
                  {product.track_stock ? (
                    <span
                      className={cn(
                        'font-mono tabular-nums',
                        low ? 'text-error' : 'text-ink'
                      )}
                    >
                      {product.stock_qty ?? 0}
                    </span>
                  ) : (
                    <span className="text-ink-tertiary">—</span>
                  )}
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      aria-label="Edit produk"
                      className="btn-icon size-8 text-ink-subtle hover:text-ink"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      aria-label="Hapus produk"
                      className="btn-icon size-8 text-ink-subtle hover:text-error"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        'px-4 py-3 align-middle text-[13.5px] text-ink',
        className
      )}
    >
      {children}
    </td>
  );
}
