import type { Metadata } from 'next';
import { BusinessesList } from '@/components/dashboard/BusinessesList';

export const metadata: Metadata = {
  title: 'Dashboard - Ngepos',
  description: 'Manage your businesses with Ngepos POS system',
  openGraph: {
    title: 'Dashboard - Ngepos',
    description: 'Manage your businesses',
    url: 'https://ngepos.com/dashboard',
    siteName: 'Ngepos',
  },
};

export default function DashboardPage() {
  return <BusinessesList />;
}
