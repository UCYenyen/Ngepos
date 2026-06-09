import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import { InitialAvatar } from '@/components/common/InitialAvatar/InitialAvatar';
import { getAvatarTint } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/business';
import type { BusinessCardProps } from './types';

const ROLE_LABEL: Record<UserRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  cashier: 'Cashier',
};

export function BusinessCard({
  id,
  name,
  type,
  role,
  memberCount,
}: BusinessCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-5">
      <div className="flex items-start justify-between">
        <InitialAvatar
          name={name}
          size={48}
          tint={getAvatarTint(id)}
          className="text-lg"
        />
        <span
          className={cn(
            'badge',
            role === 'owner' && 'bg-ink text-surface-1'
          )}
        >
          {ROLE_LABEL[role]}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-[17px] font-semibold text-ink">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="badge">{type === 'fnb' ? 'F&B' : 'Retail'}</span>
          {typeof memberCount === 'number' && (
            <span className="flex items-center gap-1 text-[13px] text-ink-muted">
              <Users className="size-3.5" />
              {memberCount} anggota
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-hairline-soft" />

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="size-1.5 rounded-full bg-success" />
          Aktif
        </span>
        <Link
          href={`/${id}/pos`}
          className="inline-flex items-center gap-1.5 rounded-md border border-hairline bg-surface-1 px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
        >
          Buka
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
