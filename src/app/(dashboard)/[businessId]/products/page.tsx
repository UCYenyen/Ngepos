import type { Metadata } from 'next';
import { requireBusinessAccess } from '@/lib/auth';
import { canManageProducts } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import type { Business, UserRole } from '@/types/business';

export const metadata: Metadata = {
  title: 'Produk - Ngepos',
  description: 'Kelola produk dan kategori bisnismu',
  openGraph: {
    title: 'Produk - Ngepos',
    description: 'Kelola produk dan kategori bisnismu',
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

  return (
    <PageShell title="Produk" subtitle={typedBusiness.name}>
      {!canManageProducts(role) ? (
        <NoticeCard
          title="Akses ditolak"
          description="Kamu tidak punya izin mengelola produk. Hubungi pemilik atau manajer bisnis."
        />
      ) : (
        <NoticeCard
          title="Segera hadir"
          description="Manajemen produk & kategori sedang disiapkan dan akan tersedia di sini."
        />
      )}
    </PageShell>
  );
}
