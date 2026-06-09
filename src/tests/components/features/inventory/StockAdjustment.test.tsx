import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockAdjustment } from '@/components/features/inventory/StockAdjustment/StockAdjustment';
import type { InventoryProduct } from '@/types/inventory';

const mockProduct: InventoryProduct = {
  id: 'prod1',
  name: 'Test Product',
  sku: 'SKU001',
  category_id: null,
  category_name: null,
  price: 50000,
  current_stock: 100,
  low_stock_threshold: 20,
  track_stock: true,
  has_variants: false,
  variants: [],
};

describe('StockAdjustment', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('renders dialog when open is true', () => {
    render(
      <StockAdjustment
        businessId="bus1"
        product={mockProduct}
        open
        onOpenChange={() => {}}
        onComplete={() => {}}
      />
    );

    expect(
      screen.getByRole('button', { name: /Sesuaikan stok/i })
    ).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    const { container } = render(
      <StockAdjustment
        businessId="bus1"
        product={mockProduct}
        open={false}
        onOpenChange={() => {}}
        onComplete={() => {}}
      />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });
});
