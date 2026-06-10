import type { Metadata } from 'next';
import { Building2 } from 'lucide-react';
import { AdminPlaceholder } from '@/components/features/platform-admin/AdminPlaceholder/AdminPlaceholder';

export const metadata: Metadata = {
  title: 'Bisnis - Admin Ngepos',
  description: 'Kelola bisnis yang terdaftar di platform Ngepos.',
};

export default function AdminBusinessesPage() {
  return (
    <AdminPlaceholder
      title="Bisnis"
      subtitle="Semua bisnis yang terdaftar di platform."
      icon={Building2}
      message="Daftar bisnis lintas tenant akan tampil di sini."
    />
  );
}
