'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { GoogleIcon } from '../AuthShell/AuthShell';
import type { LoginFormState } from './types';

const INPUT_CLASS =
  'h-11 w-full rounded-md border border-hairline bg-surface-1 px-3.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<LoginFormState>({
    email: '',
    password: '',
    loading: false,
    error: '',
  });

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: state.email,
        password: state.password,
      });
      if (error) throw error;
      router.push('/dashboard');
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Gagal masuk',
        loading: false,
      }));
    }
  }

  async function handleGoogleLogin() {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Gagal masuk dengan Google',
        loading: false,
      }));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Masuk ke Ngepos
        </h1>
        <p className="text-sm text-ink-muted">
          Selamat datang kembali. Masuk untuk lanjut.
        </p>
      </div>

      {state.error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-error-light px-3.5 py-3 text-error">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span className="text-[13.5px] font-medium">{state.error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink">Password</span>
          <input
            type="password"
            required
            value={state.password}
            onChange={(event) =>
              setState((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="••••••••"
            className={INPUT_CLASS}
          />
        </label>
        <button
          type="submit"
          disabled={state.loading}
          className="btn-accent h-11 w-full disabled:opacity-50"
        >
          {state.loading ? 'Memproses…' : 'Masuk'}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-hairline" />
        <span className="text-[13px] text-ink-muted">atau</span>
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={state.loading}
        className="btn-secondary h-11 w-full gap-2.5 disabled:opacity-50"
      >
        <GoogleIcon className="size-4.5" />
        Lanjutkan dengan Google
      </button>

      <p className="text-center text-sm text-ink-muted">
        Belum punya akun?{' '}
        <Link href="/signup" className="font-semibold text-accent">
          Daftar
        </Link>
      </p>
    </div>
  );
}
