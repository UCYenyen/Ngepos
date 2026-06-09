'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InitialAvatar } from '@/components/common/InitialAvatar/InitialAvatar';
import { ThemeToggle } from '@/components/layout/ThemeToggle/ThemeToggle';
import { supabaseClient } from '@/lib/supabase';
import type { UserRole } from '@/types/business';
import type { SidebarUserProps } from './types';

const ROLE_LABEL: Record<UserRole, string> = {
  owner: 'Owner',
  manager: 'Manager',
  cashier: 'Cashier',
};

export function SidebarUser({ name, email, role }: SidebarUserProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    await supabaseClient.auth.signOut();
    router.push('/login');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-canvas-dark">
        <InitialAvatar name={name} size={32} shape="circle" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-semibold text-ink">
            {name}
          </span>
          <span className="text-[11px] text-ink-subtle">{ROLE_LABEL[role]}</span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-ink-subtle" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={6}
        className="w-[236px] gap-0 p-1.5"
      >
        <div className="px-2.5 py-2">
          <p className="truncate text-[13px] font-semibold text-ink">{name}</p>
          <p className="truncate text-[11px] text-ink-muted">{email}</p>
        </div>
        <div className="px-1.5 pb-1.5">
          <ThemeToggle />
        </div>
        <div className="my-1 border-t border-hairline-soft" />
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md p-2 text-left text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <LogOut className="size-4" />
          Keluar
        </button>
      </PopoverContent>
    </Popover>
  );
}
