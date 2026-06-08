import type { Metadata } from 'next';
import { LoginForm } from '@/components/features/auth/LoginForm/LoginForm';

export const metadata: Metadata = {
  title: 'Log In - Ngepos',
  description: 'Log in to your Ngepos account',
  openGraph: {
    title: 'Log In - Ngepos',
    description: 'Access your Ngepos account',
    url: 'https://ngepos.com/login',
    siteName: 'Ngepos',
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
