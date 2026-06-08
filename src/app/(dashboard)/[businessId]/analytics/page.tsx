import type { Metadata } from 'next';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { canViewAnalytics } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { AnalyticsClient } from '@/components/features/analytics/AnalyticsClient/AnalyticsClient';
import type { Business } from '@/types/business';

export const metadata: Metadata = {
  title: 'Analytics - Ngepos',
  description: 'Sales analytics and performance dashboard',
  openGraph: {
    title: 'Analytics - Ngepos',
    description: 'Sales analytics and performance dashboard',
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

  const features = await getBusinessPlanFeatures(businessId);
  const hasAnalytics = features.analytics;

  return (
    <PageShell title="Analytics" subtitle={typedBusiness.name}>
      {!hasAnalytics ? (
        <NoticeCard
          title="Analytics requires the Pro plan"
          description="Sales analytics and the performance dashboard are available on the Pro and Enterprise plans. Upgrade your subscription to unlock insights."
        />
      ) : !canViewAnalytics(member.role) ? (
        <NoticeCard
          title="Access denied"
          description="You do not have permission to view analytics. Contact a business owner or manager for access."
        />
      ) : (
        <AnalyticsClient businessId={businessId} />
      )}
    </PageShell>
  );
}
