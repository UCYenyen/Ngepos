import type { Metadata } from 'next';
import { requireBusinessAccess } from '@/lib/auth';
import { canViewReports } from '@/lib/permissions';
import { PageShell } from '@/components/common/PageShell/PageShell';
import { NoticeCard } from '@/components/common/NoticeCard/NoticeCard';
import { TransactionHistoryClient } from '@/components/features/history/TransactionHistoryClient/TransactionHistoryClient';
import type { Business, UserRole } from '@/types/business';

export const metadata: Metadata = {
  title: 'Riwayat - Ngepos',
  description: 'Riwayat transaksi penjualan dan cetak ulang struk',
  openGraph: {
    title: 'Riwayat - Ngepos',
    description: 'Riwayat transaksi penjualan dan cetak ulang struk',
    url: 'https://ngepos.com/history',
    siteName: 'Ngepos',
  },
};

interface HistoryPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { businessId } = await params;

  const { business, member } = await requireBusinessAccess(businessId);
  const role = member.role as UserRole;

  return (
    <PageShell
      title="Riwayat"
      subtitle="Transaksi penjualan terbaru. Klik untuk lihat detail & cetak ulang."
    >
      {!canViewReports(role) ? (
        <NoticeCard
          title="Akses ditolak"
          description="Kamu tidak punya izin melihat riwayat transaksi. Hubungi pemilik atau manajer bisnis."
        />
      ) : (
        <TransactionHistoryClient
          businessId={businessId}
          business={business as Business}
        />
      )}
    </PageShell>
  );
}
