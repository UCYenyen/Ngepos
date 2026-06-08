import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Ngepos - POS System',
  description: 'Multi-tenant point of sale system for retail and F&B',
};

export default async function HomePage() {
  const user = await getCurrentUser();

  // Authenticated users go to dashboard
  if (user) {
    redirect('/dashboard');
  }

  // Unauthenticated users go to signup
  redirect('/signup');
}
