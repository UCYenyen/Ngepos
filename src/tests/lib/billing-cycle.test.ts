import { describe, it, expect } from 'vitest';
import { invoiceAmount, nextPeriodEnd } from '@/lib/billing-cycle';

describe('invoiceAmount', () => {
  it('charges the monthly price for a monthly pro plan', () => {
    expect(invoiceAmount('pro', 'monthly')).toBe(149000);
  });

  it('applies a 20% yearly discount over 12 months', () => {
    expect(invoiceAmount('pro', 'yearly')).toBe(Math.round(149000 * 0.8) * 12);
  });

  it('is free for starter / enterprise', () => {
    expect(invoiceAmount('starter', 'monthly')).toBe(0);
    expect(invoiceAmount('enterprise', 'yearly')).toBe(0);
  });
});

describe('nextPeriodEnd', () => {
  it('extends one month from a future period_end (no lost time)', () => {
    const end = new Date(Date.now() + 5 * 86_400_000).toISOString();
    const result = new Date(nextPeriodEnd(end, 'monthly'));
    const expected = new Date(end);
    expected.setMonth(expected.getMonth() + 1);
    expect(Math.abs(result.getTime() - expected.getTime())).toBeLessThan(1000);
  });

  it('starts from now when the subscription has already lapsed', () => {
    const end = new Date(Date.now() - 10 * 86_400_000).toISOString();
    const result = new Date(nextPeriodEnd(end, 'monthly')).getTime();
    const fromNow = new Date();
    fromNow.setMonth(fromNow.getMonth() + 1);
    expect(Math.abs(result - fromNow.getTime())).toBeLessThan(5000);
  });

  it('adds a year for yearly', () => {
    const end = new Date(Date.now() + 5 * 86_400_000).toISOString();
    const result = new Date(nextPeriodEnd(end, 'yearly'));
    const expected = new Date(end);
    expected.setFullYear(expected.getFullYear() + 1);
    expect(Math.abs(result.getTime() - expected.getTime())).toBeLessThan(1000);
  });
});
