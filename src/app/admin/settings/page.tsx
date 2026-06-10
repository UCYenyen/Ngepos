import type { Metadata } from 'next';
import { Settings } from 'lucide-react';
import { AdminPlaceholder } from '@/components/features/platform-admin/AdminPlaceholder/AdminPlaceholder';

export const metadata: Metadata = {
  title: 'Pengaturan - Admin Ngepos',
  description: 'Pengaturan platform Ngepos.',
};

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholder
      title="Pengaturan"
      subtitle="Konfigurasi platform dan daftar admin."
      icon={Settings}
      message="Pengaturan platform dan manajemen admin akan tampil di sini."
    />
  );
}
