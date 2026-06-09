'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Building2, Check, CreditCard } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { PLANS, type PlanName } from '@/lib/plans';
import { formatCurrency, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface SubscriptionRow {
  plan: PlanName;
  status: string;
  period_end: string | null;
}

interface MemberRow {
  role: string;
}

interface InvoiceRow {
  id: string;
  plan: string;
  amount: number;
  status: string;
  created_at: string;
}

type Status = 'loading' | 'error' | 'ready';

const PLAN_ORDER: PlanName[] = ['starter', 'pro', 'enterprise'];

const PLAN_META: Record<
  PlanName,
  { label: string; price: string; per?: string; features: string[] }
> = {
  starter: {
    label: 'Starter',
    price: 'Gratis',
    features: ['1 bisnis', '100 produk', '2 staf'],
  },
  pro: {
    label: 'Pro',
    price: 'Rp 149rb',
    per: '/bln',
    features: [
      '5 bisnis',
      '1.000 produk',
      '10 staf',
      'Inventaris, Meja, Analitik & Laporan',
    ],
  },
  enterprise: {
    label: 'Enterprise',
    price: 'Hubungi',
    features: ['Bisnis tak terbatas', 'Produk & staf tak terbatas', 'Prioritas'],
  },
};

export function BillingClient() {
  const [status, setStatus] = useState<Status>('loading');
  const [plan, setPlan] = useState<PlanName>('starter');
  const [renewal, setRenewal] = useState<string | null>(null);
  const [ownedCount, setOwnedCount] = useState(0);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [changing, setChanging] = useState<PlanName | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setStatus('loading');
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();
      if (!user) {
        if (alive) setStatus('error');
        return;
      }
      try {
        const [{ data: sub }, { data: members }] = await Promise.all([
          supabaseClient
            .from('subscriptions')
            .select('plan, status, period_end')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabaseClient
            .from('business_members')
            .select('role')
            .eq('user_id', user.id),
        ]);
        if (!alive) return;
        const subscription = sub as SubscriptionRow | null;
        const active = subscription && subscription.status === 'active';
        setPlan(active ? subscription.plan : 'starter');
        setRenewal(active ? subscription.period_end : null);
        setOwnedCount(
          ((members as MemberRow[] | null) ?? []).filter(
            (member) => member.role === 'owner'
          ).length
        );

        const { data: invoiceRows } = await supabaseClient
          .from('invoices')
          .select('id, plan, amount, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(12);
        if (!alive) return;
        setInvoices((invoiceRows as InvoiceRow[] | null) ?? []);

        setStatus('ready');
      } catch {
        if (alive) setStatus('error');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const payment = new URLSearchParams(window.location.search).get('payment');
    if (payment === 'success') {
      toast.success('Pembayaran diterima. Paket aktif sebentar lagi.');
    } else if (payment === 'failed') {
      toast.error('Pembayaran dibatalkan atau gagal.');
    }
  }, []);

  async function choosePlan(target: PlanName) {
    if (target === plan || target === 'enterprise') return;
    setChanging(target);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: target,
          billingCycle: 'monthly',
          paymentProvider: 'xendit',
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal mengubah paket');
      }
      const data = (await response.json()) as { checkoutUrl?: string };
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }
      setPlan(target);
      toast.success(`Paket ${PLAN_META[target].label} aktif`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah paket');
    } finally {
      setChanging(null);
    }
  }

  const maxBusinesses = PLANS[plan].maxBusinesses;

  return (
    <div className="flex-1 overflow-auto px-6 py-8 md:px-10">
      <div className="mx-auto max-w-275">
        <header className="mb-7 flex flex-col gap-1.5">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Billing & Langganan
          </h1>
          <p className="text-ink-muted">
            Kelola paket, penggunaan, dan metode pembayaranmu.
          </p>
        </header>

        {status === 'loading' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        )}

        {status === 'error' && (
          <p className="rounded-xl border border-hairline bg-surface-1 px-5 py-12 text-center text-sm text-ink-muted">
            Gagal memuat data langganan.
          </p>
        )}

        {status === 'ready' && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-surface-1 p-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl font-semibold text-ink">
                      Paket {PLAN_META[plan].label}
                    </span>
                    <span className="badge badge-success gap-1.5">
                      <span className="size-1.5 rounded-full bg-success" />
                      {plan === 'starter' ? 'Gratis' : 'Aktif'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[13.5px] text-ink-muted">
                    <span>
                      {PLAN_META[plan].price}
                      {PLAN_META[plan].per ?? ''}
                    </span>
                    {renewal && (
                      <>
                        <span>·</span>
                        <span>Diperpanjang {formatDate(renewal)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {PLAN_ORDER.map((option) => {
                  const meta = PLAN_META[option];
                  const current = option === plan;
                  return (
                    <div
                      key={option}
                      className={cn(
                        'relative flex flex-col gap-4 rounded-xl border bg-surface-1 p-5',
                        current ? 'border-accent' : 'border-hairline'
                      )}
                    >
                      {current && (
                        <span className="absolute -top-2.5 left-5 inline-flex h-5 items-center rounded-full bg-accent px-2 text-[10px] font-bold uppercase text-surface-1">
                          Paket aktif
                        </span>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="text-[15px] font-semibold text-ink">
                          {meta.label}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-semibold tracking-tight text-ink">
                            {meta.price}
                          </span>
                          {meta.per && (
                            <span className="text-[13px] text-ink-muted">
                              {meta.per}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-2">
                        {meta.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-start gap-2 text-[12.5px] text-ink"
                          >
                            <Check
                              className="mt-0.5 size-3.5 shrink-0 text-accent"
                              strokeWidth={2.4}
                            />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <PlanButton
                        option={option}
                        current={current}
                        changing={changing === option}
                        onChoose={() => choosePlan(option)}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="overflow-hidden rounded-xl border border-hairline bg-surface-1">
                <div className="border-b border-hairline-soft px-5 py-4">
                  <span className="text-[15px] font-semibold text-ink">
                    Riwayat tagihan
                  </span>
                </div>
                {invoices.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-ink-muted">
                    Belum ada riwayat tagihan.
                  </p>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                        <th className="px-5 py-2.5">Tanggal</th>
                        <th className="px-5 py-2.5">Paket</th>
                        <th className="px-5 py-2.5 text-right">Jumlah</th>
                        <th className="px-5 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-t border-hairline-soft"
                        >
                          <td className="px-5 py-3 text-[13px] text-ink-muted">
                            {formatDate(invoice.created_at)}
                          </td>
                          <td className="px-5 py-3 text-[13px] capitalize text-ink">
                            {invoice.plan}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className="font-mono text-[13px] tabular-nums text-ink">
                              {formatCurrency(invoice.amount)}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={cn(
                                'badge',
                                invoice.status === 'paid'
                                  ? 'badge-success'
                                  : 'bg-surface-2 text-ink-muted'
                              )}
                            >
                              {invoice.status === 'paid'
                                ? 'Lunas'
                                : invoice.status === 'pending'
                                  ? 'Menunggu'
                                  : 'Gagal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6">
                <span className="text-[15px] font-semibold text-ink">
                  Penggunaan
                </span>
                <UsageMeter
                  label="Bisnis dimiliki"
                  value={ownedCount}
                  max={maxBusinesses}
                />
                <div className="border-t border-hairline-soft" />
                <div className="flex flex-col gap-1 text-[12.5px] text-ink-muted">
                  <span>
                    Produk:{' '}
                    {Number.isFinite(PLANS[plan].maxProductsPerBusiness)
                      ? PLANS[plan].maxProductsPerBusiness.toLocaleString('id-ID')
                      : 'tak terbatas'}{' '}
                    / bisnis
                  </span>
                  <span>
                    Staf:{' '}
                    {Number.isFinite(PLANS[plan].maxStaffPerBusiness)
                      ? PLANS[plan].maxStaffPerBusiness
                      : 'tak terbatas'}{' '}
                    / bisnis
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-surface-1 p-6">
                <span className="text-[15px] font-semibold text-ink">
                  Metode pembayaran
                </span>
                <div className="flex items-center gap-3 rounded-lg bg-canvas p-4">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-hairline bg-surface-1 text-ink-muted">
                    <CreditCard className="size-4.5" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[13.5px] font-semibold text-ink">
                      Transfer manual
                    </span>
                    <span className="text-[12px] text-ink-muted">
                      Konfirmasi pembayaran via admin Ngepos.
                    </span>
                  </div>
                </div>
                <p className="flex items-start gap-2 text-[12px] text-ink-muted">
                  <Building2 className="mt-0.5 size-3.5 shrink-0" />
                  Pembayaran gateway (Midtrans/Xendit) akan tersedia untuk
                  langganan otomatis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlanButton({
  option,
  current,
  changing,
  onChoose,
}: {
  option: PlanName;
  current: boolean;
  changing: boolean;
  onChoose: () => void;
}) {
  if (current) {
    return (
      <button type="button" disabled className="btn-secondary w-full opacity-60">
        Paket saat ini
      </button>
    );
  }
  if (option === 'enterprise') {
    return (
      <a
        href="mailto:sales@ngepos.com?subject=Enterprise%20Ngepos"
        className="btn-secondary w-full"
      >
        Hubungi kami
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onChoose}
      disabled={changing}
      className={cn(
        option === 'pro' ? 'btn-accent' : 'btn-primary',
        'w-full disabled:opacity-50'
      )}
    >
      {changing ? 'Memproses…' : option === 'pro' ? 'Upgrade' : 'Pilih'}
    </button>
  );
}

function UsageMeter({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const unlimited = !Number.isFinite(max);
  const pct = unlimited ? 0 : Math.min(100, (value / max) * 100);
  const near = pct > 80;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-mono tabular-nums text-ink-muted">
          {value} / {unlimited ? '∞' : max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn('h-full rounded-full', near ? 'bg-accent' : 'bg-ink')}
          style={{ width: `${unlimited ? 6 : pct}%` }}
        />
      </div>
    </div>
  );
}
