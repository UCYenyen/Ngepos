'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, RefreshCw } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { BusinessCard } from '@/components/features/dashboard/BusinessCard/BusinessCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PLANS, type PlanName } from '@/lib/plans';
import type { Business, UserRole } from '@/types/business';

interface DashboardBusiness {
  id: string;
  name: string;
  type: Business['type'];
  role: UserRole;
  logoUrl: string | null;
}

interface MemberRow {
  role: UserRole;
  businesses: Business | Business[] | null;
}

type Status = 'loading' | 'error' | 'ready';

const PLAN_LABEL: Record<PlanName, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export function BusinessesList() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('loading');
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [plan, setPlan] = useState<PlanName>('starter');

  useEffect(() => {
    let alive = true;

    async function load() {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const { data: rows, error } = await supabaseClient
          .from('business_members')
          .select('role, business_id, businesses(*)')
          .eq('user_id', user.id);
        if (error) throw error;
        if (!alive) return;

        const list = (rows ?? [])
          .map((row) => {
            const member = row as MemberRow;
            const biz = Array.isArray(member.businesses)
              ? member.businesses[0]
              : member.businesses;
            if (!biz) return null;
            return {
              id: biz.id,
              name: biz.name,
              type: biz.type,
              role: member.role,
              logoUrl: biz.logo_url ?? null,
            } satisfies DashboardBusiness;
          })
          .filter((b): b is DashboardBusiness => b !== null);

        const { data: sub } = await supabaseClient
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!alive) return;

        const resolvedPlan =
          sub && (sub as { status: string }).status === 'active'
            ? (sub as { plan: PlanName }).plan
            : 'starter';

        setBusinesses(list);
        setPlan(resolvedPlan);
        setStatus('ready');
      } catch {
        if (alive) setStatus('error');
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [router]);

  const ownedCount = businesses.filter((b) => b.role === 'owner').length;
  const maxBusinesses = PLANS[plan].maxBusinesses;
  const unlimited = maxBusinesses === Infinity;
  const atLimit = !unlimited && ownedCount >= maxBusinesses;
  const remaining = unlimited ? 0 : Math.max(0, maxBusinesses - ownedCount);

  const subtitle = unlimited
    ? 'Kelola semua bisnis dari satu tempat.'
    : `${ownedCount} dari ${maxBusinesses} bisnis terpakai.`;

  return (
    <div className="flex-1 overflow-auto px-6 py-8 md:px-10">
      <div className="mx-auto max-w-275">
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              Bisnismu
            </h1>
            {status === 'ready' ? (
              <p className="text-ink-muted">{subtitle}</p>
            ) : (
              <Skeleton className="h-5 w-56" />
            )}
          </div>
          {status === 'ready' &&
            (atLimit ? (
              <Tooltip>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  <button
                    type="button"
                    disabled
                    className="btn-accent cursor-not-allowed gap-2 opacity-50"
                  >
                    <Plus className="size-4.5" />
                    Buat bisnis baru
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Limit paket {PLAN_LABEL[plan]} tercapai. Upgrade untuk menambah
                  bisnis.
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                type="button"
                onClick={() => router.push('/onboarding')}
                className="btn-accent gap-2"
              >
                <Plus className="size-4.5" />
                Buat bisnis baru
              </button>
            ))}
        </header>

        {status === 'loading' && <LoadingGrid />}
        {status === 'error' && <ErrorState />}
        {status === 'ready' && businesses.length === 0 && (
          <EmptyState onCreate={() => router.push('/onboarding')} />
        )}
        {status === 'ready' && businesses.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <BusinessCard key={business.id} {...business} />
            ))}
            {!atLimit && (
              <button
                type="button"
                onClick={() => router.push('/onboarding')}
                className="flex min-h-50 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed border-hairline text-ink-muted transition-colors hover:border-ink-subtle hover:text-ink"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-surface-2">
                  <Plus className="size-5" />
                </span>
                <span className="text-sm font-semibold">Buat bisnis baru</span>
                {!unlimited && (
                  <span className="text-xs">{remaining} slot tersisa</span>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {['a', 'b', 'c'].map((key) => (
        <div
          key={key}
          className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-5"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="size-12 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

function ErrorState() {
  return (
    <div className="card max-w-md">
      <h2 className="text-lg font-semibold text-ink">Gagal memuat bisnis</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Terjadi kesalahan saat memuat data bisnismu. Coba muat ulang halaman.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="btn-secondary mt-4 gap-2"
      >
        <RefreshCw className="size-4" />
        Muat ulang
      </button>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <span className="flex size-18 items-center justify-center rounded-modal border border-hairline bg-surface-1 text-ink-subtle">
        <Building2 className="size-8" strokeWidth={1.6} />
      </span>
      <div className="flex max-w-sm flex-col gap-2">
        <h2 className="text-2xl font-semibold text-ink">Belum ada bisnis</h2>
        <p className="text-ink-muted">
          Buat bisnis pertamamu untuk mulai berjualan. Setup hanya butuh beberapa
          menit.
        </p>
      </div>
      <button type="button" onClick={onCreate} className="btn-accent gap-2">
        <Plus className="size-4.5" />
        Buat bisnis pertama
      </button>
    </div>
  );
}
