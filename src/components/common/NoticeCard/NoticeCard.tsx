import { cn } from '@/lib/utils';
import type { NoticeCardProps } from './types';

export function NoticeCard({ title, description, className }: NoticeCardProps) {
  return (
    <div className={cn('card max-w-2xl', className)}>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-ink-muted">{description}</p>
    </div>
  );
}
