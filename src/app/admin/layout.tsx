import { requirePlatformAdmin } from '@/lib/platform-admin';
import { AdminShell } from '@/components/features/platform-admin/AdminShell/AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePlatformAdmin();
  return <AdminShell>{children}</AdminShell>;
}
