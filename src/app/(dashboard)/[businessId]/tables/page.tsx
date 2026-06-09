import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import type { Business } from '@/types/business';

export const metadata: Metadata = {
  title: 'Meja - Ngepos',
  description: 'Manajemen meja untuk bisnis F&B',
  openGraph: {
    title: 'Meja - Ngepos',
    description: 'Manajemen meja untuk bisnis F&B',
    url: 'https://ngepos.com/tables',
    siteName: 'Ngepos',
  },
};

interface TablesPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function TablesPage({ params }: TablesPageProps) {
  const { businessId } = await params;

  const { business } = await requireBusinessAccess(businessId);
  const typedBusiness = business as Business;

  if (typedBusiness.type !== 'fnb') {
    redirect(`/${businessId}/pos`);
  }

  const features = await getBusinessPlanFeatures(businessId);

  return (
    <PageShell title="Meja" subtitle={typedBusiness.name}>
      {!features.tableManagement ? (
        <NoticeCard
          title="Fitur Pro"
          description="Manajemen meja tersedia di paket Pro. Upgrade untuk mengaktifkan denah meja dan pesanan per meja."
        />
      ) : (
        <NoticeCard
          title="Segera hadir"
          description="Denah meja dan pesanan per meja sedang disiapkan dan akan tersedia di sini."
        />
      )}
    </PageShell>
  );
}
