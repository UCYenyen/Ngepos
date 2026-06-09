import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AccountClient } from '@/components/features/account/AccountClient/AccountClient';

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const getUserMock = vi.fn();
const updateUserMock = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabaseClient: {
    auth: {
      getUser: () => getUserMock(),
      updateUser: (...args: unknown[]) => updateUserMock(...args),
    },
  },
}));

function mockUser() {
  getUserMock.mockResolvedValue({
    data: {
      user: {
        email: 'sari@toko.com',
        user_metadata: { full_name: 'Sari Dewi' },
      },
    },
    error: null,
  });
}

describe('AccountClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the loaded profile and saves the display name', async () => {
    mockUser();
    updateUserMock.mockResolvedValue({ error: null });

    render(<AccountClient />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Sari Dewi')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('sari@toko.com')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^simpan$/i }));

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({
        data: { full_name: 'Sari Dewi' },
      });
    });
  });

  it('changes the password when valid', async () => {
    mockUser();
    updateUserMock.mockResolvedValue({ error: null });

    render(<AccountClient />);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/minimal 8 karakter/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/minimal 8 karakter/i), {
      target: { value: 'PasswordBaru1' },
    });
    fireEvent.change(screen.getByPlaceholderText(/ulangi password baru/i), {
      target: { value: 'PasswordBaru1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ubah password/i }));

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith({ password: 'PasswordBaru1' });
    });
  });

  it('rejects a mismatched password confirmation', async () => {
    mockUser();

    render(<AccountClient />);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/minimal 8 karakter/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/minimal 8 karakter/i), {
      target: { value: 'PasswordBaru1' },
    });
    fireEvent.change(screen.getByPlaceholderText(/ulangi password baru/i), {
      target: { value: 'Berbeda9999' },
    });
    fireEvent.click(screen.getByRole('button', { name: /ubah password/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalled();
    });
    expect(updateUserMock).not.toHaveBeenCalledWith({
      password: 'PasswordBaru1',
    });
  });
});
