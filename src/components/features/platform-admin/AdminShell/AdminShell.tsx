'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Wordmark } from '@/components/layout/Wordmark/Wordmark';
import { ThemeToggle } from '@/components/layout/ThemeToggle/ThemeToggle';
import { supabaseClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: AdminNavItem[] = [
  { label: 'Dasbor', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Bisnis', href: '/admin/businesses', icon: Building2 },
  { label: 'Pengguna', href: '/admin/users', icon: Users },
  { label: 'Langganan', href: '/admin/subscriptions', icon: CreditCard },
  { label: 'Pembayaran', href: '/admin/payments', icon: Receipt },
  { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-canvas">
      <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-hairline bg-surface-1">
        <div className="flex items-center gap-2.5 border-b border-hairline-soft px-5 py-4">
          <Wordmark size={18} />
          <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
            Admin
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <div key={item.href} className="relative">
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-full bg-accent" />
                )}
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors',
                    active
                      ? 'bg-surface-2 font-semibold text-ink'
                      : 'font-medium text-ink-muted hover:bg-canvas-dark hover:text-ink'
                  )}
                >
                  <Icon
                    className="size-4.5 shrink-0"
                    strokeWidth={active ? 2 : 1.75}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="flex flex-col gap-1 border-t border-hairline-soft p-2.5">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-canvas-dark hover:text-ink"
          >
            <LogOut className="size-4.5 shrink-0" strokeWidth={1.75} />
            Keluar
          </button>
        </div>
      </aside>

      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
