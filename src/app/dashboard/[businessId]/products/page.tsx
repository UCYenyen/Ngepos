import type { Metadata } from 'next';
import { requireBusinessAccess, getBusinessPlan } from '@/lib/auth';
import { getPlanConfig } from '@/lib/plans';
import { canManageProducts } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { ProductsClient } from '@/components/features/products/ProductsClient/ProductsClient';
import type { Business, UserRole } from '@/types/business';

export const metadata: Metadata = {
  title: 'Produk - Ngepos',
  description: 'Kelola katalog, kategori, dan varian produkmu',
  openGraph: {
    title: 'Produk - Ngepos',
    description: 'Kelola katalog, kategori, dan varian produkmu',
    url: 'https://ngepos.com/products',
    siteName: 'Ngepos',
  },
};

interface ProductsPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function ProductsPage({ params }: ProductsPageProps) {
  const { businessId } = await params;

  const { business, member } = await requireBusinessAccess(businessId);
  const typedBusiness = business as Business;
  const role = member.role as UserRole;

  if (!canManageProducts(role)) {
    return (
      <PageShell title="Produk" subtitle={typedBusiness.name}>
        <NoticeCard
          title="Akses ditolak"
          description="Kamu tidak punya izin mengelola produk. Hubungi pemilik atau manajer bisnis."
        />
      </PageShell>
    );
  }

  const plan = await getBusinessPlan(businessId);
  const maxProducts = getPlanConfig(plan).maxProductsPerBusiness;

  return <ProductsClient businessId={businessId} maxProducts={maxProducts} />;
}
