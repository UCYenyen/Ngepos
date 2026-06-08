import type { Metadata } from 'next';
import { OnboardingForm } from '@/components/auth/OnboardingForm';

export const metadata: Metadata = {
  title: 'Get Started - Ngepos',
  description: 'Complete your Ngepos setup in just a few steps',
  openGraph: {
    title: 'Get Started - Ngepos',
    description: 'Complete your Ngepos setup',
    url: 'https://ngepos.com/onboarding',
    siteName: 'Ngepos',
  },
};

export default function OnboardingPage() {
  return <OnboardingForm />;
}
