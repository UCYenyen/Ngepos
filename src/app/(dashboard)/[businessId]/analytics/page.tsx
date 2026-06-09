import type { Metadata } from 'next';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { canViewAnalytics } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { AnalyticsClient } from '@/components/features/analytics/AnalyticsClient/AnalyticsClient';
import type { Business, UserRole } from '@/types/business';

export const metadata: Metadata = {
  title: 'Analitik - Ngepos',
  description: 'Dashboard analitik dan performa penjualan',
  openGraph: {
    title: 'Analitik - Ngepos',
    description: 'Dashboard analitik dan performa penjualan',
    url: 'https://ngepos.com/analytics',
    siteName: 'Ngepos',
  },
};

interface AnalyticsPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { businessId } = await params;

  const { business, member } = await requireBusinessAccess(businessId);
  const typedBusiness = business as Business;
  const role = member.role as UserRole;

  const features = await getBusinessPlanFeatures(businessId);

  if (!features.analytics) {
    return (
      <PageShell title="Analitik" subtitle="Pahami performa bisnismu dengan data.">
        <NoticeCard
          title="Fitur Pro"
          description="Dashboard analitik lengkap — revenue, produk terlaris, kinerja kasir, dan tren penjualan — tersedia di paket Pro & Enterprise. Upgrade untuk membuka."
        />
      </PageShell>
    );
  }

  if (!canViewAnalytics(role)) {
    return (
      <PageShell title="Analitik" subtitle="Pahami performa bisnismu dengan data.">
        <NoticeCard
          title="Akses ditolak"
          description="Kamu tidak punya izin melihat analitik. Hubungi pemilik atau manajer bisnis."
        />
      </PageShell>
    );
  }

  return (
    <AnalyticsClient businessId={businessId} businessName={typedBusiness.name} />
  );
}
