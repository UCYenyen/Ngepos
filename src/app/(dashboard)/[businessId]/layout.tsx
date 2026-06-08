import type { ReactNode } from 'react';
import { requireBusinessAccess, getCurrentSubscription } from '@/lib/auth';
import { getPlanConfig } from '@/lib/plans';
import { getNavItems } from '@/lib/navigation';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import type { Business } from '@/types/business';

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

  const subscription = await getCurrentSubscription();
  const features = subscription
    ? getPlanConfig(subscription.plan).features
    : getPlanConfig('starter').features;

  const items = getNavItems({
    businessId,
    role: member.role,
    businessType: typedBusiness.type,
    features,
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar businessName={typedBusiness.name} items={items} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
