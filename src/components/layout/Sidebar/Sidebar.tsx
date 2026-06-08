'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Boxes,
  FileText,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SidebarProps } from './types';

const ICONS: Record<string, LucideIcon> = {
  pos: ShoppingCart,
  inventory: Boxes,
  staff: Users,
  analytics: BarChart3,
  reports: FileText,
  settings: Settings,
};

export function Sidebar({ businessName, items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex h-screen w-64 flex-col gap-2 border-r border-hairline bg-surface-1 p-4">
      <div className="px-3 py-2 text-lg font-semibold text-ink">{businessName}</div>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const Icon = ICONS[item.key];
          const isActive = pathname === item.href;

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface-2 text-ink'
                    : 'text-ink-muted hover:bg-canvas-dark hover:text-ink'
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
