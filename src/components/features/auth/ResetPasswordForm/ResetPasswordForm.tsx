'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, TriangleAlert } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import type { ResetPasswordFormState, ResetSessionState } from './types';

const INPUT_CLASS =
  'h-11 w-full rounded-md border border-hairline bg-surface-1 px-3.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

export function ResetPasswordForm() {
  const router = useRouter();
  const [session, setSession] = useState<ResetSessionState>('checking');
  const [state, setState] = useState<ResetPasswordFormState>({
    password: '',
    confirm: '',
    loading: false,
    error: '',
  });

  useEffect(() => {
    let alive = true;
    supabaseClient.auth.getSession().then(({ data }) => {
      if (alive) setSession(data.session ? 'ready' : 'invalid');
    });
    return () => {
      alive = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (state.password.length < 8) {
      setState((prev) => ({ ...prev, error: 'Password minimal 8 karakter' }));
      return;
    }
    if (state.password !== state.confirm) {
      setState((prev) => ({
        ...prev,
        error: 'Konfirmasi password tidak cocok',
      }));
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: state.password,
      });
      if (error) throw error;
      toast.success('Password berhasil diperbarui');
      router.push('/dashboard');
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Gagal mengubah password',
        loading: false,
      }));
    }
  }

  if (session === 'checking') {
    return (
      <div className="flex items-center gap-2.5 text-sm text-ink-muted">
        <Loader2 className="size-4 animate-spin" />
        Memeriksa tautan…
      </div>
    );
  }

  if (session === 'invalid') {
    return (
      <div className="flex flex-col gap-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-error-light text-error">
          <TriangleAlert className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Tautan tidak valid
          </h1>
          <p className="text-sm text-ink-muted">
            Tautan reset password sudah kedaluwarsa atau tidak valid. Minta
            tautan baru untuk melanjutkan.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="btn-accent inline-flex h-11 items-center justify-center"
        >
          Minta tautan baru
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Buat password baru
        </h1>
        <p className="text-sm text-ink-muted">
          Pilih password baru untuk akunmu. Minimal 8 karakter.
        </p>
      </div>

      {state.error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-error-light px-3.5 py-3 text-error">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span className="text-[13.5px] font-medium">{state.error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink">
            Password baru
          </span>
          <input
            type="password"
            required
            value={state.password}
            onChange={(event) =>
              setState((prev) => ({ ...prev, password: event.target.value }))
            }
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
            required
            value={state.confirm}
            onChange={(event) =>
              setState((prev) => ({ ...prev, confirm: event.target.value }))
            }
            placeholder="Ulangi password baru"
            className={INPUT_CLASS}
          />
        </label>
        <button
          type="submit"
          disabled={state.loading}
          className="btn-accent h-11 w-full disabled:opacity-50"
        >
          {state.loading ? 'Menyimpan…' : 'Simpan password baru'}
        </button>
      </form>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Kembali ke halaman masuk
      </Link>
    </div>
  );
}
