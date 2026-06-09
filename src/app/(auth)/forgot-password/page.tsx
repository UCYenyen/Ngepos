import type { Metadata } from 'next';
import { AuthShell } from '@/components/features/auth/AuthShell/AuthShell';
import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Lupa Password - Ngepos',
  description: 'Atur ulang password akun Ngepos kamu',
  openGraph: {
    title: 'Lupa Password - Ngepos',
    description: 'Atur ulang password akun Ngepos kamu',
    url: 'https://ngepos.com/forgot-password',
    siteName: 'Ngepos',
  },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
