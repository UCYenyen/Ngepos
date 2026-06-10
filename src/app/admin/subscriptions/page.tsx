import type { Metadata } from 'next';
import { CreditCard } from 'lucide-react';
import { AdminPlaceholder } from '@/components/features/platform-admin/AdminPlaceholder/AdminPlaceholder';

export const metadata: Metadata = {
  title: 'Langganan - Admin Ngepos',
  description: 'Pantau langganan di platform Ngepos.',
};

export default function AdminSubscriptionsPage() {
  return (
    <AdminPlaceholder
      title="Langganan"
      subtitle="Status langganan seluruh pelanggan."
      icon={CreditCard}
      message="Langganan aktif, jatuh tempo, dan riwayat paket akan tampil di sini."
    />
  );
}
