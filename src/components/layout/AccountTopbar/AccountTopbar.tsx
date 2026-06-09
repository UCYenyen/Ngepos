'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wordmark } from '@/components/layout/Wordmark/Wordmark';
import { ThemeToggle } from '@/components/layout/ThemeToggle/ThemeToggle';
import { InitialAvatar } from '@/components/common/InitialAvatar/InitialAvatar';
import { supabaseClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { AccountTab, AccountTopbarProps } from './types';

const TABS: { id: AccountTab; label: string; href: string }[] = [
  { id: 'dashboard', label: 'Bisnis', href: '/' },
  { id: 'billing', label: 'Billing', href: '/billing' },
];

export function AccountTopbar({ active = 'dashboard' }: AccountTopbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    'Pengguna';
  const email = user?.email ?? '';

  const handleLogout = async () => {
    setOpen(false);
    await supabaseClient.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="flex h-15 shrink-0 items-center justify-between border-b border-hairline bg-surface-1 px-6 md:px-7">
      <div className="flex items-center gap-8">
        <Link href="/" aria-label="Ngepos">
          <Wordmark size={18} />
        </Link>
        <nav className="flex items-center gap-1.5">
          {TABS.map((tab) => {
            const on = tab.id === active;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  on
                    ? 'bg-surface-2 font-semibold text-ink'
                    : 'font-medium text-ink-muted hover:bg-canvas-dark hover:text-ink'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifikasi"
          className="btn-icon text-ink-muted"
        >
          <Bell className="size-4.5" />
        </button>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger className="flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-canvas-dark">
            <InitialAvatar name={name} size={32} shape="circle" />
            <ChevronDown className="size-3.5 text-ink-subtle" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[236px] gap-0 p-1.5"
          >
            <div className="px-2.5 py-2">
              <p className="truncate text-[13px] font-semibold text-ink">
                {name}
              </p>
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
      </div>
    </header>
  );
}
