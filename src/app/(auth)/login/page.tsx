import type { Metadata } from 'next';
import { AuthShell } from '@/components/features/auth/AuthShell/AuthShell';
import { LoginForm } from '@/components/features/auth/LoginForm/LoginForm';

export const metadata: Metadata = {
  title: 'Masuk - Ngepos',
  description: 'Masuk ke akun Ngepos kamu',
  openGraph: {
    title: 'Masuk - Ngepos',
    description: 'Masuk ke akun Ngepos kamu',
    url: 'https://ngepos.com/login',
    siteName: 'Ngepos',
  },
};

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
