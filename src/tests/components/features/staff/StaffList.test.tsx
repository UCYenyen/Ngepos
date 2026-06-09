import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StaffList } from '@/components/features/staff/StaffList/StaffList';
import type { StaffMemberResponse } from '@/types/api';

const mockStaff: StaffMemberResponse[] = [
  {
    id: 'user-1',
    email: 'owner@example.com',
    name: 'Owner User',
    role: 'owner',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'manager@example.com',
    name: 'Manager User',
    role: 'manager',
    created_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'user-3',
    email: 'cashier@example.com',
    name: 'Cashier User',
    role: 'cashier',
    created_at: '2024-01-03T00:00:00Z',
  },
];

describe('StaffList', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('renders loading skeleton initially', async () => {
    global.fetch = vi.fn((): Promise<Response> =>
      new Promise((resolve) =>
        setTimeout(() => resolve(new Response(JSON.stringify({ data: { staff: [] } }))), 100)
      )
    );

    const { container } = render(<StaffList businessId="business-1" />);
    expect(
      container.querySelector('[data-slot="skeleton"]')
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        container.querySelector('[data-slot="skeleton"]')
      ).not.toBeInTheDocument();
    });
  });

  it('fetches and displays staff members', async () => {
    global.fetch = vi.fn((): Promise<Response> =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { staff: mockStaff } }), { status: 200 })
      )
    );

    render(<StaffList businessId="business-1" />);

    await waitFor(() => {
      expect(screen.getByText('Owner User')).toBeInTheDocument();
      expect(screen.getByText('Manager User')).toBeInTheDocument();
      expect(screen.getByText('Cashier User')).toBeInTheDocument();
    });
  });

  it('displays role badges', async () => {
    global.fetch = vi.fn((): Promise<Response> =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { staff: mockStaff } }), { status: 200 })
      )
    );

    render(<StaffList businessId="business-1" />);

    await waitFor(() => {
      expect(screen.getByText('Owner')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
      expect(screen.getByText('Cashier')).toBeInTheDocument();
    });
  });

  it('shows invite button', async () => {
    global.fetch = vi.fn((): Promise<Response> =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { staff: mockStaff } }), { status: 200 })
      )
    );

    render(<StaffList businessId="business-1" />);

    await waitFor(() => {
      expect(screen.getByText(/Undang staf/i)).toBeInTheDocument();
    });
  });

  it('shows error when fetch fails', async () => {
    global.fetch = vi.fn((): Promise<Response> =>
      Promise.resolve(
        new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
      )
    );

    render(<StaffList businessId="business-1" />);

    await waitFor(() => {
      expect(screen.getByText(/gagal memuat staf/i)).toBeInTheDocument();
    });
  });

  it('handles empty staff list', async () => {
    global.fetch = vi.fn((): Promise<Response> =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { staff: [] } }), { status: 200 })
      )
    );

    render(<StaffList businessId="business-1" />);

    await waitFor(() => {
      expect(screen.getByText(/belum ada staf/i)).toBeInTheDocument();
    });
  });
});
