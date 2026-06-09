'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Boxes,
  FileText,
  Lock,
  Package,
  Settings,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { BusinessSwitcher } from '@/components/layout/BusinessSwitcher/BusinessSwitcher';
import { SidebarUser } from '@/components/layout/SidebarUser/SidebarUser';
import { cn } from '@/lib/utils';
import type { NavItemKey } from '@/lib/navigation';
import type { SidebarProps } from './types';

const NAV_ICONS: Record<NavItemKey, LucideIcon> = {
  pos: ShoppingCart,
  products: Package,
  inventory: Boxes,
  tables: UtensilsCrossed,
  staff: Users,
  analytics: BarChart3,
  reports: FileText,
  settings: Settings,
};

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
      <Lock className="size-2.5" strokeWidth={2.5} />
      Pro
    </span>
  );
}

export function Sidebar({ current, businesses, items, user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-hairline bg-surface-1">
      <div className="border-b border-hairline-soft p-3">
        <BusinessSwitcher current={current} businesses={businesses} />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
        {items.map((item) => {
          const Icon = NAV_ICONS[item.key];
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <div key={item.key} className="relative">
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
                {item.locked && <ProBadge />}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-hairline-soft p-2.5">
        <SidebarUser name={user.name} email={user.email} role={user.role} />
      </div>
    </aside>
  );
}
