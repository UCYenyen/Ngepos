import type { Metadata } from 'next';
import { SignupForm } from '@/components/auth/SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up - Ngepos',
  description: 'Create a new Ngepos account to start managing your business',
  openGraph: {
    title: 'Sign Up - Ngepos',
    description: 'Create a new Ngepos account',
    url: 'https://ngepos.com/signup',
    siteName: 'Ngepos',
  },
};

export default function SignupPage() {
  return <SignupForm />;
}
