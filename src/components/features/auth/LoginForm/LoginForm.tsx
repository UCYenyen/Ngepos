'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import type { LoginFormState } from './types';

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<LoginFormState>({
    email: '',
    password: '',
    loading: false,
    error: '',
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
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
        error: err instanceof Error ? err.message : 'Login failed',
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }

  async function handleGoogleLogin() {
    setState((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Google login failed',
        loading: false,
      }));
    }
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold mb-2">Log In</h1>
      <p className="text-sm text-slate-500 mb-6">Access your Ngepos account</p>

      <form onSubmit={handleLogin} className="space-y-4">
        {state.error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md">{state.error}</div>
        )}

        <Input
          type="email"
          placeholder="Email"
          value={state.email}
          onChange={(e) => setState((prev) => ({ ...prev, email: e.target.value }))}
          required
        />

        <Input
          type="password"
          placeholder="Password"
          value={state.password}
          onChange={(e) => setState((prev) => ({ ...prev, password: e.target.value }))}
          required
        />

        <Button type="submit" className="w-full" disabled={state.loading}>
          {state.loading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={state.loading}
      >
        Log in with Google
      </Button>

      <p className="text-sm text-slate-600 text-center mt-6">
        Don't have an account?{' '}
        <Link href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
