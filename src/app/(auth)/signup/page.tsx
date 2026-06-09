import type { Metadata } from 'next';
import { AuthShell } from '@/components/features/auth/AuthShell/AuthShell';
import { SignupForm } from '@/components/features/auth/SignupForm/SignupForm';

export const metadata: Metadata = {
  title: 'Daftar - Ngepos',
  description: 'Buat akun Ngepos gratis untuk mulai mengelola bisnismu',
  openGraph: {
    title: 'Daftar - Ngepos',
    description: 'Buat akun Ngepos gratis',
    url: 'https://ngepos.com/signup',
    siteName: 'Ngepos',
  },
};

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
