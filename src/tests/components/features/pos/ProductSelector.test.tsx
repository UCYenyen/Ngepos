import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductSelector } from '@/components/features/pos/ProductSelector/ProductSelector';
import type { Product } from '@/types/product';

const products: Product[] = [
  {
    id: 'p1',
    business_id: 'b1',
    name: 'Kopi Susu',
    sku: 'KOP-1',
    price: 18000,
    has_variants: false,
    track_stock: false,
    created_at: '2026-06-09T00:00:00.000Z',
  },
  {
    id: 'p2',
    business_id: 'b1',
    name: 'Teh Tarik',
    sku: 'TEH-9',
    price: 15000,
    has_variants: false,
    track_stock: false,
    created_at: '2026-06-09T00:00:00.000Z',
  },
];

beforeEach(() => {
  global.fetch = vi.fn((url: string) => {
    if (url.includes('/api/categories')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(products) });
  }) as unknown as typeof fetch;
});

describe('ProductSelector barcode/Enter', () => {
  it('adds the SKU-matching product on Enter even if listed second', async () => {
    const onSelect = vi.fn();
    render(<ProductSelector businessId="b1" onSelectProduct={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Kopi Susu')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/scan barcode/i);
    fireEvent.change(input, { target: { value: 'TEH-9' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'p2' }));
  });

  it('does nothing on Enter when the query is empty', async () => {
    const onSelect = vi.fn();
    render(<ProductSelector businessId="b1" onSelectProduct={onSelect} />);

    await waitFor(() => {
      expect(screen.getByText('Kopi Susu')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/scan barcode/i);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
