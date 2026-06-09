'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MailCheck, TriangleAlert } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { GoogleIcon } from '../AuthShell/AuthShell';
import { cn } from '@/lib/utils';
import type { SignupFormState } from './types';

const INPUT_CLASS =
  'h-11 w-full rounded-md border border-hairline bg-surface-1 px-3.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return score;
}

const STRENGTH = [
  { label: 'Lemah', color: 'bg-error', text: 'text-error' },
  { label: 'Lemah', color: 'bg-error', text: 'text-error' },
  { label: 'Sedang', color: 'bg-accent', text: 'text-accent' },
  { label: 'Kuat', color: 'bg-success', text: 'text-success' },
  { label: 'Sangat kuat', color: 'bg-success', text: 'text-success' },
];

export function SignupForm() {
  const router = useRouter();
  const [state, setState] = useState<SignupFormState>({
    name: '',
    email: '',
    password: '',
    loading: false,
    error: '',
    awaitingConfirmation: false,
  });

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: state.email,
        password: state.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: state.name.trim() },
        },
      });
      if (error) throw error;
      if (data.session) {
        router.push('/onboarding');
      } else {
        setState((prev) => ({ ...prev, awaitingConfirmation: true, loading: false }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Gagal mendaftar',
        loading: false,
      }));
    }
  }

  async function handleGoogleSignup() {
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
          err instanceof Error ? err.message : 'Gagal mendaftar dengan Google',
        loading: false,
      }));
    }
  }

  if (state.awaitingConfirmation) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-success-light text-success">
          <MailCheck className="size-7" strokeWidth={1.8} />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Cek email kamu
          </h1>
          <p className="text-sm text-ink-muted">
            Kami mengirim tautan verifikasi ke{' '}
            <span className="font-medium text-ink">{state.email}</span>. Klik
            tautannya untuk mengaktifkan akun, lalu masuk.
          </p>
        </div>
        <Link href="/login" className="btn-accent h-11 w-full">
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  const strength = passwordStrength(state.password);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Buat akun gratis
        </h1>
        <p className="text-sm text-ink-muted">
          Mulai kelola bisnismu dalam 5 menit.
        </p>
      </div>

      {state.error && (
        <div className="flex items-start gap-2.5 rounded-lg bg-error-light px-3.5 py-3 text-error">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span className="text-[13.5px] font-medium">{state.error}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-ink">Nama lengkap</span>
          <input
            required
            value={state.name}
            onChange={(event) =>
              setState((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Sari Dewi"
            className={INPUT_CLASS}
          />
        </label>
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
            minLength={8}
            value={state.password}
            onChange={(event) =>
              setState((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="Minimal 8 karakter"
            className={INPUT_CLASS}
          />
          {state.password.length > 0 && (
            <>
              <div className="mt-0.5 flex gap-1.5">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={cn(
                      'h-1 flex-1 rounded-full',
                      index < strength
                        ? STRENGTH[strength].color
                        : 'bg-hairline'
                    )}
                  />
                ))}
              </div>
              <span className="text-[12px] text-ink-muted">
                Kekuatan:{' '}
                <strong className={STRENGTH[strength].text}>
                  {STRENGTH[strength].label}
                </strong>{' '}
                · minimal 8 karakter
              </span>
            </>
          )}
        </label>
        <button
          type="submit"
          disabled={state.loading}
          className="btn-accent h-11 w-full disabled:opacity-50"
        >
          {state.loading ? 'Memproses…' : 'Buat akun'}
        </button>
      </form>

      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={state.loading}
        className="btn-secondary h-11 w-full gap-2.5 disabled:opacity-50"
      >
        <GoogleIcon className="size-4.5" />
        Lanjutkan dengan Google
      </button>

      <p className="text-center text-[12.5px] leading-relaxed text-ink-muted">
        Dengan mendaftar, kamu menyetujui{' '}
        <span className="text-ink underline">Ketentuan Layanan</span> &{' '}
        <span className="text-ink underline">Kebijakan Privasi</span>.
      </p>

      <p className="text-center text-sm text-ink-muted">
        Sudah punya akun?{' '}
        <Link href="/login" className="font-semibold text-accent">
          Masuk
        </Link>
      </p>
    </div>
  );
}
