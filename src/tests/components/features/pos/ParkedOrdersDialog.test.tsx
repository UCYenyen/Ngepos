import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParkedOrdersDialog } from '@/components/features/pos/ParkedOrdersDialog/ParkedOrdersDialog';
import type { ParkedOrder } from '@/types/pos';

const order: ParkedOrder = {
  id: 'po1',
  business_id: 'b1',
  label: 'Pak Budi',
  items: [
    {
      product_id: 'p1',
      name: 'Kopi Susu',
      price: 10000,
      quantity: 2,
      discount_amount: 0,
    },
  ],
  created_at: '2026-06-09T00:00:00.000Z',
};

function setup(orders: ParkedOrder[]) {
  const onRecall = vi.fn();
  const onDiscard = vi.fn();
  render(
    <ParkedOrdersDialog
      open
      orders={orders}
      onOpenChange={() => {}}
      onRecall={onRecall}
      onDiscard={onDiscard}
    />
  );
  return { onRecall, onDiscard };
}

describe('ParkedOrdersDialog', () => {
  it('renders a parked order with its label and total, and recalls it', () => {
    const { onRecall } = setup([order]);

    expect(screen.getByText('Pak Budi')).toBeInTheDocument();
    expect(screen.getByText(/1 item/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /panggil/i }));
    expect(onRecall).toHaveBeenCalledWith(order);
  });

  it('discards a parked order', () => {
    const { onDiscard } = setup([order]);

    fireEvent.click(
      screen.getByRole('button', { name: /hapus pesanan ditahan/i })
    );
    expect(onDiscard).toHaveBeenCalledWith(order);
  });

  it('shows an empty message when there are no parked orders', () => {
    setup([]);
    expect(
      screen.getByText(/tidak ada pesanan ditahan/i)
    ).toBeInTheDocument();
  });
});
