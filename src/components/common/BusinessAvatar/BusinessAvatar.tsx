import Image from 'next/image';
import { cn } from '@/lib/utils';
import { InitialAvatar } from '@/components/common/InitialAvatar/InitialAvatar';
import type { BusinessAvatarProps } from './types';

export function BusinessAvatar({
  name,
  logoUrl,
  size = 36,
  shape = 'square',
  tint,
  className,
}: BusinessAvatarProps) {
  if (!logoUrl) {
    return (
      <InitialAvatar
        name={name}
        size={size}
        shape={shape}
        tint={tint}
        className={className}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 select-none overflow-hidden bg-surface-2',
        shape === 'square' ? 'rounded-lg' : 'rounded-full',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        className="size-full object-cover"
      />
    </span>
  );
}
