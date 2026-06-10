import type { Metadata } from 'next';
import { LayoutDashboard } from 'lucide-react';
import { AdminPlaceholder } from '@/components/features/platform-admin/AdminPlaceholder/AdminPlaceholder';

export const metadata: Metadata = {
  title: 'Dasbor Admin - Ngepos',
  description: 'Ringkasan metrik platform Ngepos.',
};

export default function AdminDashboardPage() {
  return (
    <AdminPlaceholder
      title="Dasbor"
      subtitle="Ringkasan metrik platform Ngepos."
      icon={LayoutDashboard}
      message="Metrik platform (bisnis aktif, pendapatan, langganan) akan tampil di sini."
    />
  );
}
