import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { canProcessTransactions } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { TablesClient } from '@/components/features/tables/TablesClient/TablesClient';
import type { Business, UserRole } from '@/types/business';

export const metadata: Metadata = {
  title: 'Meja - Ngepos',
  description: 'Kelola denah meja dan pesanan untuk bisnis F&B',
  openGraph: {
    title: 'Meja - Ngepos',
    description: 'Kelola denah meja dan pesanan untuk bisnis F&B',
    url: 'https://ngepos.com/tables',
    siteName: 'Ngepos',
  },
};

interface TablesPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function TablesPage({ params }: TablesPageProps) {
  const { businessId } = await params;

  const { business, member } = await requireBusinessAccess(businessId);
  const typedBusiness = business as Business;
  const role = member.role as UserRole;

  if (typedBusiness.type !== 'fnb') {
    redirect(`/dashboard/${businessId}/pos`);
  }

  const features = await getBusinessPlanFeatures(businessId);

  if (!features.tableManagement) {
    return (
      <PageShell title="Meja" subtitle="Kelola denah meja dan pesanan per meja.">
        <NoticeCard
          title="Fitur Pro"
          description="Manajemen meja tersedia di paket Pro & Enterprise. Upgrade untuk mengaktifkan denah meja dan pesanan per meja."
        />
      </PageShell>
    );
  }

  if (!canProcessTransactions(role)) {
    return (
      <PageShell title="Meja" subtitle="Kelola denah meja dan pesanan per meja.">
        <NoticeCard
          title="Akses ditolak"
          description="Kamu tidak punya izin mengakses manajemen meja."
        />
      </PageShell>
    );
  }

  const canManage = role === 'owner' || role === 'manager';

  return <TablesClient businessId={businessId} canManage={canManage} />;
}
