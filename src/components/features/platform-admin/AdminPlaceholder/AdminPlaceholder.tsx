import type { LucideIcon } from 'lucide-react';
import { PageShell } from '@/components/common/PageShell/PageShell';

interface AdminPlaceholderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  message: string;
}

export function AdminPlaceholder({
  title,
  subtitle,
  icon: Icon,
  message,
}: AdminPlaceholderProps) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-hairline bg-surface-1 px-6 py-20 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-ink-muted">
          <Icon className="size-6" strokeWidth={1.6} />
        </span>
        <p className="text-sm font-semibold text-ink">Belum tersedia</p>
        <p className="max-w-sm text-[13px] text-ink-muted">{message}</p>
      </div>
    </PageShell>
  );
}
