import type { BillingCycle } from '@/types/auth';

const MONTHLY_PRICE: Record<string, number> = {
  starter: 0,
  pro: 149000,
  enterprise: 0,
};

// Amount to charge for one billing period (yearly = 12 months at 20% off).
export function invoiceAmount(plan: string, billingCycle: string): number {
  const monthly = MONTHLY_PRICE[plan] ?? 0;
  if (monthly === 0) return 0;
  return billingCycle === 'yearly' ? Math.round(monthly * 0.8) * 12 : monthly;
}

// The new period_end after a renewal: extend by one cycle from the later of the
// current period_end or now (so paying early doesn't lose unused time, and
// paying after a lapse starts fresh from today).
export function nextPeriodEnd(
  currentEnd: string | null | undefined,
  billingCycle: BillingCycle
): string {
  const now = Date.now();
  const base = currentEnd ? new Date(currentEnd).getTime() : now;
  const start = new Date(Math.max(base, now));
  if (billingCycle === 'yearly') {
    start.setFullYear(start.getFullYear() + 1);
  } else {
    start.setMonth(start.getMonth() + 1);
  }
  return start.toISOString();
}
