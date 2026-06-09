import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignupForm } from '@/components/features/auth/SignupForm/SignupForm';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const signUpMock = vi.fn();
const signInWithOAuthMock = vi.fn();
vi.mock('@/lib/supabase', () => ({
  supabaseClient: {
    auth: {
      signUp: (...args: unknown[]) => signUpMock(...args),
      signInWithOAuth: (...args: unknown[]) => signInWithOAuthMock(...args),
    },
  },
}));

function fillAndSubmit() {
  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: 'new@user.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'Test123456!' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^sign up$/i }));
}

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the "check your email" view when confirmation is required (no session)', async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: 'u1' }, session: null },
      error: null,
    });

    render(<SignupForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/new@user\.com/)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('redirects to /onboarding when a session is returned (autoconfirm)', async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: 'u1' }, session: { access_token: 't' } },
      error: null,
    });

    render(<SignupForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('sends emailRedirectTo pointing at /auth/callback', async () => {
    signUpMock.mockResolvedValue({
      data: { user: { id: 'u1' }, session: null },
      error: null,
    });

    render(<SignupForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({
            emailRedirectTo: expect.stringContaining('/auth/callback'),
          }),
        })
      );
    });
  });

  it('surfaces the error message on signup failure', async () => {
    signUpMock.mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('User already registered'),
    });

    render(<SignupForm />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText(/User already registered/i)).toBeInTheDocument();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
