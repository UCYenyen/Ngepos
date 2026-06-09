'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Package, Plus, RefreshCw, Search } from 'lucide-react';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductsTable } from '../ProductsTable/ProductsTable';
import { ProductSheet } from '../ProductSheet/ProductSheet';
import { CategoryManager } from '../CategoryManager/CategoryManager';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types/product';
import type { ProductFormValues } from '../ProductSheet/types';

interface ProductsClientProps {
  businessId: string;
  maxProducts: number;
}

type Status = 'loading' | 'error' | 'ready';
type Tab = 'produk' | 'kategori';

interface DeleteTarget {
  kind: 'product' | 'category';
  id: string;
  name: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function fetchCatalog(
  businessId: string
): Promise<{ products: Product[]; categories: Category[] }> {
  const [productsRes, categoriesRes] = await Promise.all([
    fetch(`/api/products?businessId=${businessId}`),
    fetch(`/api/categories?businessId=${businessId}`),
  ]);
  if (!productsRes.ok || !categoriesRes.ok) {
    throw new Error('fetch failed');
  }
  const [products, categories] = await Promise.all([
    productsRes.json(),
    categoriesRes.json(),
  ]);
  return { products, categories };
}

export function ProductsClient({ businessId, maxProducts }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [tab, setTab] = useState<Tab>('produk');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryBusy, setCategoryBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setStatus('loading');
      try {
        const data = await fetchCatalog(businessId);
        if (!alive) return;
        setProducts(data.products);
        setCategories(data.categories);
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
      const data = await fetchCatalog(businessId);
      setProducts(data.products);
      setCategories(data.categories);
      setStatus('ready');
    } catch {
      toast.error('Gagal memuat ulang katalog');
    }
  }

  const atLimit = Number.isFinite(maxProducts) && products.length >= maxProducts;

  function openCreate() {
    setEditingProduct(null);
    setSheetOpen(true);
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setSheetOpen(true);
  }

