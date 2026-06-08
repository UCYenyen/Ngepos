import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InviteForm } from '@/components/features/staff/InviteForm/InviteForm';

describe('InviteForm', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('renders invitation form when open is true', () => {
    render(
      <InviteForm
        businessId="business-1"
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Invite Staff Member/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/staff@example.com/i)).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <InviteForm
        businessId="business-1"
        open={false}
        onOpenChange={vi.fn()}
      />
    );

    expect(screen.queryByText(/Invite Staff Member/i)).not.toBeInTheDocument();
  });

  it('validates empty email', async () => {
    render(
      <InviteForm
        businessId="business-1"
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    const submitButton = screen.getByText(/Send Invitation/i);
    expect(submitButton).toBeDisabled();
  });

  it('prevents submission with invalid email', async () => {
    global.fetch = vi.fn();

    render(
      <InviteForm
        businessId="business-1"
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    const emailInput = screen.getByPlaceholderText(/staff@example.com/i) as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByText(/Send Invitation/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it('sends invitation with valid email', async () => {
    const mockOnInvitationSent = vi.fn();
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            success: true,
            data: { invitation_id: 'inv-1', invitation_token: 'token' },
          }),
          { status: 200 }
        )
      )
    );

    render(
      <InviteForm
        businessId="business-1"
        onInvitationSent={mockOnInvitationSent}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    const emailInput = screen.getByPlaceholderText(/staff@example.com/i);
    const submitButton = screen.getByText(/Send Invitation/i);

    fireEvent.change(emailInput, { target: { value: 'staff@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/staff',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('staff@example.com'),
        })
      );
    });
  });

  it('displays error on API failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ error: 'Invitation already sent to this email' }),
          { status: 400 }
        )
      )
    );

    render(
      <InviteForm
        businessId="business-1"
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    const emailInput = screen.getByPlaceholderText(/staff@example.com/i);
    const submitButton = screen.getByText(/Send Invitation/i);

    fireEvent.change(emailInput, { target: { value: 'staff@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Invitation already sent/i)).toBeInTheDocument();
    });
  });

  it('shows role description for cashier', async () => {
    render(
      <InviteForm
        businessId="business-1"
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    expect(
      screen.getByText(/Cashiers can only process transactions/i)
    ).toBeInTheDocument();
  });

  it('calls onOpenChange when closing', async () => {
    const mockOnOpenChange = vi.fn();
    render(
      <InviteForm
        businessId="business-1"
        open={true}
        onOpenChange={mockOnOpenChange}
      />
    );

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
