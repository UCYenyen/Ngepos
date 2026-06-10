'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Store,
  TriangleAlert,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { Wordmark } from '@/components/layout/Wordmark/Wordmark';
import { cn } from '@/lib/utils';
import type { BusinessType } from '@/types/business';
import type { OnboardingFormState } from './types';

const INPUT_CLASS =
  'h-11 w-full rounded-md border border-hairline bg-surface-1 px-3.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent';

const TYPES: {
  value: BusinessType;
  icon: LucideIcon;
  title: string;
  desc: string;
}[] = [
  { value: 'retail', icon: Store, title: 'Retail', desc: 'Toko, butik, minimarket' },
  {
    value: 'fnb',
    icon: UtensilsCrossed,
    title: 'F&B / Restoran',
    desc: 'Kafe, resto, warung',
  },
];

const TIMEZONES = [
  { value: 'Asia/Jakarta', label: 'WIB (GMT+7)' },
  { value: 'Asia/Makassar', label: 'WITA (GMT+8)' },
  { value: 'Asia/Jayapura', label: 'WIT (GMT+9)' },
];

export function OnboardingForm() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingFormState>({
    businessName: '',
    businessType: 'fnb',
    timezone: 'Asia/Jakarta',
    currency: 'IDR',
    loading: false,
    error: '',
  });

  async function handleCreateBusiness() {
    if (!state.businessName.trim()) return;
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (!user) throw new Error('Sesi berakhir, silakan masuk lagi.');

      const { data: business, error: businessError } = await supabaseClient
        .from('businesses')
        .insert({
          owner_id: user.id,
          name: state.businessName.trim(),
          type: state.businessType,
          timezone: state.timezone,
          currency: state.currency,
        })
        .select()
        .single();
      if (businessError || !business) {
        throw new Error(businessError?.message ?? 'Gagal membuat bisnis');
      }

      await supabaseClient.from('business_members').insert({
        business_id: business.id,
        user_id: user.id,
        role: 'owner',
      });

      const subscriptionResponse = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'starter',
          billingCycle: 'monthly',
          paymentProvider: 'manual',
        }),
      });
      if (!subscriptionResponse.ok) {
        throw new Error('Gagal menyiapkan langganan. Coba lagi.');
      }

      router.push('/billing');
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Gagal menyelesaikan setup',
        loading: false,
      }));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="flex w-full max-w-115 flex-col gap-6">
        <div className="flex justify-center">
          <Wordmark size={22} />
        </div>
        <div className="flex flex-col gap-6 rounded-2xl border border-hairline bg-surface-1 p-8">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-subtle">
              Langkah 1 dari 1
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">
              Buat bisnis pertamamu
            </h1>
            <p className="text-sm text-ink-muted">
              Atur sekali, langsung bisa jualan.
            </p>
          </div>

          {state.error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-error-light px-3.5 py-3 text-error">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <span className="text-[13.5px] font-medium">{state.error}</span>
            </div>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-ink">Nama bisnis</span>
            <input
              value={state.businessName}
              onChange={(event) =>
                setState((prev) => ({
                  ...prev,
                  businessName: event.target.value,
                }))
              }
              placeholder="Warung Kopi Senja"
              className={INPUT_CLASS}
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-ink">Tipe bisnis</span>
            <div className="grid grid-cols-2 gap-3">
              {TYPES.map((option) => {
                const Icon = option.icon;
                const selected = state.businessType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        businessType: option.value,
                      }))
                    }
                    className={cn(
                      'relative flex flex-col gap-2.5 rounded-xl border p-4 text-left transition-colors',
                      selected
                        ? 'border-accent bg-accent/10'
                        : 'border-hairline bg-surface-1 hover:bg-canvas'
                    )}
                  >
                    {selected && (
                      <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-accent text-surface-1">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    )}
                    <span
                      className={cn(
                        'flex size-11 items-center justify-center rounded-xl',
                        selected
                          ? 'bg-accent text-surface-1'
                          : 'bg-surface-2 text-ink-muted'
                      )}
                    >
                      <Icon className="size-5" strokeWidth={1.9} />
                    </span>
                    <span className="text-[15px] font-semibold text-ink">
                      {option.title}
                    </span>
                    <span className="text-[13px] text-ink-muted">
                      {option.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink">
                Zona waktu
              </span>
              <select
                value={state.timezone}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, timezone: event.target.value }))
                }
                className={INPUT_CLASS}
              >
                {TIMEZONES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-[13px] font-medium text-ink">
                Mata uang
              </span>
              <select
                value={state.currency}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, currency: event.target.value }))
                }
                className={INPUT_CLASS}
              >
                <option value="IDR">IDR — Rupiah</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleCreateBusiness}
            disabled={state.loading || !state.businessName.trim()}
            className="btn-accent h-11 w-full gap-2 disabled:opacity-50"
          >
            {state.loading ? 'Membuat…' : 'Lanjutkan'}
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
