'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, RefreshCw, UtensilsCrossed } from 'lucide-react';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TableCard } from '../TableCard/TableCard';
import { TableDrawer } from '../TableDrawer/TableDrawer';
import {
  TableFormDialog,
  type TableFormValues,
} from '../TableFormDialog/TableFormDialog';
import { TABLE_STATUSES, TABLE_STATUS_META } from '../tableStatus';
import type { Table, TableStatus } from '@/types/pos';

interface TablesClientProps {
  businessId: string;
  canManage: boolean;
}

type Status = 'loading' | 'error' | 'ready';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function fetchTables(businessId: string): Promise<Table[]> {
  const response = await fetch(`/api/tables?businessId=${businessId}`);
  if (!response.ok) throw new Error('fetch failed');
  return response.json();
}

export function TablesClient({ businessId, canManage }: TablesClientProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [drawerTarget, setDrawerTarget] = useState<Table | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Table | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Table | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setStatus('loading');
      try {
        const data = await fetchTables(businessId);
        if (!alive) return;
        setTables(data);
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
      setTables(await fetchTables(businessId));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(table: Table) {
    setDrawerTarget(null);
    setEditTarget(table);
    setFormOpen(true);
  }

  async function handleSubmit(values: TableFormValues) {
    setSaving(true);
    try {
      const response = await fetch(
        editTarget ? `/api/tables/${editTarget.id}` : '/api/tables',
        {
          method: editTarget ? 'PUT' : 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify(
            editTarget ? values : { businessId, ...values }
          ),
        }
      );
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal menyimpan meja');
      }
      toast.success(editTarget ? 'Meja diperbarui' : 'Meja ditambahkan');
      setFormOpen(false);
      setEditTarget(null);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan meja');
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(table: Table, nextStatus: TableStatus) {
    if (table.status === nextStatus) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/tables/${table.id}`, {
        method: 'PUT',
        headers: JSON_HEADERS,
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error();
      setTables((prev) =>
        prev.map((item) =>
          item.id === table.id ? { ...item, status: nextStatus } : item
        )
      );
      setDrawerTarget((prev) =>
        prev && prev.id === table.id ? { ...prev, status: nextStatus } : prev
      );
    } catch {
      toast.error('Gagal mengubah status meja');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/tables/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal menghapus meja');
      }
      toast.success('Meja dihapus');
      setDeleteTarget(null);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus meja');
    } finally {
      setBusy(false);
    }
  }

  const action = canManage ? (
    <button type="button" onClick={openCreate} className="btn-accent gap-2">
      <Plus className="size-4.5" />
      Tambah meja
    </button>
  ) : undefined;

  return (
    <PageShell
      title="Meja"
      subtitle="Kelola denah meja dan pesanan per meja."
      action={action}
    >
      {status === 'loading' && (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {['a', 'b', 'c', 'd', 'e', 'f'].map((key) => (
            <Skeleton key={key} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface-1 px-5 py-12 text-center">
          <p className="text-sm text-ink-muted">Gagal memuat meja.</p>
          <button
            type="button"
            onClick={refetch}
            className="btn-secondary gap-2"
          >
            <RefreshCw className="size-4" />
            Coba lagi
          </button>
        </div>
      )}

      {status === 'ready' && tables.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-hairline px-5 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-subtle">
            <UtensilsCrossed className="size-6" />
          </span>
          <div className="flex max-w-sm flex-col gap-1.5">
            <p className="text-base font-semibold text-ink">Belum ada meja</p>
            <p className="text-[13px] text-ink-muted">
              Tambahkan meja untuk mulai mengelola denah dan pesanan.
            </p>
          </div>
          {canManage && (
            <button type="button" onClick={openCreate} className="btn-accent gap-2">
              <Plus className="size-4.5" />
              Tambah meja
            </button>
          )}
        </div>
      )}

      {status === 'ready' && tables.length > 0 && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-4">
            {TABLE_STATUSES.map((statusKey) => {
              const meta = TABLE_STATUS_META[statusKey];
              return (
                <span
                  key={statusKey}
                  className="flex items-center gap-1.5 text-[13px] text-ink-muted"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: meta.dot }}
                  />
                  {meta.label}
                </span>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onClick={setDrawerTarget}
              />
            ))}
          </div>
        </div>
      )}

      <TableDrawer
        table={drawerTarget}
        businessId={businessId}
        canManage={canManage}
        busy={busy}
        onOpenChange={(open) => {
          if (!open) setDrawerTarget(null);
        }}
        onStatusChange={changeStatus}
        onEdit={openEdit}
        onDelete={(table) => {
          setDrawerTarget(null);
          setDeleteTarget(table);
        }}
      />

      <TableFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditTarget(null);
        }}
        table={editTarget}
        saving={saving}
        onSubmit={handleSubmit}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>Hapus meja?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-muted">
            {`Meja "${deleteTarget?.name}" akan dihapus permanen.`}
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
              disabled={busy}
              className="inline-flex items-center justify-center rounded-md bg-error px-6 py-2.5 font-medium text-surface-1 transition-colors hover:bg-error/90 disabled:opacity-50"
            >
              {busy ? 'Menghapus…' : 'Hapus'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
