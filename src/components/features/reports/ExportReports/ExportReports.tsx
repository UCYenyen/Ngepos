'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowRight,
  CalendarIcon,
  Download,
  FileText,
  Sparkles,
  Table2,
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  formatCompactCurrency,
  formatDate,
} from '@/lib/format';
import { generateTransactionsPdf } from '@/lib/export/pdf';
import { cn } from '@/lib/utils';
import type { CsvTransactionRow } from '@/lib/export/csv';
import type {
  DashboardMetrics,
  DateRange,
  DateRangePreset,
} from '@/types/analytics';
import type { ExportReportsProps } from './types';

interface ExportJsonResponse {
  businessName: string;
  rows: CsvTransactionRow[];
}

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

export function ExportReports({ businessId, businessName }: ExportReportsProps) {
  const [preset, setPreset] = useState<DateRangePreset>('month');
  const [range, setRange] = useState<DateRange>(() => presetRange('month'));
  const [preview, setPreview] = useState<DashboardMetrics | null>(null);
  const [previewStatus, setPreviewStatus] = useState<
    'loading' | 'error' | 'ready'
  >('loading');
  const [lowStockCount, setLowStockCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setPreviewStatus('loading');
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
        setPreview(data);
        try {
          const lowStockRes = await fetch(
            `/api/inventory/low-stock?businessId=${businessId}`,
            { signal: controller.signal }
          );
          if (lowStockRes.ok) {
            const payload = (await lowStockRes.json()) as
              | unknown[]
              | { products?: unknown[]; count?: number };
            setLowStockCount(
              Array.isArray(payload)
                ? payload.length
                : (payload.products?.length ?? payload.count ?? 0)
            );
          }
        } catch {
          setLowStockCount(0);
        }
        setPreviewStatus('ready');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setPreviewStatus('error');
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
    window.location.href = buildExportUrl('csv');
  }

  async function handleExportPdf(): Promise<void> {
    setIsExporting(true);
    try {
      const response = await fetch(buildExportUrl('json'));
      if (!response.ok) throw new Error('failed');
      const data = (await response.json()) as ExportJsonResponse;
      const doc = generateTransactionsPdf(data.businessName, data.rows);
      doc.save(
        `laporan-${range.start.slice(0, 10)}-${range.end.slice(0, 10)}.pdf`
      );
    } catch {
      toast.error('Gagal membuat laporan PDF');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-5 rounded-xl border border-hairline bg-surface-1 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-base font-semibold text-ink">{businessName}</h3>
            <p className="text-[13px] text-ink-muted">
              {formatDate(range.start)} – {formatDate(range.end)}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handlePreset(option.key)}
                className={cn(
                  'h-8 rounded-full border px-3 text-[12.5px] font-medium transition-colors',
                  preset === option.key
                    ? 'border-ink bg-ink text-surface-1'
                    : 'border-hairline bg-surface-1 text-ink-muted hover:bg-canvas hover:text-ink'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {preset === 'custom' && (
          <div className="flex flex-wrap items-center gap-2">
            <DatePicker value={range.start} onSelect={handleCustomStart} />
            <span className="text-sm text-ink-muted">sampai</span>
            <DatePicker value={range.end} onSelect={handleCustomEnd} />
          </div>
        )}

        {previewStatus === 'loading' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        )}

        {previewStatus === 'error' && (
          <p className="py-8 text-center text-sm text-ink-muted">
            Gagal memuat ringkasan.
          </p>
        )}

        {previewStatus === 'ready' && preview && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Stat
                label="Total pendapatan"
                value={formatCompactCurrency(preview.summary.totalRevenue)}
              />
              <Stat
                label="Transaksi"
                value={preview.summary.transactionCount.toLocaleString('id-ID')}
              />
            </div>

            <div className="border-t border-hairline-soft" />

            <div className="flex flex-col gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
                Produk terlaris
              </span>
              {preview.topProducts.length === 0 ? (
                <p className="text-[13px] text-ink-muted">Belum ada penjualan.</p>
              ) : (
                preview.topProducts.slice(0, 3).map((product) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between text-[13.5px]"
                  >
                    <span className="text-ink">{product.name}</span>
                    <span className="font-mono tabular-nums text-ink-muted">
                      {product.quantity} terjual
                    </span>
                  </div>
                ))
              )}
            </div>

            {lowStockCount > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-error-light px-3.5 py-3 text-error">
                <AlertTriangle className="size-4 shrink-0" />
                <span className="text-[13px] font-medium">
                  {lowStockCount} produk dengan stok menipis.
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6">
          <h3 className="text-[15px] font-semibold text-ink">Unduh laporan</h3>
          <DownloadRow
            icon={<FileText className="size-4.5" />}
            iconAccent
            title="PDF lengkap"
            subtitle="Ringkasan visual + tabel"
            buttonClass="btn-accent"
            label={isExporting ? 'Membuat…' : 'Unduh'}
            disabled={isExporting}
            onClick={handleExportPdf}
          />
          <DownloadRow
            icon={<Table2 className="size-4.5" />}
            title="Data CSV"
            subtitle="Transaksi mentah"
            buttonClass="btn-secondary"
            label="Unduh"
            onClick={handleExportCsv}
          />
        </div>

        <div className="flex flex-col gap-2.5 rounded-xl border border-hairline bg-canvas p-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Sparkles className="size-4.5" />
          </span>
          <span className="text-[14.5px] font-semibold text-ink">
            Laporan otomatis
          </span>
          <span className="text-[13px] text-ink-muted">
            Kirim ringkasan ini otomatis tiap tanggal 1 via Email atau WhatsApp.
          </span>
          <Link
            href={`/dashboard/${businessId}/settings`}
            className="flex items-center gap-1.5 text-[13.5px] font-semibold text-accent"
          >
            Atur di Pengaturan
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-canvas px-4 py-3.5">
      <span className="text-[12px] text-ink-muted">{label}</span>
      <span className="font-mono text-[17px] font-bold tabular-nums text-ink">
        {value}
      </span>
    </div>
  );
}

interface DownloadRowProps {
  icon: ReactNode;
  iconAccent?: boolean;
  title: string;
  subtitle: string;
  label: string;
  buttonClass: string;
  disabled?: boolean;
  onClick: () => void;
}

function DownloadRow({
  icon,
  iconAccent,
  title,
  subtitle,
  label,
  buttonClass,
  disabled,
  onClick,
}: DownloadRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-canvas p-3.5">
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-lg',
          iconAccent
            ? 'bg-accent/10 text-accent'
            : 'bg-surface-2 text-ink-muted'
        )}
      >
        {icon}
      </span>
      <div className="flex flex-1 flex-col">
        <span className="text-[13.5px] font-semibold text-ink">{title}</span>
        <span className="text-[12px] text-ink-muted">{subtitle}</span>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(buttonClass, 'h-9 gap-2 px-4 text-[13px] disabled:opacity-50')}
      >
        <Download className="size-4" />
        {label}
      </button>
    </div>
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
        <Calendar mode="single" selected={new Date(value)} onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  );
}
