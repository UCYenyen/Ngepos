import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionHistoryClient } from '@/components/features/history/TransactionHistoryClient/TransactionHistoryClient';
import type { Business } from '@/types/business';

const business: Business = {
  id: 'b1',
  owner_id: 'u1',
  name: 'Warung Sari',
  type: 'fnb',
  timezone: 'Asia/Jakarta',
  currency: 'IDR',
  created_at: '2026-01-01T00:00:00.000Z',
};

const now = new Date().toISOString();

const transactions = [
  {
    id: 'abcdef12-3456-7890-aaaa-bbbbbbbbbbbb',
    business_id: 'b1',
    cashier_id: 'u1',
    subtotal: 20000,
    discount_amount: 0,
    tax_amount: 2000,
    total: 22000,
    payment_method: 'cash',
    payment_status: 'paid',
    created_at: now,
    transaction_items: [
      {
        id: 'i1',
        transaction_id: 'abcdef12-3456-7890-aaaa-bbbbbbbbbbbb',
        product_id: 'p1',
        name: 'Kopi Susu',
        price: 20000,
        quantity: 1,
        discount_amount: 0,
        subtotal: 20000,
        created_at: now,
      },
    ],
  },
];

function mockFetch(payload: unknown, ok = true) {
  global.fetch = vi.fn(() =>
    Promise.resolve({ ok, json: () => Promise.resolve(payload) })
  ) as unknown as typeof fetch;
}

describe('TransactionHistoryClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists transactions and opens the receipt on click', async () => {
    mockFetch(transactions);

    render(<TransactionHistoryClient businessId="b1" business={business} />);

    await waitFor(() => {
      expect(screen.getByText('#ABCDEF12')).toBeInTheDocument();
    });
    expect(screen.getByText('Lunas')).toBeInTheDocument();
    expect(screen.getByText(/1 transaksi/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText('#ABCDEF12'));

    await waitFor(() => {
      expect(screen.getByText(/pembayaran berhasil/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/warung sari/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tutup/i })).toBeInTheDocument();
  });

  it('filters the list by transaction id search', async () => {
    mockFetch(transactions);

    render(<TransactionHistoryClient businessId="b1" business={business} />);

    await waitFor(() => {
      expect(screen.getByText('#ABCDEF12')).toBeInTheDocument();
    });

    const search = screen.getByPlaceholderText(/cari #id/i);
    fireEvent.change(search, { target: { value: 'zzzz' } });
    expect(screen.queryByText('#ABCDEF12')).not.toBeInTheDocument();
    expect(screen.getByText(/tidak ada transaksi yang cocok/i)).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'abcdef' } });
    expect(screen.getByText('#ABCDEF12')).toBeInTheDocument();
  });

  it('refunds a transaction from the detail dialog', async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/refund')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(transactions) });
    }) as unknown as typeof fetch;

    render(<TransactionHistoryClient businessId="b1" business={business} />);

    await waitFor(() => {
      expect(screen.getByText('#ABCDEF12')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('#ABCDEF12'));

    const refundButton = await screen.findByRole('button', {
      name: /refund transaksi/i,
    });
    fireEvent.click(refundButton);

    expect(screen.getByText(/kembalikan stok/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /ya, refund/i }));

    await waitFor(() => {
      expect(screen.getByText(/sudah direfund/i)).toBeInTheDocument();
    });
  });

  it('shows an empty state when there are no transactions', async () => {
    mockFetch([]);

    render(<TransactionHistoryClient businessId="b1" business={business} />);

    await waitFor(() => {
      expect(screen.getByText(/belum ada transaksi/i)).toBeInTheDocument();
    });
  });
});
