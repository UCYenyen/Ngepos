import type { Metadata } from 'next';
import { requireBusinessAccess } from '@/lib/auth';
import { canManageStaff } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { StaffList } from '@/components/features/staff/StaffList/StaffList';
import type { UserRole } from '@/types/business';

export const metadata: Metadata = {
  title: 'Staf - Ngepos',
  description: 'Kelola tim, peran, dan undangan staf',
  openGraph: {
    title: 'Staf - Ngepos',
    description: 'Kelola tim, peran, dan undangan staf',
    url: 'https://ngepos.com/staff',
    siteName: 'Ngepos',
  },
};

interface StaffPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function StaffPage({ params }: StaffPageProps) {
  const { businessId } = await params;

  const { member } = await requireBusinessAccess(businessId);
  const role = member.role as UserRole;

  if (!canManageStaff(role)) {
    return (
      <PageShell title="Staf" subtitle="Kelola tim, peran, dan undangan.">
        <NoticeCard
          title="Akses ditolak"
          description="Hanya pemilik bisnis yang dapat mengelola staf. Hubungi pemilik untuk perubahan peran atau undangan."
        />
      </PageShell>
    );
  }

  return <StaffList businessId={businessId} />;
}
