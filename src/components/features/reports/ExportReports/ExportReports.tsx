'use client';

import { useState } from 'react';
import { CalendarIcon, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDate } from '@/lib/format';
import { generateTransactionsPdf } from '@/lib/export/pdf';
import type { CsvTransactionRow } from '@/lib/export/csv';
import type { DateRange, DateRangePreset } from '@/types/analytics';
import type { ExportReportsProps } from './types';

interface PresetOption {
  key: DateRangePreset;
  label: string;
}

interface ExportJsonResponse {
  businessName: string;
  rows: CsvTransactionRow[];
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

export function ExportReports({ businessId, businessName }: ExportReportsProps) {
  const [preset, setPreset] = useState<DateRangePreset>('month');
  const [range, setRange] = useState<DateRange>(() => presetRange('month'));
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  function buildExportUrl(format: 'csv' | 'json'): string {
    const params = new URLSearchParams({
      businessId,
      start: range.start,
      end: range.end,
      format,
    });
    return `/api/reports/export?${params.toString()}`;
  }

  function handleExportCsv(): void {
    setError(null);
    window.location.href = buildExportUrl('csv');
  }

  async function handleExportPdf(): Promise<void> {
    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch(buildExportUrl('json'));

      if (!response.ok) {
        throw new Error('Failed to generate report. Please try again.');
      }

      const data = (await response.json()) as ExportJsonResponse;
      const doc = generateTransactionsPdf(data.businessName, data.rows);
      doc.save(
        `transactions-${range.start.slice(0, 10)}-to-${range.end.slice(0, 10)}.pdf`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report.');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export transactions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <p className="text-sm text-ink-muted">{businessName}</p>

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
              <span className="text-sm text-ink-muted">to</span>
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

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleExportCsv} disabled={isExporting}>
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPdf} disabled={isExporting}>
            <FileText className="size-4" />
            {isExporting ? 'Generating...' : 'Export PDF'}
          </Button>
        </div>

        {error ? <p className="text-sm text-semantic-error">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
