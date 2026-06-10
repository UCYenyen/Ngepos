import type { Metadata } from 'next';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { canAccessBusinessSettings } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { SettingsClient } from '@/components/features/settings/SettingsClient/SettingsClient';
import type { Business, UserRole } from '@/types/business';

export const metadata: Metadata = {
  title: 'Pengaturan - Ngepos',
  description: 'Kelola profil bisnis, pembayaran QRIS, dan laporan otomatis',
  openGraph: {
    title: 'Pengaturan - Ngepos',
    description: 'Kelola profil bisnis, pembayaran QRIS, dan laporan otomatis',
    url: 'https://ngepos.com/settings',
    siteName: 'Ngepos',
  },
};

interface SettingsPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { businessId } = await params;

  const { business, member } = await requireBusinessAccess(businessId);
  const typedBusiness = business as Business;
  const role = member.role as UserRole;

  if (!canAccessBusinessSettings(role)) {
    return (
      <PageShell
        title="Pengaturan"
        subtitle="Kelola profil bisnis, pembayaran, dan preferensi."
      >
        <NoticeCard
          title="Akses ditolak"
          description="Hanya pemilik bisnis yang dapat mengelola pengaturan."
        />
      </PageShell>
    );
  }

  const features = await getBusinessPlanFeatures(businessId);

  return (
    <PageShell
      title="Pengaturan"
      subtitle="Kelola profil bisnis, pembayaran, dan preferensi."
    >
      <SettingsClient
        business={typedBusiness}
        planHasAutomatedReports={features.automatedReports}
        planHasOnlineStore={features.onlineStore}
      />
    </PageShell>
  );
}
