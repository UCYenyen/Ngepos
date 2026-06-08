import type { Metadata } from 'next';
import { requireBusinessAccess } from '@/lib/auth';
import { canManageStaff } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { StaffList } from '@/components/features/staff/StaffList/StaffList';
import type { Business } from '@/types/business';

export const metadata: Metadata = {
  title: 'Staff - Ngepos',
  description: 'Staff management and role assignments',
  openGraph: {
    title: 'Staff - Ngepos',
    description: 'Staff management and role assignments',
    url: 'https://ngepos.com/staff',
    siteName: 'Ngepos',
  },
};

interface StaffPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { businessId } = await params;

  const { business, member } = await requireBusinessAccess(businessId);
  const typedBusiness = business as Business;

  return (
    <PageShell title="Staff" subtitle={typedBusiness.name}>
      {!canManageStaff(member.role) ? (
        <NoticeCard
          title="Access denied"
          description="Only the business owner can manage staff. Contact your business owner to request changes to staff roles or invitations."
        />
      ) : (
        <StaffList businessId={businessId} />
      )}
    </PageShell>
  );
}
