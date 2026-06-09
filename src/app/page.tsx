import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Landing } from '@/components/features/landing/Landing/Landing';

export const metadata: Metadata = {
  title: 'Ngepos — Kasir digital untuk UMKM Indonesia',
  description:
    'POS, stok, laporan & analitik dalam satu aplikasi kasir untuk F&B dan retail.',
  openGraph: {
    title: 'Ngepos — Kasir digital untuk UMKM Indonesia',
    description:
      'POS, stok, laporan & analitik dalam satu aplikasi kasir untuk F&B dan retail.',
    url: 'https://ngepos.com',
    siteName: 'Ngepos',
  },
};

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return <Landing />;
}
