import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '@/components/features/auth/ForgotPasswordForm/ForgotPasswordForm';

const resetPasswordForEmailMock = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabaseClient: {
    auth: {
      resetPasswordForEmail: (...args: unknown[]) =>
        resetPasswordForEmailMock(...args),
    },
  },
}));

function fillAndSubmit() {
  fireEvent.change(screen.getByPlaceholderText(/kamu@bisnis\.com/i), {
    target: { value: 'lupa@user.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: /kirim tautan reset/i }));
}

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the "check your email" view after a successful request', async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: null });

    render(<ForgotPasswordForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText(/cek email/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/lupa@user\.com/)).toBeInTheDocument();
  });

  it('sends redirectTo routed through /auth/callback to the reset page', async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: null });

    render(<ForgotPasswordForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(resetPasswordForEmailMock).toHaveBeenCalledWith(
        'lupa@user.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining(
            '/auth/callback?next=/reset-password'
          ),
        })
      );
    });
  });

  it('surfaces the error message on failure', async () => {
    resetPasswordForEmailMock.mockResolvedValue({
      error: new Error('Email tidak terdaftar'),
    });

    render(<ForgotPasswordForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText(/Email tidak terdaftar/i)).toBeInTheDocument();
    });
  });
});
