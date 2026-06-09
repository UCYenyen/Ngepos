'use client';

import { useState } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types/product';

const DEFAULT_COLOR = '#ff5600';

interface CategoryManagerProps {
  categories: Category[];
  products: Product[];
  busy: boolean;
  onCreate: (name: string, color: string) => void;
  onUpdate: (id: string, name: string, color: string) => void;
  onDelete: (category: Category) => void;
}

export function CategoryManager({
  categories,
  products,
  busy,
  onCreate,
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(DEFAULT_COLOR);

  const countFor = (id: string): number =>
    products.filter((product) => product.category_id === id).length;

  function startEdit(category: Category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditColor(category.color || DEFAULT_COLOR);
  }

  function saveEdit() {
    if (editingId && editName.trim()) {
      onUpdate(editingId, editName.trim(), editColor);
      setEditingId(null);
    }
  }

  function handleCreate() {
    if (newName.trim()) {
      onCreate(newName.trim(), newColor);
      setNewName('');
      setNewColor(DEFAULT_COLOR);
    }
  }

  return (
    <div className="max-w-xl overflow-hidden rounded-xl border border-hairline bg-surface-1">
      {categories.length === 0 && (
        <p className="px-4.5 py-5 text-sm text-ink-muted">
          Belum ada kategori. Tambah kategori pertama di bawah.
        </p>
      )}

      {categories.map((category, index) => {
        const editing = editingId === category.id;
        return (
          <div
            key={category.id}
            className={cn(
              'flex items-center gap-3 px-4.5 py-3.5',
              index > 0 && 'border-t border-hairline-soft'
            )}
          >
            {editing ? (
              <>
                <ColorSwatchInput value={editColor} onChange={setEditColor} />
                <input
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="h-9 flex-1 rounded-md border border-hairline bg-surface-1 px-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  type="button"
                  onClick={saveEdit}
                  aria-label="Simpan"
                  className="btn-icon size-8 text-success"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  aria-label="Batal"
                  className="btn-icon size-8 text-ink-subtle"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <>
                <span
                  className="size-3.5 shrink-0 rounded-sm"
                  style={{ background: category.color || 'var(--ink-tertiary)' }}
                />
                <span className="text-sm font-semibold text-ink">
                  {category.name}
                </span>
                <span className="text-[13px] text-ink-muted">
                  {countFor(category.id)} produk
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(category)}
                    aria-label="Edit kategori"
                    className="btn-icon size-8 text-ink-subtle hover:text-ink"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category)}
                    aria-label="Hapus kategori"
                    className="btn-icon size-8 text-ink-subtle hover:text-error"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })}

      <div
        className={cn(
          'flex items-center gap-3 px-4.5 py-3',
          categories.length > 0 && 'border-t border-hairline-soft'
        )}
      >
        <ColorSwatchInput value={newColor} onChange={setNewColor} />
        <input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleCreate();
          }}
          placeholder="Tambah kategori baru…"
          className="h-9 flex-1 rounded-md border border-hairline bg-surface-1 px-2.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={!newName.trim() || busy}
          className="btn-secondary h-9 px-4 disabled:opacity-50"
        >
          Tambah
        </button>
      </div>
    </div>
  );
}

function ColorSwatchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label
      className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-hairline"
      style={{ background: value }}
    >
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Warna kategori"
      />
    </label>
  );
}
