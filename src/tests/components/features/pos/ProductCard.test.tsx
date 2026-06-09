import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/features/pos/ProductCard/ProductCard';
import type { Product } from '@/types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    business_id: 'b1',
    name: 'Kopi Susu',
    price: 18000,
    has_variants: false,
    track_stock: false,
    created_at: '2026-06-09T00:00:00.000Z',
    ...overrides,
  };
}

describe('ProductCard stock badges', () => {
  const onSelect = vi.fn();

  it('shows no stock badge when stock is not tracked', () => {
    render(<ProductCard product={makeProduct()} onSelect={onSelect} />);
    expect(screen.queryByText('Habis')).not.toBeInTheDocument();
    expect(screen.queryByText('Menipis')).not.toBeInTheDocument();
  });

  it('shows "Habis" when a tracked product is out of stock', () => {
    render(
      <ProductCard
        product={makeProduct({
          track_stock: true,
          stock_qty: 0,
          low_stock_threshold: 5,
        })}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('Habis')).toBeInTheDocument();
    expect(screen.queryByText('Menipis')).not.toBeInTheDocument();
  });

  it('shows "Menipis" when stock is low but not zero', () => {
    render(
      <ProductCard
        product={makeProduct({
          track_stock: true,
          stock_qty: 3,
          low_stock_threshold: 5,
        })}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('Menipis')).toBeInTheDocument();
    expect(screen.queryByText('Habis')).not.toBeInTheDocument();
  });

  it('shows no badge when stock is healthy', () => {
    render(
      <ProductCard
        product={makeProduct({
          track_stock: true,
          stock_qty: 40,
          low_stock_threshold: 5,
        })}
        onSelect={onSelect}
      />
    );
    expect(screen.queryByText('Habis')).not.toBeInTheDocument();
    expect(screen.queryByText('Menipis')).not.toBeInTheDocument();
  });
});
