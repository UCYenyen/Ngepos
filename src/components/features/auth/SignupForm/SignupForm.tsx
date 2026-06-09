'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SignupFormState } from './types';

export function SignupForm() {
  const router = useRouter();
  const [state, setState] = useState<SignupFormState>({
    email: '',
    password: '',
    loading: false,
    error: '',
    awaitingConfirmation: false,
  });

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: state.email,
        password: state.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.session) {
        router.push('/onboarding');
      } else {
        setState((prev) => ({ ...prev, awaitingConfirmation: true }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Signup failed',
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }

  async function handleGoogleSignup() {
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
        error: err instanceof Error ? err.message : 'Google signup failed',
        loading: false,
      }));
    }
  }

  if (state.awaitingConfirmation) {
    return (
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-sm text-slate-600 mb-6">
          We sent a verification link to{' '}
          <span className="font-medium text-slate-900">{state.email}</span>. Click
          the link to activate your account, then log in.
        </p>
        <Link href="/login" className={cn(buttonVariants(), 'w-full')}>
          Go to login
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold mb-2">Create Account</h1>
      <p className="text-sm text-slate-500 mb-6">Start using Ngepos today</p>

      <form onSubmit={handleSignup} className="space-y-4">
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
          {state.loading ? 'Creating account...' : 'Sign Up'}
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
        onClick={handleGoogleSignup}
        disabled={state.loading}
      >
        Sign up with Google
      </Button>

      <p className="text-sm text-slate-600 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
