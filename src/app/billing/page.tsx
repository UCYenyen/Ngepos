import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { AccountTopbar } from '@/components/layout/AccountTopbar/AccountTopbar';
import { BillingClient } from '@/components/features/billing/BillingClient/BillingClient';

export const metadata: Metadata = {
  title: 'Billing - Ngepos',
  description: 'Kelola paket langganan, penggunaan, dan pembayaran Ngepos',
  openGraph: {
    title: 'Billing - Ngepos',
    description: 'Kelola paket langganan, penggunaan, dan pembayaran Ngepos',
    url: 'https://ngepos.com/billing',
    siteName: 'Ngepos',
  },
};

export default async function BillingPage() {
  await requireAuth();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <AccountTopbar active="billing" />
      <BillingClient />
    </div>
  );
}
