import type { Metadata } from 'next';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { canAccessBusinessSettings } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { ReportSettings } from '@/components/features/settings/ReportSettings/ReportSettings';
import type { Business } from '@/types/business';

export const metadata: Metadata = {
  title: 'Settings - Ngepos',
  description: 'Business settings and automated report configuration',
  openGraph: {
    title: 'Settings - Ngepos',
    description: 'Business settings and automated report configuration',
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

  if (!canAccessBusinessSettings(member.role)) {
    return (
      <PageShell title="Settings" subtitle={typedBusiness.name}>
        <NoticeCard
          title="Access denied"
          description="Only the business owner can manage settings."
        />
      </PageShell>
    );
  }

  const features = await getBusinessPlanFeatures(businessId);
  const planHasAutomatedReports = features.automatedReports;

  return (
    <PageShell title="Settings" subtitle={typedBusiness.name}>
      <ReportSettings
        businessId={businessId}
        planHasAutomatedReports={planHasAutomatedReports}
      />
    </PageShell>
  );
}
