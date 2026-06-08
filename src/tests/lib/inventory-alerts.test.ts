import { describe, it, expect } from 'vitest';
import { isLowStock, getLowStockItems } from '@/lib/inventory-alerts';
import type { InventoryProduct } from '@/types/inventory';

function makeProduct(overrides: Partial<InventoryProduct>): InventoryProduct {
  return {
    id: 'p1',
    name: 'Product',
    sku: null,
    category_id: null,
    category_name: null,
    price: 1000,
    current_stock: 0,
    low_stock_threshold: null,
    track_stock: true,
    has_variants: false,
    variants: [],
    ...overrides,
  };
}

describe('isLowStock', () => {
  it('returns false when threshold is null (alerts disabled)', () => {
    expect(isLowStock(0, null)).toBe(false);
    expect(isLowStock(100, null)).toBe(false);
  });

  it('returns false when current stock is above threshold', () => {
    expect(isLowStock(11, 10)).toBe(false);
    expect(isLowStock(100, 5)).toBe(false);
  });

  it('returns true when current stock equals threshold (boundary)', () => {
    expect(isLowStock(10, 10)).toBe(true);
    expect(isLowStock(0, 0)).toBe(true);
  });

  it('returns true when current stock is below threshold', () => {
    expect(isLowStock(9, 10)).toBe(true);
    expect(isLowStock(0, 5)).toBe(true);
  });
});

describe('getLowStockItems', () => {
  it('returns only low-stock products that track stock', () => {
    const low = makeProduct({ id: 'low', current_stock: 2, low_stock_threshold: 5 });
    const ok = makeProduct({ id: 'ok', current_stock: 50, low_stock_threshold: 5 });
    const result = getLowStockItems([low, ok]);
    expect(result).toEqual([low]);
  });

  it('filters out products that do not track stock even if at/below threshold', () => {
    const untracked = makeProduct({
      id: 'untracked',
      current_stock: 0,
      low_stock_threshold: 5,
      track_stock: false,
    });
    expect(getLowStockItems([untracked])).toEqual([]);
  });

  it('filters out products with a null threshold', () => {
    const noThreshold = makeProduct({ id: 'nt', current_stock: 0, low_stock_threshold: null });
    expect(getLowStockItems([noThreshold])).toEqual([]);
  });

  it('returns an empty array for an empty input', () => {
    expect(getLowStockItems([])).toEqual([]);
  });
});
