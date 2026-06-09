'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, RefreshCw, Search } from 'lucide-react';
import { ProductCard } from '../ProductCard/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types/product';

interface ProductSelectorProps {
  businessId: string;
  onSelectProduct: (product: Product) => void;
}

type Status = 'loading' | 'error' | 'ready';

export function ProductSelector({
  businessId,
  onSelectProduct,
}: ProductSelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let alive = true;
    async function fetchData() {
      setStatus('loading');
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch(`/api/categories?businessId=${businessId}`),
          fetch(`/api/products?businessId=${businessId}`),
        ]);
        if (!categoriesRes.ok || !productsRes.ok) {
          throw new Error('fetch failed');
        }
        const categoriesData: Category[] = await categoriesRes.json();
        const productsData: Product[] = await productsRes.json();
        if (!alive) return;
        setCategories(categoriesData);
        setProducts(productsData);
        setStatus('ready');
      } catch {
        if (alive) setStatus('error');
      }
    }
    fetchData();
    return () => {
      alive = false;
    };
  }, [businessId]);

  const colorOf = (id?: string): string | undefined =>
    categories.find((category) => category.id === id)?.color;

  const q = query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.category_id === selectedCategory;
    const matchesQuery =
      !q ||
      product.name.toLowerCase().includes(q) ||
      (product.sku?.toLowerCase().includes(q) ?? false);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-canvas">
      <div className="border-b border-hairline-soft px-6 pb-3.5 pt-4">
        <div className="relative mb-3.5">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari produk atau scan barcode…"
            className="h-10 w-full rounded-md border border-hairline bg-surface-1 pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <CategoryChip
            label="Semua"
            active={selectedCategory === null}
            onClick={() => setSelectedCategory(null)}
          />
          {categories.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.name}
              color={category.color}
              active={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
            />
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-5">
        {status === 'loading' && <GridSkeleton />}

        {status === 'error' && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-ink-muted">Gagal memuat produk.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-secondary gap-2"
            >
              <RefreshCw className="size-4" />
              Muat ulang
            </button>
          </div>
        )}

        {status === 'ready' && filtered.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-subtle">
              <Package className="size-6" />
            </span>
            {products.length > 0 ? (
              <p className="text-sm text-ink-muted">
                Tidak ada produk yang cocok dengan pencarian.
              </p>
            ) : (
              <>
                <p className="text-sm font-semibold text-ink">Belum ada produk</p>
                <p className="max-w-xs text-[13px] text-ink-muted">
                  Tambahkan produk dulu untuk mulai bertransaksi.
                </p>
                <Link
                  href={`/dashboard/${businessId}/products`}
                  className="btn-secondary mt-1"
                >
                  Kelola produk
                </Link>
              </>
            )}
          </div>
        )}

        {status === 'ready' && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categoryColor={colorOf(product.category_id)}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CategoryChipProps {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}

function CategoryChip({ label, color, active, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors',
        active
          ? 'border-ink bg-ink text-surface-1'
          : 'border-hairline bg-surface-1 text-ink-muted hover:bg-canvas hover:text-ink'
      )}
    >
      {color && (
        <span
          className="size-2 rounded-full"
          style={{ background: color }}
        />
      )}
      {label}
    </button>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => `skeleton-${index}`).map((key) => (
        <div
          key={key}
          className="flex flex-col gap-2 rounded-media border border-hairline bg-surface-1 p-2.5"
        >
          <Skeleton className="aspect-4/3 w-full rounded-md" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      ))}
    </div>
  );
}
