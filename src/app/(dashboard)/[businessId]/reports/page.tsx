import type { Metadata } from 'next';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { canViewReports } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { ExportReports } from '@/components/features/reports/ExportReports/ExportReports';
import type { Business, UserRole } from '@/types/business';

export const metadata: Metadata = {
  title: 'Laporan - Ngepos',
  description: 'Ringkasan performa bisnis dan ekspor laporan PDF/CSV',
  openGraph: {
    title: 'Laporan - Ngepos',
    description: 'Ringkasan performa bisnis dan ekspor laporan PDF/CSV',
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
  const role = member.role as UserRole;
  const features = await getBusinessPlanFeatures(businessId);

  return (
    <PageShell
      title="Laporan"
      subtitle="Ringkasan performa bisnis untuk periode tertentu."
    >
      {!canViewReports(role) ? (
        <NoticeCard
          title="Akses ditolak"
          description="Kamu tidak punya izin mengakses laporan. Hubungi pemilik atau manajer bisnis."
        />
      ) : !features.automatedReports ? (
        <NoticeCard
          title="Fitur Pro"
          description="Buat dan unduh laporan PDF & CSV, plus laporan otomatis via Email & WhatsApp. Tersedia di paket Pro & Enterprise."
        />
      ) : (
        <ExportReports businessId={businessId} businessName={typedBusiness.name} />
      )}
    </PageShell>
  );
}
