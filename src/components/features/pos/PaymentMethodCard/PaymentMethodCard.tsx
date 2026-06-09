'use client';

import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentMethodCardProps } from './types';

export function PaymentMethodCard({
  icon: Icon,
  label,
  sublabel,
  active,
  locked,
  onSelect,
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={locked}
      className={cn(
        'relative flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 text-center transition-colors',
        active
          ? 'border-accent bg-accent/10'
          : 'border-hairline bg-surface-1 hover:bg-canvas',
        locked && 'cursor-not-allowed opacity-60 hover:bg-surface-1'
      )}
    >
      {locked && (
        <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent">
          <Lock className="size-2.5" strokeWidth={2.5} />
          Pro
        </span>
      )}
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-xl',
          active ? 'bg-accent text-surface-1' : 'bg-surface-2 text-ink-muted'
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[13.5px] font-semibold text-ink">{label}</span>
        <span className="text-[11.5px] text-ink-muted">{sublabel}</span>
      </span>
    </button>
  );
}
