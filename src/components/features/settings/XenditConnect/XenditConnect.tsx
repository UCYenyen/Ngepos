'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type {
  PaymentCredentialStatus,
  XenditConnectProps,
} from './types';

const INPUT_CLASS =
  'h-10 w-full rounded-md border border-hairline bg-surface-1 px-3 font-mono text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

export function XenditConnect({ businessId }: XenditConnectProps) {
  const [loaded, setLoaded] = useState(false);
  const [connected, setConnected] = useState(false);
  const [keyLast4, setKeyLast4] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/businesses/${businessId}/payment`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data: PaymentCredentialStatus | null) => {
        if (!alive || !data) return;
        setConnected(data.connected);
        setKeyLast4(data.keyLast4);
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [businessId]);

  async function handleConnect() {
    if (!secretKey.trim()) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/businesses/${businessId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: secretKey.trim() }),
      });
      const data = (await response.json().catch(() => null)) as {
        keyLast4?: string;
        error?: string;
      } | null;
      if (!response.ok) {
        throw new Error(data?.error ?? 'Gagal menghubungkan Xendit');
      }
      setConnected(true);
      setKeyLast4(data?.keyLast4 ?? null);
      setSecretKey('');
      toast.success('Akun Xendit terhubung');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menghubungkan Xendit'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const response = await fetch(`/api/businesses/${businessId}/payment`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      setConnected(false);
      setKeyLast4(null);
      toast.success('Akun Xendit diputus');
    } catch {
      toast.error('Gagal memutus Xendit');
    } finally {
      setDisconnecting(false);
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-ink-muted">
        <Loader2 className="size-4 animate-spin" />
        Memuat status…
      </div>
    );
  }

  if (connected) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="size-5 text-success" />
          <div className="flex flex-col">
            <span className="text-[13.5px] font-semibold text-ink">
              Terhubung ke Xendit
            </span>
            <span className="font-mono text-[12px] text-ink-muted">
              Secret key •••• {keyLast4 ?? '••••'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="btn-secondary h-9 px-4 text-[13px] disabled:opacity-50"
        >
          {disconnecting ? 'Memutus…' : 'Putuskan'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12.5px] text-ink-muted">
        Hubungkan akun Xendit bisnismu. Pembayaran gateway masuk langsung ke akun
        Xendit-mu — tarik danamu kapan saja lewat dashboard Xendit. Secret key
        disimpan terenkripsi dan tidak pernah ditampilkan kembali.
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink">
          Xendit secret key
        </span>
        <input
          type="password"
          value={secretKey}
          onChange={(event) => setSecretKey(event.target.value)}
          placeholder="xnd_production_..."
          autoComplete="off"
          className={INPUT_CLASS}
        />
      </label>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleConnect}
          disabled={saving || !secretKey.trim()}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'Menghubungkan…' : 'Hubungkan Xendit'}
        </button>
      </div>
    </div>
  );
}
