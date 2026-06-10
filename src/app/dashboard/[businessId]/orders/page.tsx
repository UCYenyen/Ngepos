import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { canProcessTransactions } from '@/lib/permissions';
import { createServerClient } from '@/lib/supabase';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { OnlineOrdersClient } from '@/components/features/storefront/OnlineOrdersClient/OnlineOrdersClient';
import type { UserRole } from '@/types/business';
import type { OnlineOrder } from '@/types/storefront';

export const metadata: Metadata = {
  title: 'Pesanan Online - Ngepos',
  description: 'Kelola pesanan masuk dari storefront online.',
  openGraph: {
    title: 'Pesanan Online - Ngepos',
    description: 'Kelola pesanan masuk dari storefront online.',
    url: 'https://ngepos.com/orders',
    siteName: 'Ngepos',
  },
};

interface OrdersPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { businessId } = await params;
  const { member } = await requireBusinessAccess(businessId);
  const role = member.role as UserRole;

  if (!canProcessTransactions(role)) {
    return (
      <PageShell title="Pesanan Online" subtitle="Pesanan masuk dari storefront.">
        <NoticeCard
          title="Akses ditolak"
          description="Kamu tidak memiliki akses ke pesanan online."
        />
      </PageShell>
    );
  }

  const features = await getBusinessPlanFeatures(businessId);
  if (!features.onlineStore) {
    return (
      <PageShell title="Pesanan Online" subtitle="Pesanan masuk dari storefront.">
        <NoticeCard
          title="Fitur Pro / Enterprise"
          description="Tingkatkan paket untuk mengaktifkan storefront online dan menerima pesanan pelanggan."
        />
      </PageShell>
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const { data: orders } = await supabase
    .from('online_orders')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <PageShell
      title="Pesanan Online"
      subtitle="Konfirmasi dan kelola pesanan dari storefront."
    >
      <OnlineOrdersClient orders={(orders ?? []) as OnlineOrder[]} />
    </PageShell>
  );
}
