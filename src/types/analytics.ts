export type DateRangePreset = 'today' | 'week' | 'month' | 'custom';

export interface DateRange {
  start: string;
  end: string;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  transactions: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface CategorySalesSlice {
  categoryId: string | null;
  name: string;
  revenue: number;
}

export interface PaymentBreakdownSlice {
  method: 'cash' | 'qris' | 'gateway';
  revenue: number;
  count: number;
}

export interface StaffPerformanceRow {
  cashierId: string;
  name: string;
  revenue: number;
  transactions: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  transactionCount: number;
  averageOrderValue: number;
}

export interface DashboardMetrics {
  summary: AnalyticsSummary;
  revenueSeries: RevenuePoint[];
  topProducts: TopProduct[];
  categorySales: CategorySalesSlice[];
  paymentBreakdown: PaymentBreakdownSlice[];
  staffPerformance: StaffPerformanceRow[];
}

export interface MonthlyReportData {
  businessName: string;
  periodLabel: string;
  totalRevenue: number;
  transactionCount: number;
  topProducts: TopProduct[];
  lowStockCount: number;
}
