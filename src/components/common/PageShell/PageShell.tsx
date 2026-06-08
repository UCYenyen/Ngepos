import { cn } from '@/lib/utils';
import type { PageShellProps } from './types';

export function PageShell({
  title,
  subtitle,
  className,
  children,
}: PageShellProps) {
  return (
    <div className={cn('min-h-screen bg-canvas', className)}>
      <div className="container-wrapper py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-ink">{title}</h1>
          {subtitle ? <p className="mt-1 text-ink-muted">{subtitle}</p> : null}
        </header>

        {children}
      </div>
    </div>
  );
}
