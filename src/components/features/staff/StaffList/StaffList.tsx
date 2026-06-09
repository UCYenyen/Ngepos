'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, RefreshCw, Trash2, UserPlus, Users } from 'lucide-react';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { InitialAvatar } from '@/components/common/InitialAvatar/InitialAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InviteForm } from '../InviteForm/InviteForm';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { StaffMemberResponse } from '@/types/api';
import type { UserRole } from '@/types/business';

interface StaffListProps {
  businessId: string;
}

type Status = 'loading' | 'error' | 'ready';

const ROLE_LABEL: Record<UserRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  cashier: 'Cashier',
};

const ROLE_ORDER: Record<UserRole, number> = {
  owner: 0,
  manager: 1,
  cashier: 2,
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function fetchStaff(
  businessId: string
): Promise<StaffMemberResponse[]> {
  const response = await fetch(`/api/staff?businessId=${businessId}`);
  if (!response.ok) throw new Error('fetch failed');
  const data = await response.json();
  return data.data?.staff ?? [];
}

export function StaffList({ businessId }: StaffListProps) {
  const [staff, setStaff] = useState<StaffMemberResponse[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleTarget, setRoleTarget] = useState<StaffMemberResponse | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('cashier');
  const [removeTarget, setRemoveTarget] = useState<StaffMemberResponse | null>(
    null
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setStatus('loading');
      try {
        const data = await fetchStaff(businessId);
        if (!alive) return;
        setStaff(data);
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
      setStaff(await fetchStaff(businessId));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }

  function openRoleChange(member: StaffMemberResponse) {
    setRoleTarget(member);
    setNewRole(member.role === 'manager' ? 'manager' : 'cashier');
  }

  async function submitRoleChange() {
    if (!roleTarget) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/staff/${roleTarget.id}`, {
        method: 'PATCH',
        headers: JSON_HEADERS,
        body: JSON.stringify({ businessId, role: newRole }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal mengubah peran');
      }
      toast.success('Peran diperbarui');
      setRoleTarget(null);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah peran');
    } finally {
      setBusy(false);
    }
  }

  async function confirmRemove() {
    if (!removeTarget) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/staff/${removeTarget.id}`, {
        method: 'DELETE',
        headers: JSON_HEADERS,
        body: JSON.stringify({ businessId }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal menghapus staf');
      }
      toast.success('Staf dihapus');
      setRemoveTarget(null);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus staf');
    } finally {
      setBusy(false);
    }
  }

  const sorted = [...staff].sort((a, b) => {
    if (ROLE_ORDER[a.role] !== ROLE_ORDER[b.role]) {
      return ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return (
    <PageShell
      title="Staf"
      subtitle="Kelola tim, peran, dan undangan."
      action={
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="btn-accent gap-2"
        >
          <UserPlus className="size-4.5" />
          Undang staf
        </button>
      }
    >
      {status === 'loading' && <TableSkeleton />}
      {status === 'error' && <ErrorBox onRetry={refetch} />}
      {status === 'ready' && staff.length === 0 && (
        <EmptyState onInvite={() => setInviteOpen(true)} />
      )}

      {status === 'ready' && staff.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-hairline bg-surface-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-2 text-left text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                <th className="px-4 py-2.5">Anggota</th>
                <th className="px-4 py-2.5">Peran</th>
                <th className="px-4 py-2.5">Bergabung</th>
                <th className="w-24 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((member) => (
                <tr
                  key={member.id}
                  className="border-t border-hairline-soft align-middle"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <InitialAvatar name={member.name} size={36} shape="circle" />
                      <div className="flex flex-col">
                        <span className="text-[13.5px] font-semibold text-ink">
                          {member.name}
                        </span>
                        <span className="text-[12px] text-ink-muted">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="px-4 py-3 text-[13px] text-ink-muted">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {member.role === 'owner' ? (
                      <span className="text-[12px] text-ink-tertiary">
                        Pemilik
                      </span>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openRoleChange(member)}
                          aria-label={`Ubah peran ${member.name}`}
                          className="btn-icon size-8 text-ink-subtle hover:text-ink"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(member)}
                          aria-label={`Hapus ${member.name}`}
                          className="btn-icon size-8 text-ink-subtle hover:text-error"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={roleTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRoleTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>Ubah peran · {roleTarget?.name}</DialogTitle>
          </DialogHeader>
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink">Peran baru</span>
            <select
              value={newRole}
              onChange={(event) => setNewRole(event.target.value as UserRole)}
              className="h-10 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </label>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setRoleTarget(null)}
              className="btn-secondary"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={submitRoleChange}
              disabled={busy}
              className="btn-accent disabled:opacity-50"
            >
              {busy ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>Hapus staf?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-ink-muted">
            {`${removeTarget?.name} akan dikeluarkan dari bisnis ini. Tindakan ini tidak bisa dibatalkan.`}
          </p>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setRemoveTarget(null)}
              className="btn-secondary"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirmRemove}
              disabled={busy}
              className="inline-flex items-center justify-center rounded-md bg-error px-6 py-2.5 font-medium text-surface-1 transition-colors hover:bg-error/90 disabled:opacity-50"
            >
              {busy ? 'Menghapus…' : 'Hapus'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <InviteForm
        businessId={businessId}
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvitationSent={() => {
          setInviteOpen(false);
          refetch();
        }}
      />
    </PageShell>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        'badge',
        role === 'owner' ? 'bg-ink text-surface-1' : 'bg-surface-2 text-ink'
      )}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

function EmptyState({ onInvite }: { onInvite: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-hairline px-5 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-2 text-ink-subtle">
        <Users className="size-6" />
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="text-base font-semibold text-ink">Belum ada staf</p>
        <p className="text-[13px] text-ink-muted">
          Undang anggota tim pertamamu untuk mulai berkolaborasi.
        </p>
      </div>
      <button type="button" onClick={onInvite} className="btn-accent gap-2">
        <UserPlus className="size-4.5" />
        Undang staf
      </button>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-hairline bg-surface-1">
      {['a', 'b', 'c', 'd'].map((key) => (
        <div
          key={key}
          className="flex items-center gap-4 border-t border-hairline-soft px-4 py-3.5 first:border-t-0"
        >
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface-1 px-5 py-12 text-center">
      <p className="text-sm text-ink-muted">Gagal memuat staf.</p>
      <button type="button" onClick={onRetry} className="btn-secondary gap-2">
        <RefreshCw className="size-4" />
        Coba lagi
      </button>
    </div>
  );
}
