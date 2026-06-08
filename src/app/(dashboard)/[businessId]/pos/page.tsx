import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireBusinessAccess } from '@/lib/auth';
import POSClient from '@/components/features/pos/POSClient/POSClient';

export const metadata: Metadata = {
  title: 'POS - Ngepos',
  description: 'Point of Sale transaction processing',
};

interface POSPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function POSPage({ params }: POSPageProps) {
  const { businessId } = await params;

  const access = await requireBusinessAccess(businessId);
  if (!access) {
    redirect('/');
  }

  return <POSClient businessId={businessId} business={access.business} />;
}
