import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StockList } from '@/components/features/inventory/StockList/StockList';

describe('StockList', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('renders loading state initially', () => {
    const fetchMock = vi.fn((): Promise<Response> => new Promise(() => {}));
    global.fetch = fetchMock;
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

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    } as Response);
    global.fetch = fetchMock;

    render(<StockList businessId="bus1" />);

    const productName = await screen.findByText('Product A');
    expect(productName).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: false,
      statusText: 'Server Error',
    } as Response);
    global.fetch = fetchMock;

    render(<StockList businessId="bus1" />);

    const errorMessage = await screen.findByText(/failed to fetch inventory/i);
    expect(errorMessage).toBeInTheDocument();
  });
});
