import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { AccountTopbar } from '@/components/layout/AccountTopbar/AccountTopbar';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';

export const metadata: Metadata = {
  title: 'Billing - Ngepos',
  description: 'Kelola langganan dan pembayaran Ngepos kamu',
  openGraph: {
    title: 'Billing - Ngepos',
    description: 'Kelola langganan dan pembayaran Ngepos kamu',
    url: 'https://ngepos.com/billing',
    siteName: 'Ngepos',
  },
};

export default async function BillingPage() {
  await requireAuth();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <AccountTopbar active="billing" />
      <div className="flex-1 overflow-auto px-6 py-8 md:px-10">
        <div className="mx-auto max-w-275">
          <header className="mb-7 flex flex-col gap-1.5">
            <h1 className="text-3xl font-semibold tracking-tight text-ink">
              Billing
            </h1>
            <p className="text-ink-muted">
              Kelola langganan, paket, dan metode pembayaran.
            </p>
          </header>
          <NoticeCard
            title="Segera hadir"
            description="Manajemen langganan, perbandingan paket, meteran pemakaian, dan riwayat invoice sedang disiapkan."
          />
        </div>
      </div>
    </div>
  );
}
