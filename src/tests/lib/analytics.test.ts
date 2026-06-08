import { describe, expect, it } from 'vitest';
import {
  computeCategorySales,
  computeDashboardMetrics,
  computePaymentBreakdown,
  computeRevenueSeries,
  computeStaffPerformance,
  computeSummary,
  computeTopProducts,
  type AnalyticsTransactionRow,
} from '@/lib/analytics';

const transactions: AnalyticsTransactionRow[] = [
  {
    id: 't1',
    cashier_id: 'c1',
    cashier_name: 'Alice',
    total: 100,
    payment_method: 'cash',
    created_at: '2026-06-01T08:30:00.000Z',
    items: [
      {
        product_id: 'p1',
        name: 'Latte',
        quantity: 2,
        subtotal: 60,
        category_id: 'cat1',
        category_name: 'Drinks',
      },
      {
        product_id: 'p2',
        name: 'Croissant',
        quantity: 1,
        subtotal: 40,
        category_id: 'cat2',
        category_name: 'Bakery',
      },
    ],
  },
  {
    id: 't2',
    cashier_id: 'c2',
    cashier_name: 'Bob',
    total: 50,
    payment_method: 'qris',
    created_at: '2026-06-01T15:00:00.000Z',
    items: [
      {
        product_id: 'p1',
        name: 'Latte',
        quantity: 1,
        subtotal: 30,
        category_id: 'cat1',
        category_name: 'Drinks',
      },
      {
        product_id: 'p3',
        name: 'Sticker',
        quantity: 1,
        subtotal: 20,
        category_id: null,
        category_name: null,
      },
    ],
  },
  {
    id: 't3',
    cashier_id: 'c1',
    cashier_name: 'Alice',
    total: 200,
    payment_method: 'cash',
    created_at: '2026-06-02T09:00:00.000Z',
    items: [
      {
        product_id: 'p2',
        name: 'Croissant',
        quantity: 3,
        subtotal: 120,
        category_id: 'cat2',
        category_name: 'Bakery',
      },
      {
        product_id: 'p4',
        name: 'Tote Bag',
        quantity: 1,
        subtotal: 80,
        category_id: null,
        category_name: null,
      },
    ],
  },
  {
    id: 't4',
    cashier_id: 'c2',
    cashier_name: 'Bob',
    total: 30,
    payment_method: 'qris',
    created_at: '2026-06-02T18:45:00.000Z',
    items: [
      {
        product_id: 'p1',
        name: 'Latte',
        quantity: 1,
        subtotal: 30,
        category_id: 'cat1',
        category_name: 'Drinks',
      },
    ],
  },
];

describe('computeSummary', () => {
  it('computes total revenue, count, and average order value', () => {
    const summary = computeSummary(transactions);

    expect(summary.totalRevenue).toBe(380);
    expect(summary.transactionCount).toBe(4);
    expect(summary.averageOrderValue).toBe(95);
  });

  it('returns zero average order value on empty input', () => {
    const summary = computeSummary([]);

    expect(summary.totalRevenue).toBe(0);
    expect(summary.transactionCount).toBe(0);
    expect(summary.averageOrderValue).toBe(0);
  });
});

describe('computeRevenueSeries', () => {
  it('groups by calendar day sorted ascending with revenue and transaction counts', () => {
    const series = computeRevenueSeries(transactions);

    expect(series).toEqual([
      { date: '2026-06-01', revenue: 150, transactions: 2 },
      { date: '2026-06-02', revenue: 230, transactions: 2 },
    ]);
  });

  it('returns an empty array on empty input', () => {
    expect(computeRevenueSeries([])).toEqual([]);
  });
});

describe('computeTopProducts', () => {
  it('aggregates quantity and revenue per product sorted by revenue descending', () => {
    const top = computeTopProducts(transactions);

    expect(top).toEqual([
      { productId: 'p2', name: 'Croissant', quantity: 4, revenue: 160 },
      { productId: 'p1', name: 'Latte', quantity: 4, revenue: 120 },
      { productId: 'p4', name: 'Tote Bag', quantity: 1, revenue: 80 },
      { productId: 'p3', name: 'Sticker', quantity: 1, revenue: 20 },
    ]);
  });

  it('respects the limit argument', () => {
    const top = computeTopProducts(transactions, 1);

    expect(top).toEqual([{ productId: 'p2', name: 'Croissant', quantity: 4, revenue: 160 }]);
  });

  it('returns an empty array on empty input', () => {
    expect(computeTopProducts([])).toEqual([]);
  });
});

describe('computeCategorySales', () => {
  it('aggregates by category and groups null categories under Uncategorized sorted descending', () => {
    const sales = computeCategorySales(transactions);

    expect(sales).toEqual([
      { categoryId: 'cat2', name: 'Bakery', revenue: 160 },
      { categoryId: 'cat1', name: 'Drinks', revenue: 120 },
      { categoryId: null, name: 'Uncategorized', revenue: 100 },
    ]);
  });

  it('returns an empty array on empty input', () => {
    expect(computeCategorySales([])).toEqual([]);
  });
});

describe('computePaymentBreakdown', () => {
  it('groups present payment methods with revenue and count', () => {
    const breakdown = computePaymentBreakdown(transactions);

    expect(breakdown).toContainEqual({ method: 'cash', revenue: 300, count: 2 });
    expect(breakdown).toContainEqual({ method: 'qris', revenue: 80, count: 2 });
    expect(breakdown).toHaveLength(2);
    expect(breakdown.some((slice) => slice.method === 'gateway')).toBe(false);
  });

  it('returns an empty array on empty input', () => {
    expect(computePaymentBreakdown([])).toEqual([]);
  });
});

describe('computeStaffPerformance', () => {
  it('aggregates revenue and transaction count per cashier sorted descending', () => {
    const staff = computeStaffPerformance(transactions);

    expect(staff).toEqual([
      { cashierId: 'c1', name: 'Alice', revenue: 300, transactions: 2 },
      { cashierId: 'c2', name: 'Bob', revenue: 80, transactions: 2 },
    ]);
  });

  it('returns an empty array on empty input', () => {
    expect(computeStaffPerformance([])).toEqual([]);
  });
});

describe('computeDashboardMetrics', () => {
  it('composes all six metric sections', () => {
    const metrics = computeDashboardMetrics(transactions);

    expect(Object.keys(metrics).sort()).toEqual(
      [
        'categorySales',
        'paymentBreakdown',
        'revenueSeries',
        'staffPerformance',
        'summary',
        'topProducts',
      ].sort()
    );

    expect(metrics.summary.totalRevenue).toBe(380);
    expect(metrics.revenueSeries).toHaveLength(2);
    expect(metrics.topProducts).toHaveLength(4);
    expect(metrics.topProducts[0].productId).toBe('p2');
    expect(metrics.staffPerformance[0].cashierId).toBe('c1');
  });

  it('returns zeros and empty arrays on empty input', () => {
    const metrics = computeDashboardMetrics([]);

    expect(metrics.summary).toEqual({
      totalRevenue: 0,
      transactionCount: 0,
      averageOrderValue: 0,
    });
    expect(metrics.revenueSeries).toEqual([]);
    expect(metrics.topProducts).toEqual([]);
    expect(metrics.categorySales).toEqual([]);
    expect(metrics.paymentBreakdown).toEqual([]);
    expect(metrics.staffPerformance).toEqual([]);
  });
});
