import type {
  AnalyticsSummary,
  CategorySalesSlice,
  DashboardMetrics,
  PaymentBreakdownSlice,
  RevenuePoint,
  StaffPerformanceRow,
  TopProduct,
} from '@/types/analytics';

export interface AnalyticsItemRow {
  product_id: string;
  name: string;
  quantity: number;
  subtotal: number;
  category_id: string | null;
  category_name: string | null;
}

export interface AnalyticsTransactionRow {
  id: string;
  cashier_id: string;
  cashier_name: string;
  total: number;
  payment_method: 'cash' | 'qris' | 'gateway';
  created_at: string;
  items: AnalyticsItemRow[];
}

export function computeSummary(txns: AnalyticsTransactionRow[]): AnalyticsSummary {
  const totalRevenue = txns.reduce((sum, txn) => sum + txn.total, 0);
  const transactionCount = txns.length;
  const averageOrderValue = transactionCount ? totalRevenue / transactionCount : 0;

  return { totalRevenue, transactionCount, averageOrderValue };
}

export function computeRevenueSeries(txns: AnalyticsTransactionRow[]): RevenuePoint[] {
  const byDay = new Map<string, RevenuePoint>();

  for (const txn of txns) {
    const date = txn.created_at.slice(0, 10);
    const existing = byDay.get(date);

    if (existing) {
      existing.revenue += txn.total;
      existing.transactions += 1;
    } else {
      byDay.set(date, { date, revenue: txn.total, transactions: 1 });
    }
  }

  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function computeTopProducts(txns: AnalyticsTransactionRow[], limit: number = 5): TopProduct[] {
  const byProduct = new Map<string, TopProduct>();

  for (const txn of txns) {
    for (const item of txn.items) {
      const existing = byProduct.get(item.product_id);

      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.subtotal;
      } else {
        byProduct.set(item.product_id, {
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          revenue: item.subtotal,
        });
      }
    }
  }

  return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function computeCategorySales(txns: AnalyticsTransactionRow[]): CategorySalesSlice[] {
  const byCategory = new Map<string, CategorySalesSlice>();

  for (const txn of txns) {
    for (const item of txn.items) {
      const key = item.category_id ?? '__uncategorized__';
      const existing = byCategory.get(key);

      if (existing) {
        existing.revenue += item.subtotal;
      } else {
        byCategory.set(key, {
          categoryId: item.category_id,
          name: item.category_name ?? 'Uncategorized',
          revenue: item.subtotal,
        });
      }
    }
  }

  return [...byCategory.values()].sort((a, b) => b.revenue - a.revenue);
}

export function computePaymentBreakdown(txns: AnalyticsTransactionRow[]): PaymentBreakdownSlice[] {
  const byMethod = new Map<PaymentBreakdownSlice['method'], PaymentBreakdownSlice>();

  for (const txn of txns) {
    const existing = byMethod.get(txn.payment_method);

    if (existing) {
      existing.revenue += txn.total;
      existing.count += 1;
    } else {
      byMethod.set(txn.payment_method, {
        method: txn.payment_method,
        revenue: txn.total,
        count: 1,
      });
    }
  }

  return [...byMethod.values()];
}

export function computeStaffPerformance(txns: AnalyticsTransactionRow[]): StaffPerformanceRow[] {
  const byCashier = new Map<string, StaffPerformanceRow>();

  for (const txn of txns) {
    const existing = byCashier.get(txn.cashier_id);

    if (existing) {
      existing.revenue += txn.total;
      existing.transactions += 1;
    } else {
      byCashier.set(txn.cashier_id, {
        cashierId: txn.cashier_id,
        name: txn.cashier_name,
        revenue: txn.total,
        transactions: 1,
      });
    }
  }

  return [...byCashier.values()].sort((a, b) => b.revenue - a.revenue);
}

export function computeDashboardMetrics(txns: AnalyticsTransactionRow[]): DashboardMetrics {
  return {
    summary: computeSummary(txns),
    revenueSeries: computeRevenueSeries(txns),
    topProducts: computeTopProducts(txns),
    categorySales: computeCategorySales(txns),
    paymentBreakdown: computePaymentBreakdown(txns),
    staffPerformance: computeStaffPerformance(txns),
  };
}
