import type { Metadata } from 'next';
import { Receipt } from 'lucide-react';
import { AdminPlaceholder } from '@/components/features/platform-admin/AdminPlaceholder/AdminPlaceholder';

export const metadata: Metadata = {
  title: 'Pembayaran - Admin Ngepos',
  description: 'Pantau pembayaran dan invoice platform Ngepos.',
};

export default function AdminPaymentsPage() {
  return (
    <AdminPlaceholder
      title="Pembayaran"
      subtitle="Invoice dan pembayaran langganan."
      icon={Receipt}
      message="Riwayat invoice dan status pembayaran akan tampil di sini."
    />
  );
}
