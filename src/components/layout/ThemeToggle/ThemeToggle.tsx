'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Terang' },
  { value: 'dark', icon: Moon, label: 'Gelap' },
  { value: 'system', icon: Monitor, label: 'Sistem' },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const current = theme ?? 'system';

  return (
    <div className="flex items-center gap-1 rounded-lg bg-canvas p-1">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = current === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            aria-pressed={active}
            onClick={() => setTheme(option.value)}
            className={cn(
              'flex flex-1 items-center justify-center rounded-md py-1.5 transition-colors',
              active ? 'bg-surface-1 text-ink' : 'text-ink-muted hover:text-ink'
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
