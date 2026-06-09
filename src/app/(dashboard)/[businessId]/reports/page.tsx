import type { Metadata } from 'next';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { canViewReports } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { ExportReports } from '@/components/features/reports/ExportReports/ExportReports';
import type { Business } from '@/types/business';

export const metadata: Metadata = {
  title: 'Reports - Ngepos',
  description: 'Export sales transaction reports',
  openGraph: {
    title: 'Reports - Ngepos',
    description: 'Export sales transaction reports',
    url: 'https://ngepos.com/reports',
    siteName: 'Ngepos',
  },
};

interface ReportsPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { businessId } = await params;

  const { business, member } = await requireBusinessAccess(businessId);
  const typedBusiness = business as Business;
  const features = await getBusinessPlanFeatures(businessId);

  return (
    <PageShell title="Reports" subtitle={typedBusiness.name}>
      {!canViewReports(member.role) ? (
        <NoticeCard
          title="Access denied"
          description="You do not have permission to export reports. Contact a business owner or manager for access."
        />
      ) : !features.automatedReports ? (
        <NoticeCard
          title="Fitur Pro"
          description="Laporan tersedia di paket Pro. Upgrade untuk mengekspor dan menjadwalkan laporan otomatis."
        />
      ) : (
        <ExportReports businessId={businessId} businessName={typedBusiness.name} />
      )}
    </PageShell>
  );
}
