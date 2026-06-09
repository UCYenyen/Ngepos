'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon, RefreshCw } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { MetricCards } from '@/components/features/analytics/MetricCards/MetricCards';
import { RevenueChart } from '@/components/features/analytics/RevenueChart/RevenueChart';
import { TopProductsChart } from '@/components/features/analytics/TopProductsChart/TopProductsChart';
import { CategorySalesChart } from '@/components/features/analytics/CategorySalesChart/CategorySalesChart';
import { PaymentBreakdownChart } from '@/components/features/analytics/PaymentBreakdownChart/PaymentBreakdownChart';
import { StaffPerformance } from '@/components/features/analytics/StaffPerformance/StaffPerformance';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type {
  DashboardMetrics,
  DateRange,
  DateRangePreset,
} from '@/types/analytics';
import type { AnalyticsClientProps } from './types';

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: 'today', label: 'Hari ini' },
  { key: 'week', label: 'Minggu ini' },
  { key: 'month', label: 'Bulan ini' },
  { key: 'custom', label: 'Kustom' },
];

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function presetRange(preset: Exclude<DateRangePreset, 'custom'>): DateRange {
  const now = new Date();
  if (preset === 'today') {
    return { start: startOfDay(now).toISOString(), end: now.toISOString() };
  }
  if (preset === 'week') {
    const start = startOfDay(now);
    start.setDate(start.getDate() - 7);
    return { start: start.toISOString(), end: now.toISOString() };
  }
  const start = startOfDay(now);
  start.setDate(1);
  return { start: start.toISOString(), end: now.toISOString() };
}

export function AnalyticsClient({
  businessId,
  businessName,
}: AnalyticsClientProps) {
  const [preset, setPreset] = useState<DateRangePreset>('month');
  const [range, setRange] = useState<DateRange>(() => presetRange('month'));
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setStatus('loading');
      try {
        const params = new URLSearchParams({
          businessId,
          start: range.start,
          end: range.end,
        });
        const response = await fetch(`/api/analytics?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('failed');
        const data = (await response.json()) as DashboardMetrics;
        setMetrics(data);
        setStatus('ready');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      }
    })();
    return () => controller.abort();
  }, [businessId, range.start, range.end]);

  function handlePreset(next: DateRangePreset): void {
    setPreset(next);
    if (next !== 'custom') setRange(presetRange(next));
  }

  function handleCustomStart(date: Date | undefined): void {
    if (!date) return;
    setPreset('custom');
    setRange((prev) => ({ ...prev, start: startOfDay(date).toISOString() }));
  }

  function handleCustomEnd(date: Date | undefined): void {
    if (!date) return;
    setPreset('custom');
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    setRange((prev) => ({ ...prev, end: end.toISOString() }));
  }

  const action = (
    <div className="flex flex-wrap gap-1.5">
      {PRESETS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => handlePreset(option.key)}
          className={cn(
            'h-9 rounded-full border px-3.5 text-[13px] font-medium transition-colors',
            preset === option.key
              ? 'border-ink bg-ink text-surface-1'
              : 'border-hairline bg-surface-1 text-ink-muted hover:bg-canvas hover:text-ink'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <PageShell
      title="Analitik"
      subtitle={`Performa penjualan ${businessName}.`}
      action={action}
    >
      {preset === 'custom' && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <DatePicker value={range.start} onSelect={handleCustomStart} />
          <span className="text-sm text-ink-muted">sampai</span>
          <DatePicker value={range.end} onSelect={handleCustomEnd} />
        </div>
      )}

      {status === 'loading' && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-hairline bg-surface-1 px-5 py-12 text-center">
          <p className="text-sm text-ink-muted">Gagal memuat analitik.</p>
          <button
            type="button"
            onClick={() => setRange((prev) => ({ ...prev }))}
            className="btn-secondary gap-2"
          >
            <RefreshCw className="size-4" />
            Coba lagi
          </button>
        </div>
      )}

      {status === 'ready' && metrics && (
        <div className="flex flex-col gap-4">
          <MetricCards summary={metrics.summary} />
          <RevenueChart data={metrics.revenueSeries} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopProductsChart data={metrics.topProducts} />
            <CategorySalesChart data={metrics.categorySales} />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PaymentBreakdownChart data={metrics.paymentBreakdown} />
            <StaffPerformance data={metrics.staffPerformance} />
          </div>
        </div>
      )}
    </PageShell>
  );
}

function DatePicker({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (date: Date | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-hairline bg-surface-1 px-3 text-[13px] font-medium text-ink transition-colors hover:bg-canvas"
          >
            <CalendarIcon className="size-4 text-ink-subtle" />
            {formatDate(value)}
          </button>
        }
      />
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={new Date(value)}
          onSelect={onSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
