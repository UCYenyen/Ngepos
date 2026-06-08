import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockAdjustment } from '@/components/features/inventory/StockAdjustment/StockAdjustment';

describe('StockAdjustment', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('renders dialog when open is true', () => {
    render(
      <StockAdjustment
        businessId="bus1"
        productId="prod1"
        productName="Test Product"
        currentStock={100}
        hasVariants={false}
        open={true}
      />
    );

    expect(screen.getByRole('button', { name: /Confirm Adjustment/i })).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    const { container } = render(
      <StockAdjustment
        businessId="bus1"
        productId="prod1"
        productName="Test Product"
        currentStock={100}
        hasVariants={false}
        open={false}
      />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });
});
