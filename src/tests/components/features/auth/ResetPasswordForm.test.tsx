import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '@/components/features/auth/ResetPasswordForm/ResetPasswordForm';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const getSessionMock = vi.fn();
const updateUserMock = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabaseClient: {
    auth: {
      getSession: () => getSessionMock(),
      updateUser: (...args: unknown[]) => updateUserMock(...args),
    },
  },
}));

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the invalid-link view when there is no recovery session', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(screen.getByText(/tautan tidak valid/i)).toBeInTheDocument();
    });
    expect(
      screen.getByRole('link', { name: /minta tautan baru/i })
    ).toBeInTheDocument();
  });

  it('updates the password and redirects when the form is valid', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { access_token: 't' } },
    });
    updateUserMock.mockResolvedValue({ error: null });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/minimal 8 karakter/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/minimal 8 karakter/i), {
      target: { value: 'BaruBanget1' },
    });
    fireEvent.change(screen.getByPlaceholderText(/ulangi password baru/i), {
      target: { value: 'BaruBanget1' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /simpan password baru/i })
    );

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({ password: 'BaruBanget1' });
    });
    expect(pushMock).toHaveBeenCalledWith('/dashboard');
  });

  it('blocks submission when the confirmation does not match', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { access_token: 't' } },
    });

    render(<ResetPasswordForm />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/minimal 8 karakter/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/minimal 8 karakter/i), {
      target: { value: 'BaruBanget1' },
    });
    fireEvent.change(screen.getByPlaceholderText(/ulangi password baru/i), {
      target: { value: 'Berbeda999' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /simpan password baru/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/konfirmasi password tidak cocok/i)
      ).toBeInTheDocument();
    });
    expect(updateUserMock).not.toHaveBeenCalled();
  });
});
