import type { ReactNode } from 'react';
import { Zap } from 'lucide-react';

const STATS = [
  ['1.000+', 'Usaha'],
  ['4,9', 'Rating'],
  ['5 mnt', 'Setup'],
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <aside className="hidden w-95 shrink-0 flex-col justify-between bg-ink p-10 text-surface-1 md:flex">
        <span className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-surface-1">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-accent">
            <Zap className="size-4 fill-current text-surface-1" />
          </span>
          Ngepos
        </span>

        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-medium leading-tight tracking-tight text-surface-1">
            Kasir digital untuk semua bisnismu.
          </h2>
          <div className="rounded-2xl border border-surface-1/10 bg-surface-1/5 p-4">
            <div className="aspect-video rounded-lg bg-surface-1/[0.06]" />
          </div>
          <div className="flex gap-3">
            {STATS.map(([value, label]) => (
              <div key={label} className="flex flex-1 flex-col">
                <span className="font-mono text-xl font-bold text-surface-1">
                  {value}
                </span>
                <span className="text-xs text-surface-1/55">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <span className="text-xs text-surface-1/40">© 2026 Ngepos</span>
      </aside>

      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-95">{children}</div>
      </div>
    </div>
  );
}

export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M21.35 11.1H12v3.2h5.35c-.25 1.5-1.7 4.4-5.35 4.4-3.2 0-5.85-2.65-5.85-5.9S8.8 6.9 12 6.9c1.85 0 3.05.8 3.75 1.45l2.55-2.45C16.7 4.35 14.55 3.5 12 3.5 6.95 3.5 2.85 7.6 2.85 12.7S6.95 21.9 12 21.9c5.3 0 8.8-3.7 8.8-8.95 0-.6-.05-1.05-.15-1.85Z"
        fill="currentColor"
      />
    </svg>
  );
}
