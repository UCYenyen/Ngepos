import type { Metadata } from 'next';
import { requireBusinessAccess } from '@/lib/auth';
import { canManageStaff } from '@/lib/permissions';
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
    <div className="min-h-screen bg-canvas">
      <div className="container-wrapper py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-ink">Staff</h1>
          <p className="mt-1 text-ink-muted">{typedBusiness.name}</p>
        </header>

        {!canManageStaff(member.role) ? (
          <div className="card max-w-2xl">
            <h2 className="text-xl font-semibold text-ink">Access denied</h2>
            <p className="mt-2 text-ink-muted">
              Only the business owner can manage staff. Contact your business
              owner to request changes to staff roles or invitations.
            </p>
          </div>
        ) : (
          <StaffList businessId={businessId} />
        )}
      </div>
    </div>
  );
}
