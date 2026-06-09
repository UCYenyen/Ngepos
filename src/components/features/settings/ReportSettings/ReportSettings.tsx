'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Lock, Mail, MessageCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
  ReportChannel,
  ReportSettings as ReportSettingsData,
} from '@/types/business';
import type { ReportSettingsProps } from './types';

const CHANNELS: { value: ReportChannel; label: string; icon: typeof Mail }[] = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
];

export function ReportSettings({
  businessId,
  planHasAutomatedReports,
}: ReportSettingsProps) {
  const [enabled, setEnabled] = useState(false);
  const [channel, setChannel] = useState<ReportChannel>('email');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(planHasAutomatedReports);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!planHasAutomatedReports) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/businesses/${businessId}/report-settings`
        );
        if (!response.ok) throw new Error('failed');
        const data = (await response.json()) as ReportSettingsData;
        if (!alive) return;
        setEnabled(data.report_enabled);
        setChannel(data.report_channel);
        setRecipient(data.report_recipient);
      } catch {
        if (alive) toast.error('Gagal memuat pengaturan laporan');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [businessId, planHasAutomatedReports]);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(
        `/api/businesses/${businessId}/report-settings`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            report_enabled: enabled,
            report_channel: channel,
            report_recipient: recipient,
          }),
        }
      );
      if (!response.ok) throw new Error('failed');
      toast.success('Pengaturan laporan disimpan');
    } catch {
      toast.error('Gagal menyimpan pengaturan laporan');
    } finally {
      setSaving(false);
    }
  }

  if (!planHasAutomatedReports) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase text-accent">
          <Lock className="size-2.5" strokeWidth={2.5} />
          Pro
        </span>
        <span className="text-[13.5px] text-ink-muted">
          Aktifkan laporan otomatis dengan paket Pro.
        </span>
        <Link href="/billing" className="btn-accent ml-auto h-9 px-4 text-[13px]">
          Upgrade
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const recipientLabel =
    channel === 'whatsapp' ? 'Nomor WhatsApp penerima' : 'Email penerima';
  const recipientPlaceholder =
    channel === 'whatsapp' ? '+62 812-3456-7890' : 'owner@bisnis.com';

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[13px] font-medium text-ink">
            Aktifkan laporan otomatis
          </span>
          <span className="text-[12px] text-ink-muted">
            Dikirim otomatis tiap tanggal 1.
          </span>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} disabled={saving} />
      </div>

      <div className="border-t border-hairline-soft" />

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-ink">
          Channel pengiriman
        </span>
        <div className="flex gap-2.5">
          {CHANNELS.map((option) => {
            const Icon = option.icon;
            const active = channel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setChannel(option.value)}
                disabled={saving}
                className={cn(
                  'flex flex-1 items-center gap-2.5 rounded-lg border p-3 transition-colors',
                  active
                    ? 'border-accent bg-accent/10'
                    : 'border-hairline bg-surface-1 hover:bg-canvas'
                )}
              >
                <span
                  className={cn(
                    'size-4 shrink-0 rounded-full border-2',
                    active ? 'border-accent bg-accent' : 'border-hairline'
                  )}
                />
                <Icon className="size-4 text-ink-muted" />
                <span className="text-[13.5px] font-semibold text-ink">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink">{recipientLabel}</span>
        <input
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          placeholder={recipientPlaceholder}
          disabled={saving}
          className="h-10 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </label>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'Menyimpan…' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}
