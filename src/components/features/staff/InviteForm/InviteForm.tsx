'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { validateEmail } from '@/lib/staff-validation';
import { cn } from '@/lib/utils';

interface InviteFormProps {
  businessId: string;
  onInvitationSent?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type InviteRole = 'manager' | 'cashier';

const ROLES: { value: InviteRole; label: string; summary: string }[] = [
  {
    value: 'manager',
    label: 'Manager',
    summary:
      'Manajer dapat melihat analitik, mengelola produk, dan memproses transaksi.',
  },
  {
    value: 'cashier',
    label: 'Cashier',
    summary: 'Kasir hanya dapat memproses transaksi.',
  },
];

export function InviteForm({
  businessId,
  onInvitationSent,
  open = false,
  onOpenChange,
}: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('cashier');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEmail('');
    setRole('cashier');
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next && !loading) reset();
    onOpenChange?.(next);
  }

  async function handleSubmit() {
    setError(null);

    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }
    if (!validateEmail(email)) {
      setError('Masukkan alamat email yang valid');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, email, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim undangan');
      }

      toast.success(`Undangan dikirim ke ${email}`);
      reset();
      onOpenChange?.(false);
      onInvitationSent?.();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'Gagal mengirim undangan'
      );
    } finally {
      setLoading(false);
    }
  }

  const summary = ROLES.find((option) => option.value === role)?.summary;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-115">
        <DialogHeader>
          <DialogTitle>Undang staf</DialogTitle>
          <DialogDescription>
            Undang anggota baru ke bisnis ini dengan peran tertentu.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {error && (
            <p className="rounded-md bg-error-light px-3 py-2 text-[13px] text-error">
              {error}
            </p>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink">Alamat email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="staff@example.com"
              disabled={loading}
              className="h-10 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-ink">Peran</span>
            <div className="flex gap-2.5">
              {ROLES.map((option) => {
                const active = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={cn(
                      'flex-1 rounded-lg border p-3 text-left transition-colors',
                      active
                        ? 'border-accent bg-accent/10'
                        : 'border-hairline bg-surface-1 hover:bg-canvas'
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-[13.5px] font-semibold text-ink">
                        {option.label}
                      </span>
                      <span
                        className={cn(
                          'size-4 rounded-full border-2',
                          active ? 'border-accent bg-accent' : 'border-hairline'
                        )}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[12px] text-ink-muted">{summary}</p>
          </div>

          <div className="mt-1 flex gap-3">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !email.trim()}
              className="btn-accent flex-1 disabled:opacity-50"
            >
              {loading ? 'Mengirim…' : 'Kirim undangan'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
