import type { Metadata } from 'next';
import { requireBusinessAccess, getBusinessPlanFeatures } from '@/lib/auth';
import POSClient from '@/components/features/pos/POSClient/POSClient';
import type { Business } from '@/types/business';

export const metadata: Metadata = {
  title: 'POS - Ngepos',
  description: 'Proses transaksi point of sale',
};

interface POSPageProps {
  params: Promise<{ businessId: string }>;
}

export default async function POSPage({ params }: POSPageProps) {
  const { businessId } = await params;

  const { business } = await requireBusinessAccess(businessId);
  const features = await getBusinessPlanFeatures(businessId);

  return (
    <POSClient
      businessId={businessId}
      business={business as Business}
      paymentGatewayEnabled={features.paymentGateway}
    />
  );
}
