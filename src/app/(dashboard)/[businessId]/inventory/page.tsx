import type { Metadata } from 'next';
import { requireBusinessAccess, getCurrentSubscription } from '@/lib/auth';
import { getPlanConfig } from '@/lib/plans';
import { canManageInventory } from '@/lib/permissions';
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

  const subscription = await getCurrentSubscription();
  const hasInventoryFeature =
    subscription !== null && getPlanConfig(subscription.plan).features.inventory;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-wrapper py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-ink">Inventory</h1>
          <p className="mt-1 text-ink-muted">{typedBusiness.name}</p>
        </header>

        {!hasInventoryFeature ? (
          <div className="card max-w-2xl">
            <h2 className="text-xl font-semibold text-ink">
              Inventory requires the Pro plan
            </h2>
            <p className="mt-2 text-ink-muted">
              Stock management and inventory tracking are available on the Pro
              and Enterprise plans. Upgrade your subscription to start tracking
              your stock.
            </p>
          </div>
        ) : !canManageInventory(member.role) ? (
          <div className="card max-w-2xl">
            <h2 className="text-xl font-semibold text-ink">Access denied</h2>
            <p className="mt-2 text-ink-muted">
              You do not have permission to manage inventory. Contact a business
              owner or manager for access.
            </p>
          </div>
        ) : (
          <StockList businessId={businessId} />
        )}
      </div>
    </div>
  );
}
