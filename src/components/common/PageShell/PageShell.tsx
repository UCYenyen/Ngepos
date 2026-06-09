import { cn } from '@/lib/utils';
import type { PageShellProps } from './types';

export function PageShell({
  title,
  subtitle,
  action,
  className,
  children,
}: PageShellProps) {
  return (
    <div className={cn('min-h-full bg-canvas', className)}>
      <div className="container-wrapper py-8">
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1 text-ink-muted">{subtitle}</p>
            ) : null}
          </div>
          {action}
        </header>

        {children}
      </div>
    </div>
  );
}
