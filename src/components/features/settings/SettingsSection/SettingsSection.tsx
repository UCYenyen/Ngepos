import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  danger?: boolean;
  children: ReactNode;
}

export function SettingsSection({
  icon: Icon,
  title,
  description,
  danger,
  children,
}: SettingsSectionProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-surface-1',
        danger ? 'border-error-light' : 'border-hairline'
      )}
    >
      <div className="flex items-center gap-3 border-b border-hairline-soft px-5 py-4">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            danger ? 'bg-error-light text-error' : 'bg-surface-2 text-ink-muted'
          )}
        >
          <Icon className="size-4.5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold text-ink">{title}</span>
          {description && (
            <span className="text-[12.5px] text-ink-muted">{description}</span>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
