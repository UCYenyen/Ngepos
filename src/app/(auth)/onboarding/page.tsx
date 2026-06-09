import type { Metadata } from 'next';
import { OnboardingForm } from '@/components/features/auth/OnboardingForm/OnboardingForm';

export const metadata: Metadata = {
  title: 'Setup Bisnis - Ngepos',
  description: 'Buat bisnis pertamamu untuk mulai berjualan',
  openGraph: {
    title: 'Setup Bisnis - Ngepos',
    description: 'Buat bisnis pertamamu untuk mulai berjualan',
    url: 'https://ngepos.com/onboarding',
    siteName: 'Ngepos',
  },
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
