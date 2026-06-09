'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Table } from '@/types/pos';

export interface TableFormValues {
  name: string;
  capacity: number | null;
}

interface TableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  saving: boolean;
  onSubmit: (values: TableFormValues) => void;
}

const INPUT_CLASS =
  'h-10 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

export function TableFormDialog({
  open,
  onOpenChange,
  table,
  saving,
  onSubmit,
}: TableFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-100">
        <DialogHeader>
          <DialogTitle>{table ? 'Edit meja' : 'Tambah meja'}</DialogTitle>
        </DialogHeader>
        <TableForm
          key={table?.id ?? 'new'}
          table={table}
          saving={saving}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}

interface TableFormProps {
  table: Table | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (values: TableFormValues) => void;
}

function TableForm({ table, saving, onCancel, onSubmit }: TableFormProps) {
  const [name, setName] = useState(table?.name ?? '');
  const [capacity, setCapacity] = useState<number | ''>(table?.capacity ?? '');

  const valid = name.trim().length > 0;

  function handleSubmit() {
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      capacity: capacity === '' ? null : Number(capacity),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink">Nama meja</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="mis. Meja 04"
          className={INPUT_CLASS}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink">
          Kapasitas{' '}
          <span className="text-ink-tertiary">(opsional)</span>
        </span>
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={capacity}
          onChange={(event) =>
            setCapacity(
              event.target.value === '' ? '' : Number(event.target.value)
            )
          }
          placeholder="mis. 4"
          className={`${INPUT_CLASS} font-mono`}
        />
      </label>
      <div className="mt-1 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Batal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!valid || saving}
          className="btn-accent disabled:opacity-50"
        >
          {saving ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}
