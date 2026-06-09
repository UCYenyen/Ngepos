import type { Metadata } from 'next';
import { requireAuth } from '@/lib/auth';
import { AccountTopbar } from '@/components/layout/AccountTopbar/AccountTopbar';
import { AccountClient } from '@/components/features/account/AccountClient/AccountClient';

export const metadata: Metadata = {
  title: 'Akun - Ngepos',
  description: 'Kelola profil dan keamanan akun Ngepos kamu',
  openGraph: {
    title: 'Akun - Ngepos',
    description: 'Kelola profil dan keamanan akun Ngepos kamu',
    url: 'https://ngepos.com/account',
    siteName: 'Ngepos',
  },
};

export default async function AccountPage() {
  await requireAuth();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <AccountTopbar active="account" />
      <AccountClient />
    </div>
  );
}
