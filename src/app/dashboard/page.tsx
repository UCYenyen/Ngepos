import type { Metadata } from 'next';
import { AccountTopbar } from '@/components/layout/AccountTopbar/AccountTopbar';
import { BusinessesList } from '@/components/features/dashboard/BusinessesList/BusinessesList';

export const metadata: Metadata = {
  title: 'Bisnismu - Ngepos',
  description: 'Kelola semua bisnis Ngepos kamu dari satu tempat',
  openGraph: {
    title: 'Bisnismu - Ngepos',
    description: 'Kelola semua bisnis Ngepos kamu dari satu tempat',
    url: 'https://ngepos.com/dashboard',
    siteName: 'Ngepos',
  },
};

export default function DashboardPage() {
  return (
    <div className="flex h-full flex-col">
      <AccountTopbar active="dashboard" />
      <BusinessesList />
    </div>
  );
}
