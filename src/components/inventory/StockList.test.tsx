import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockList } from './StockList';

describe('StockList', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('renders loading state initially', () => {
    (global.fetch as any).mockImplementation(() => new Promise(() => {}));
    render(<StockList businessId="bus1" />);
    expect(screen.getByText(/loading inventory/i)).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    const mockProducts = [
      {
        id: 'prod1',
        name: 'Product A',
        sku: 'SKU001',
        category_id: 'cat1',
        category_name: 'Category 1',
        price: 50000,
        current_stock: 100,
        low_stock_threshold: 20,
        track_stock: true,
        has_variants: false,
        variants: [],
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<StockList businessId="bus1" />);

    const productName = await screen.findByText('Product A');
    expect(productName).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      statusText: 'Server Error',
    });

    render(<StockList businessId="bus1" />);

    const errorMessage = await screen.findByText(/failed to fetch inventory/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
