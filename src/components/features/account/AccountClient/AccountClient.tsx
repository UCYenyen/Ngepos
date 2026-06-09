'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { supabaseClient } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { InitialAvatar } from '@/components/common/InitialAvatar/InitialAvatar';
import type { AccountStatus } from './types';

const INPUT_CLASS =
  'h-11 w-full rounded-md border border-hairline bg-surface-1 px-3.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60';

export function AccountClient() {
  const [status, setStatus] = useState<AccountStatus>('loading');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let alive = true;
    supabaseClient.auth.getUser().then(({ data, error }) => {
      if (!alive) return;
      if (error || !data.user) {
        setStatus('error');
        return;
      }
      const fullName =
        (data.user.user_metadata?.full_name as string | undefined) ?? '';
      setName(fullName);
      setEmail(data.user.email ?? '');
      setStatus('ready');
    });
    return () => {
      alive = false;
    };
  }, []);

  async function handleSaveName(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }
    setSavingName(true);
    try {
      const { error } = await supabaseClient.auth.updateUser({
        data: { full_name: name.trim() },
      });
      if (error) throw error;
      toast.success('Profil diperbarui');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan profil');
    } finally {
      setSavingName(false);
    }
  }

  async function handleSavePassword(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }
    if (password !== confirm) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabaseClient.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password berhasil diubah');
      setPassword('');
      setConfirm('');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Gagal mengubah password'
      );
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="flex-1 overflow-auto px-6 py-8 md:px-10">
      <div className="mx-auto max-w-160">
        <header className="mb-7 flex flex-col gap-1.5">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Akun
          </h1>
          <p className="text-ink-muted">
            Kelola informasi profil dan keamanan akunmu.
          </p>
        </header>

        {status === 'loading' && (
          <div className="flex flex-col gap-5">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
        )}

        {status === 'error' && (
          <p className="rounded-xl border border-hairline bg-surface-1 px-5 py-12 text-center text-sm text-ink-muted">
            Gagal memuat data akun.
          </p>
        )}

        {status === 'ready' && (
          <div className="flex flex-col gap-5">
            <AccountSection
              title="Profil"
              description="Nama yang ditampilkan di dalam aplikasi."
            >
              <form onSubmit={handleSaveName} className="flex flex-col gap-4">
                <div className="flex items-center gap-3.5">
                  <InitialAvatar name={name || email} size={48} shape="circle" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-ink">
                      {name || 'Tanpa nama'}
                    </span>
                    <span className="truncate text-[13px] text-ink-muted">
                      {email}
                    </span>
                  </div>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-ink">
                    Nama lengkap
                  </span>
                  <input
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Sari Dewi"
                    className={INPUT_CLASS}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-ink">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    disabled
                    className={INPUT_CLASS}
                  />
                </label>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingName}
                    className="btn-accent h-10 px-5 disabled:opacity-50"
                  >
                    {savingName ? 'Menyimpan…' : 'Simpan'}
                  </button>
                </div>
              </form>
            </AccountSection>

            <AccountSection
              title="Keamanan"
              description="Ubah password akunmu. Minimal 8 karakter."
            >
              <form
                onSubmit={handleSavePassword}
                className="flex flex-col gap-4"
              >
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-ink">
                    Password baru
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimal 8 karakter"
                    className={INPUT_CLASS}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium text-ink">
                    Konfirmasi password
                  </span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder="Ulangi password baru"
                    className={INPUT_CLASS}
                  />
                </label>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="btn-secondary h-10 px-5 disabled:opacity-50"
                  >
                    {savingPassword ? 'Menyimpan…' : 'Ubah password'}
                  </button>
                </div>
              </form>
            </AccountSection>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-xl border border-hairline bg-surface-1 p-6">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="text-[13px] text-ink-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}
