import type { Metadata } from 'next';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import { canManageInventory } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { StockList } from '@/components/features/inventory/StockList/StockList';
import type { UserRole } from '@/types/business';

export const metadata: Metadata = {
  title: 'Inventaris - Ngepos',
  description: 'Pantau dan sesuaikan stok produk secara real-time',
  openGraph: {
    title: 'Inventaris - Ngepos',
    description: 'Pantau dan sesuaikan stok produk secara real-time',
    url: 'https://ngepos.com/inventory',
    siteName: 'Ngepos',
  },
};

interface InventoryPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function InventoryPage({ params }: InventoryPageProps) {
  const { businessId } = await params;

  const { member } = await requireBusinessAccess(businessId);
  const role = member.role as UserRole;

  const features = await getBusinessPlanFeatures(businessId);

  return (
    <PageShell
      title="Inventaris"
      subtitle="Pantau dan sesuaikan stok produk secara real-time."
    >
      {!features.inventory ? (
        <NoticeCard
          title="Fitur Pro"
          description="Lacak stok real-time, alert stok menipis, dan riwayat pergerakan barang tersedia di paket Pro & Enterprise. Upgrade untuk mengaktifkan."
        />
      ) : !canManageInventory(role) ? (
        <NoticeCard
          title="Akses ditolak"
          description="Kamu tidak punya izin mengelola inventaris. Hubungi pemilik atau manajer bisnis."
        />
      ) : (
        <StockList businessId={businessId} />
      )}
    </PageShell>
  );
}
