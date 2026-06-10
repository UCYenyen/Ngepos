'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, ExternalLink, Loader2, X } from 'lucide-react';
import {
  STOREFRONT_DOMAIN,
  STOREFRONT_PREFIX,
  storefrontUrl,
} from '@/lib/site';
import type { StorefrontSettingsProps } from './types';

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function StorefrontSettings({
  businessId,
  initialSubdomain,
  planHasOnlineStore,
}: StorefrontSettingsProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialSubdomain ?? '');
  const [published, setPublished] = useState(initialSubdomain);
  const [availability, setAvailability] = useState<Availability>('idle');
  const [checkedValue, setCheckedValue] = useState('');
  const [reason, setReason] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const normalized = value.trim().toLowerCase();
  const isCurrent = normalized === (published ?? '');
  const shouldCheck = planHasOnlineStore && !isCurrent && normalized.length > 0;
  const settled = checkedValue === normalized;

  useEffect(() => {
    if (!shouldCheck) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/businesses/${businessId}/storefront?check=${encodeURIComponent(normalized)}`,
          { signal: controller.signal }
        );
        const data = (await res.json()) as { available: boolean; reason: string | null };
        setAvailability(data.available ? 'available' : 'taken');
        setReason(data.reason);
        setCheckedValue(normalized);
      } catch {
        // aborted or network error — leave state for the next keystroke
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [businessId, normalized, shouldCheck]);

  async function save(next: string | null) {
    setSaving(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/storefront`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menyimpan');
      setPublished(next);
      setValue(next ?? '');
      setAvailability('idle');
      setCheckedValue('');
      toast.success(next ? 'Storefront dipublikasikan' : 'Storefront dinonaktifkan');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  if (!planHasOnlineStore) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-hairline bg-surface-2 px-4 py-5 text-center">
        <span className="text-[13.5px] font-semibold text-ink">
          Fitur Pro / Enterprise
        </span>
        <span className="text-[12.5px] text-ink-muted">
          Tingkatkan paket untuk membuka storefront online dan menerima pesanan
          pelanggan tanpa login.
        </span>
      </div>
    );
  }

  const canSave = shouldCheck && settled && availability === 'available';

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink">Alamat storefront</span>
        <div className="flex items-stretch overflow-hidden rounded-md border border-hairline bg-surface-1 focus-within:ring-2 focus-within:ring-accent">
          <span className="flex items-center bg-surface-2 px-3 text-sm text-ink-muted">
            {STOREFRONT_PREFIX}
          </span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="nama-bisnis"
            className="h-10 min-w-0 flex-1 bg-surface-1 px-2 text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
          />
          <span className="flex items-center bg-surface-2 px-3 text-sm text-ink-muted">
            .{STOREFRONT_DOMAIN}
          </span>
        </div>
        {shouldCheck && !settled && (
          <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
            <Loader2 className="size-3.5 animate-spin" /> Memeriksa ketersediaan…
          </span>
        )}
        {shouldCheck && settled && availability === 'available' && (
          <span className="flex items-center gap-1.5 text-[12px] text-success">
            <Check className="size-3.5" /> Tersedia
          </span>
        )}
        {shouldCheck && settled && availability === 'taken' && (
          <span className="flex items-center gap-1.5 text-[12px] text-error">
            <X className="size-3.5" /> {reason ?? 'Sudah dipakai'}
          </span>
        )}
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => save(normalized)}
          disabled={!canSave || saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'Menyimpan…' : published ? 'Perbarui alamat' : 'Publikasikan'}
        </button>

        {published && (
          <>
            <a
              href={storefrontUrl(published)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary gap-2"
            >
              <ExternalLink className="size-4" />
              Buka storefront
            </a>
            <button
              type="button"
              onClick={() => save(null)}
              disabled={saving}
              className="text-[13px] font-medium text-error hover:underline disabled:opacity-50"
            >
              Nonaktifkan
            </button>
          </>
        )}
      </div>

      {published && (
        <p className="text-[12px] text-ink-muted">
          Aktif di{' '}
          <span className="font-medium text-ink">
            {storefrontUrl(published).replace('https://', '')}
          </span>
        </p>
      )}
    </div>
  );
}
