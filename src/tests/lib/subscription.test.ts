import { describe, it, expect } from 'vitest';
import {
  isSubscriptionActive,
  initialInvoiceTargetStatus,
} from '@/lib/subscription';

const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

describe('isSubscriptionActive', () => {
  it('is active when status is active and period_end is in the future', () => {
    expect(isSubscriptionActive('active', future)).toBe(true);
  });

  it('is inactive once period_end has passed (expired)', () => {
    expect(isSubscriptionActive('active', past)).toBe(false);
  });

  it('is inactive for non-active statuses', () => {
    expect(isSubscriptionActive('pending', future)).toBe(false);
    expect(isSubscriptionActive('cancelled', future)).toBe(false);
    expect(isSubscriptionActive(null, future)).toBe(false);
  });

  it('treats a missing period_end as active (no expiry set)', () => {
    expect(isSubscriptionActive('active', null)).toBe(true);
  });
});

describe('initialInvoiceTargetStatus', () => {
  it('maps a paid checkout invoice to active', () => {
    expect(initialInvoiceTargetStatus('PAID')).toBe('active');
    expect(initialInvoiceTargetStatus('SETTLED')).toBe('active');
  });

  it('maps an expired checkout invoice to cancelled', () => {
    expect(initialInvoiceTargetStatus('EXPIRED')).toBe('cancelled');
  });

  it('returns null for PENDING/unknown so no status is written', () => {
    expect(initialInvoiceTargetStatus('PENDING')).toBeNull();
    expect(initialInvoiceTargetStatus('')).toBeNull();
    expect(initialInvoiceTargetStatus(undefined)).toBeNull();
  });
});