  async function handleProductSubmit(values: ProductFormValues) {
    setSaving(true);
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ businessId, ...values }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal menyimpan produk');
      }
      toast.success(editingProduct ? 'Produk diperbarui' : 'Produk ditambahkan');
      setSheetOpen(false);
      setEditingProduct(null);
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menyimpan produk'
      );
    } finally {
      setSaving(false);
    }
  }

  async function createCategory(name: string, color: string) {
    setCategoryBusy(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: JSON_HEADERS,
        body: JSON.stringify({ businessId, name, color }),
      });
      if (!response.ok) throw new Error();
      await refetch();
    } catch {
      toast.error('Gagal menambah kategori');
    } finally {
      setCategoryBusy(false);
    }
  }

  async function updateCategory(id: string, name: string, color: string) {
    setCategoryBusy(true);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({ name, color }),
      });
      if (!response.ok) throw new Error();
      await refetch();
    } catch {
      toast.error('Gagal memperbarui kategori');
    } finally {
      setCategoryBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const url =
        deleteTarget.kind === 'category'
          ? `/api/categories/${deleteTarget.id}`
          : `/api/products/${deleteTarget.id}`;
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal menghapus');
      }
      toast.success(
        deleteTarget.kind === 'category' ? 'Kategori dihapus' : 'Produk dihapus'
      );
      setDeleteTarget(null);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  }

  const query = search.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesQuery =
      !query ||
      product.name.toLowerCase().includes(query) ||
      (product.sku?.toLowerCase().includes(query) ?? false);
    const matchesCategory =
      !categoryFilter || product.category_id === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  const counterLabel = Number.isFinite(maxProducts)
    ? `${products.length} / ${maxProducts} produk`
    : `${products.length} produk`;

  const action = (
    <div className="flex items-center gap-3">
      <span className="inline-flex h-8 items-center rounded-full bg-surface-2 px-3 text-[13px] font-medium text-ink-muted">
        {counterLabel}
      </span>
      {atLimit ? (
        <Tooltip>
          <TooltipTrigger render={<span className="inline-flex" />}>
            <button
              type="button"
              disabled
              className="btn-accent cursor-not-allowed gap-2 opacity-50"
            >
              <Plus className="size-4.5" />
              Tambah produk
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Batas produk paketmu tercapai. Upgrade untuk menambah lebih banyak.
          </TooltipContent>
        </Tooltip>
      ) : (
        <button type="button" onClick={openCreate} className="btn-accent gap-2">
          <Plus className="size-4.5" />
          Tambah produk
        </button>
      )}
    </div>
  );

  return (
    <PageShell
      title="Produk"
      subtitle="Kelola katalog, kategori, dan varian produkmu."
      action={action}
    >
      <div className="mb-4.5 flex gap-1 border-b border-hairline">
        {(['produk', 'kategori'] as Tab[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              '-mb-px border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors',
              tab === value
                ? 'border-accent text-ink'
                : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            {value === 'produk' ? 'Produk' : 'Kategori'}
          </button>
        ))}
      </div>

      {tab === 'produk' && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-subtle" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari produk atau SKU…"
                className="h-10 w-full rounded-md border border-hairline bg-surface-1 pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter kategori"
              className="h-10 rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Semua kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {status === 'loading' && <TableSkeleton />}
          {status === 'error' && <ErrorBox onRetry={refetch} />}
          {status === 'ready' && products.length === 0 && (
            <EmptyState onCreate={openCreate} />
          )}
          {status === 'ready' && products.length > 0 && filtered.length === 0 && (
            <p className="rounded-xl border border-hairline bg-surface-1 px-5 py-8 text-center text-sm text-ink-muted">
              Tidak ada produk yang cocok.
            </p>
          )}
          {status === 'ready' && filtered.length > 0 && (
            <ProductsTable
              products={filtered}
              categories={categories}
              onEdit={openEdit}
              onDelete={(product) =>
                setDeleteTarget({
                  kind: 'product',
                  id: product.id,
                  name: product.name,
                })
              }
            />
          )}
        </>
      )}

      {tab === 'kategori' && (
        <>
          {status === 'loading' && (
            <div className="max-w-xl">
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          )}
          {status === 'error' && <ErrorBox onRetry={refetch} />}
          {status === 'ready' && (
            <CategoryManager
              categories={categories}
              products={products}
              busy={categoryBusy}
              onCreate={createCategory}
              onUpdate={updateCategory}
              onDelete={(category) =>
                setDeleteTarget({
                  kind: 'category',
                  id: category.id,
                  name: category.name,
                })
              }
            />
          )}
        </>
      )}

      <ProductSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        product={editingProduct}
        categories={categories}
        saving={saving}
        onSubmit={handleProductSubmit}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>
              {deleteTarget?.kind === 'category'
                ? 'Hapus kategori?'
                : 'Hapus produk?'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-muted">
            {deleteTarget?.kind === 'category'
              ? `Kategori "${deleteTarget?.name}" akan dihapus. Produk di dalamnya menjadi tanpa kategori.`
              : `Produk "${deleteTarget?.name}" akan dihapus permanen.`}
          </p>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="btn-secondary"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-md bg-error px-6 py-2.5 font-medium text-surface-1 transition-colors hover:bg-error/90 disabled:opacity-50"
            >
              {deleting ? 'Menghapus…' : 'Hapus'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-1">
      <div className="flex flex-col">
        {['a', 'b', 'c', 'd', 'e'].map((key) => (
          <div
            key={key}
            className="flex items-center gap-4 border-t border-hairline-soft px-4 py-3 first:border-t-0"
          >
            <Skeleton className="size-9 rounded-md" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface-1 px-5 py-12 text-center">
      <p className="text-sm text-ink-muted">Gagal memuat katalog.</p>
      <button type="button" onClick={onRetry} className="btn-secondary gap-2">
        <RefreshCw className="size-4" />
        Coba lagi
      </button>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-hairline px-5 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-subtle">
        <Package className="size-6" />
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="text-base font-semibold text-ink">Belum ada produk</p>
        <p className="text-[13px] text-ink-muted">
          Tambahkan produk pertamamu untuk mulai berjualan.
        </p>
      </div>
      <button type="button" onClick={onCreate} className="btn-accent gap-2">
        <Plus className="size-4.5" />
        Tambah produk
      </button>
    </div>
  );
}
