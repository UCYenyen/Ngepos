'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InitialAvatar } from '@/components/common/InitialAvatar/InitialAvatar';
import { getAvatarTint } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BusinessSwitcherProps, SwitcherBusiness } from './types';

function typeLabel(type: SwitcherBusiness['type']): string {
  return type === 'fnb' ? 'F&B' : 'Retail';
}

export function BusinessSwitcher({ current, businesses }: BusinessSwitcherProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex w-full items-center justify-between gap-2 rounded-lg border border-hairline bg-surface-1 p-2 text-left transition-colors hover:bg-canvas">
        <span className="flex min-w-0 items-center gap-2.5">
          <InitialAvatar name={current.name} size={32} tint={getAvatarTint(current.id)} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-ink">
              {current.name}
            </span>
            <span className="mt-0.5 w-fit rounded-full bg-canvas px-1.5 py-px text-[10px] font-medium text-ink-muted">
              {typeLabel(current.type)}
            </span>
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-ink-subtle" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[232px] gap-0.5 p-1.5"
      >
        <p className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
          Bisnismu
        </p>
        {businesses.map((business) => {
          const active = business.id === current.id;
          return (
            <button
              key={business.id}
              type="button"
              onClick={() => go(`/dashboard/${business.id}/pos`)}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-surface-2',
                active && 'bg-surface-2'
              )}
            >
              <InitialAvatar
                name={business.name}
                size={30}
                tint={getAvatarTint(business.id)}
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-semibold text-ink">
                  {business.name}
                </span>
                <span className="text-[11px] text-ink-muted">
                  {typeLabel(business.type)}
                </span>
              </span>
              {active && <Check className="size-4 shrink-0 text-accent" />}
            </button>
          );
        })}
        <div className="my-1 border-t border-hairline-soft" />
        <button
          type="button"
          onClick={() => go('/onboarding')}
          className="flex w-full items-center gap-2.5 rounded-md p-2 text-left text-accent transition-colors hover:bg-surface-2"
        >
          <span className="flex size-[30px] items-center justify-center rounded-lg bg-accent/10">
            <Plus className="size-4" />
          </span>
          <span className="text-[13px] font-semibold">Buat bisnis baru</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
