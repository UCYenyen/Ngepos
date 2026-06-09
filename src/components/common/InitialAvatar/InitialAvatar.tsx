import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/format';
import type { InitialAvatarProps } from './types';

export function InitialAvatar({
  name,
  size = 36,
  shape = 'square',
  tint,
  className,
}: InitialAvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center font-semibold leading-none',
        shape === 'square' ? 'rounded-lg' : 'rounded-full',
        tint ? 'text-surface-1' : 'bg-surface-2 text-ink',
        className
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: tint,
      }}
    >
      {getInitials(name)}
    </span>
  );
}
