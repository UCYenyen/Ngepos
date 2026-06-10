import type { ReactNode } from 'react';
import {
  requireBusinessAccess,
  getBusinessPlanFeatures,
  getUserBusinesses,
  getCurrentUser,
} from '@/lib/auth';
import { getNavItems } from '@/lib/navigation';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import type { SwitcherBusiness } from '@/components/layout/BusinessSwitcher/types';
import type { Business, UserRole } from '@/types/business';

interface BusinessLayoutProps {
  children: ReactNode;
  params: Promise<{ businessId: string }>;
}

export default async function BusinessLayout({
  children,
  params,
}: BusinessLayoutProps) {
  const { businessId } = await params;

  const { business, member } = await requireBusinessAccess(businessId);
  const typedBusiness = business as Business;
  const role = member.role as UserRole;

  const features = await getBusinessPlanFeatures(businessId);
  const items = getNavItems({
    businessId,
    role,
    businessType: typedBusiness.type,
    features,
  });

  const user = await getCurrentUser();
  const rawBusinesses = await getUserBusinesses();
  const businesses: SwitcherBusiness[] = (
    rawBusinesses as unknown as (Business | Business[] | null)[]
  )
    .map((entry) => (Array.isArray(entry) ? entry[0] : entry))
    .filter((entry): entry is Business => Boolean(entry))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      type: entry.type,
      logoUrl: entry.logo_url ?? null,
    }));

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email ??
    'Pengguna';

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar
        current={{
          id: typedBusiness.id,
          name: typedBusiness.name,
          type: typedBusiness.type,
          logoUrl: typedBusiness.logo_url ?? null,
        }}
        businesses={businesses}
        items={items}
        user={{ name: displayName, email: user?.email ?? '', role }}
      />
      <div className="flex flex-1 flex-col overflow-auto">{children}</div>
    </div>
  );
}
