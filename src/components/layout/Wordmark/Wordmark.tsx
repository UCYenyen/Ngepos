import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WordmarkProps } from './types';

export function Wordmark({ size = 20, className }: WordmarkProps) {
  const box = Math.round(size * 1.3);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-bold tracking-tight text-ink',
        className
      )}
      style={{ fontSize: size }}
    >
      <span
        className="inline-flex items-center justify-center rounded-md bg-accent text-surface-1"
        style={{ width: box, height: box }}
      >
        <Zap size={Math.round(size * 0.7)} className="fill-current" />
      </span>
      Ngepos
    </span>
  );
}
