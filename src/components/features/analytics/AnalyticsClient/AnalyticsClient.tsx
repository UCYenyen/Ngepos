'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format';
import { MetricCards } from '@/components/features/analytics/MetricCards/MetricCards';
import { RevenueChart } from '@/components/features/analytics/RevenueChart/RevenueChart';
import { TopProductsChart } from '@/components/features/analytics/TopProductsChart/TopProductsChart';
import { CategorySalesChart } from '@/components/features/analytics/CategorySalesChart/CategorySalesChart';
import { PaymentBreakdownChart } from '@/components/features/analytics/PaymentBreakdownChart/PaymentBreakdownChart';
import { StaffPerformance } from '@/components/features/analytics/StaffPerformance/StaffPerformance';
import type { DashboardMetrics, DateRange, DateRangePreset } from '@/types/analytics';
import type { AnalyticsClientProps } from './types';

interface PresetOption {
  key: DateRangePreset;
  label: string;
}

const PRESETS: PresetOption[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
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

export function AnalyticsClient({ businessId }: AnalyticsClientProps) {
  const [preset, setPreset] = useState<DateRangePreset>('month');
  const [range, setRange] = useState<DateRange>(() => presetRange('month'));
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMetrics(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          businessId,
          start: range.start,
          end: range.end,
        });
        const response = await fetch(`/api/analytics?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load analytics. Please try again.');
        }

        const data = (await response.json()) as DashboardMetrics;
        setMetrics(data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();

    return () => {
      controller.abort();
    };
  }, [businessId, range.start, range.end]);

  function handlePreset(next: DateRangePreset): void {
    setPreset(next);
    if (next !== 'custom') {
      setRange(presetRange(next));
    }
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {PRESETS.map((option) => (
          <Button
            key={option.key}
            variant={preset === option.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePreset(option.key)}
          >
            {option.label}
          </Button>
        ))}

        {preset === 'custom' ? (
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="size-4" />
                    {formatDate(range.start)}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(range.start)}
                  onSelect={handleCustomStart}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <span className="text-ink-muted text-sm">to</span>
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="size-4" />
                    {formatDate(range.end)}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={new Date(range.end)}
                  onSelect={handleCustomEnd}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      ) : error ? (
        <p className="text-sm text-semantic-error">{error}</p>
      ) : metrics ? (
        <div className="flex flex-col gap-6">
          <MetricCards summary={metrics.summary} />
          <RevenueChart data={metrics.revenueSeries} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopProductsChart data={metrics.topProducts} />
            <CategorySalesChart data={metrics.categorySales} />
          </div>
          <PaymentBreakdownChart data={metrics.paymentBreakdown} />
          <StaffPerformance data={metrics.staffPerformance} />
        </div>
      ) : null}
    </div>
  );
}
