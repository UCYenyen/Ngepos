'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MailCheck, TriangleAlert } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import type { ForgotPasswordFormState } from './types';

const INPUT_CLASS =
  'h-11 w-full rounded-md border border-hairline bg-surface-1 px-3.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

export function ForgotPasswordForm() {
  const [state, setState] = useState<ForgotPasswordFormState>({
    email: '',
    loading: false,
    error: '',
    sent: false,
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        state.email,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        }
      );
      if (error) throw error;
      setState((prev) => ({ ...prev, loading: false, sent: true }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Gagal mengirim email',
        loading: false,
      }));
    }
  }

  if (state.sent) {
    return (
      <div className="flex flex-col gap-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-success-light text-success">
          <MailCheck className="size-6" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Cek email kamu
          </h1>
          <p className="text-sm text-ink-muted">
            Kami mengirim tautan untuk mengatur ulang password ke{' '}
            <span className="font-medium text-ink">{state.email}</span>. Buka
            tautannya untuk membuat password baru.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-accent"
        >
          <ArrowLeft className="size-4" />
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Lupa password?
        </h1>
        <p className="text-sm text-ink-muted">
          Masukkan email akunmu, kami kirim tautan untuk mengatur ulang
          password.
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
          <span className="text-[13px] font-medium text-ink">Email</span>
          <input
            type="email"
            required
            value={state.email}
            onChange={(event) =>
              setState((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="kamu@bisnis.com"
            className={INPUT_CLASS}
          />
        </label>
        <button
          type="submit"
          disabled={state.loading}
          className="btn-accent h-11 w-full disabled:opacity-50"
        >
          {state.loading ? 'Mengirim…' : 'Kirim tautan reset'}
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
