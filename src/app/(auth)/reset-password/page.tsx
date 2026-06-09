import type { Metadata } from 'next';
import { AuthShell } from '@/components/features/auth/AuthShell/AuthShell';
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset Password - Ngepos',
  description: 'Buat password baru untuk akun Ngepos kamu',
  openGraph: {
    title: 'Reset Password - Ngepos',
    description: 'Buat password baru untuk akun Ngepos kamu',
    url: 'https://ngepos.com/reset-password',
    siteName: 'Ngepos',
  },
};

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <ResetPasswordForm />
    </AuthShell>
  );
}
