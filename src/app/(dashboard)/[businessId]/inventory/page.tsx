import type { Metadata } from 'next';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { canManageInventory } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { StockList } from '@/components/features/inventory/StockList/StockList';
import type { Business } from '@/types/business';

export const metadata: Metadata = {
  title: 'Inventory - Ngepos',
  description: 'Stock management and inventory tracking',
  openGraph: {
    title: 'Inventory - Ngepos',
    description: 'Stock management and inventory tracking',
    url: 'https://ngepos.com/inventory',
    siteName: 'Ngepos',
  },
};

interface InventoryPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function InventoryPage({ params }: InventoryPageProps) {
  const { businessId } = await params;

  const { business, member } = await requireBusinessAccess(businessId);
  const typedBusiness = business as Business;

  const features = await getBusinessPlanFeatures(businessId);
  const hasInventoryFeature = features.inventory;

  return (
    <PageShell title="Inventory" subtitle={typedBusiness.name}>
      {!hasInventoryFeature ? (
        <NoticeCard
          title="Inventory requires the Pro plan"
          description="Stock management and inventory tracking are available on the Pro and Enterprise plans. Upgrade your subscription to start tracking your stock."
        />
      ) : !canManageInventory(member.role) ? (
        <NoticeCard
          title="Access denied"
          description="You do not have permission to manage inventory. Contact a business owner or manager for access."
        />
      ) : (
        <StockList businessId={businessId} />
      )}
    </PageShell>
  );
}
