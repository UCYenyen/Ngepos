import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  name: string;
  color?: string;
  className?: string;
}

export function CategoryBadge({ name, color, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink',
        className
      )}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: color ?? 'var(--ink-tertiary)' }}
      />
      {name}
    </span>
  );
}
