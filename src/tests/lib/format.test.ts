import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '@/lib/format';

describe('formatCurrency', () => {
  it('groups thousands with dots for large amounts', () => {
    expect(formatCurrency(1500000)).toContain('1.500.000');
  });

  it('returns a non-empty string for zero', () => {
    expect(formatCurrency(0).length).toBeGreaterThan(0);
  });

  it('formats with an explicit currency code', () => {
    expect(formatCurrency(1500000, 'IDR')).toContain('1.500.000');
  });
});

describe('formatDate', () => {
  it('returns a non-empty string for an ISO date string', () => {
    expect(formatDate('2026-06-08').length).toBeGreaterThan(0);
  });

  it('returns a non-empty string for a Date instance', () => {
    expect(formatDate(new Date('2026-06-08')).length).toBeGreaterThan(0);
  });
});
