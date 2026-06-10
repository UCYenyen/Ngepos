import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { AdminPlaceholder } from '@/components/features/platform-admin/AdminPlaceholder/AdminPlaceholder';

export const metadata: Metadata = {
  title: 'Pengguna - Admin Ngepos',
  description: 'Kelola pengguna terdaftar di platform Ngepos.',
};

export default function AdminUsersPage() {
  return (
    <AdminPlaceholder
      title="Pengguna"
      subtitle="Semua pengguna yang terdaftar di platform."
      icon={Users}
      message="Daftar pengguna dan pemilik bisnis akan tampil di sini."
    />
  );
}
