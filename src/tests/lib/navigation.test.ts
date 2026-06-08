import { describe, it, expect } from 'vitest';
import { getNavItems } from '@/lib/navigation';
import type { PlanConfig } from '@/lib/plans';

const proFeatures: PlanConfig['features'] = {
  inventory: true,
  tableManagement: true,
  analytics: true,
  automatedReports: true,
  paymentGateway: true,
};

const starterFeatures: PlanConfig['features'] = {
  inventory: false,
  tableManagement: false,
  analytics: false,
  automatedReports: false,
  paymentGateway: false,
};

describe('getNavItems', () => {
  it('returns POS, Inventory, Staff, Analytics, Reports, and Settings for an owner on pro features', () => {
    const items = getNavItems({
      businessId: 'biz-1',
      role: 'owner',
      businessType: 'retail',
      features: proFeatures,
    });

    expect(new Set(items.map((item) => item.key))).toEqual(
      new Set(['pos', 'inventory', 'staff', 'analytics', 'reports', 'settings'])
    );
  });

  it('returns only POS for a cashier on pro features', () => {
    const items = getNavItems({
      businessId: 'biz-1',
      role: 'cashier',
      businessType: 'retail',
      features: proFeatures,
    });

    expect(items.map((item) => item.key)).toEqual(['pos']);
  });

  it('returns POS, Inventory, Analytics, and Reports but not Staff or Settings for a manager on pro features', () => {
    const items = getNavItems({
      businessId: 'biz-1',
      role: 'manager',
      businessType: 'fnb',
      features: proFeatures,
    });

    const keys = items.map((item) => item.key);

    expect(keys).toContain('pos');
    expect(keys).toContain('inventory');
    expect(keys).toContain('analytics');
    expect(keys).toContain('reports');
    expect(keys).not.toContain('staff');
    expect(keys).not.toContain('settings');
  });

  it('returns POS, Staff, Reports, and Settings but not Analytics or Inventory for an owner on starter features', () => {
    const items = getNavItems({
      businessId: 'biz-1',
      role: 'owner',
      businessType: 'retail',
      features: starterFeatures,
    });

    const keys = items.map((item) => item.key);

    expect(new Set(keys)).toEqual(new Set(['pos', 'staff', 'reports', 'settings']));
    expect(keys).not.toContain('analytics');
    expect(keys).not.toContain('inventory');
  });

  it('builds hrefs that include the businessId', () => {
    const items = getNavItems({
      businessId: 'biz-42',
      role: 'owner',
      businessType: 'retail',
      features: proFeatures,
    });

    expect(items.find((item) => item.key === 'pos')?.href).toBe('/biz-42/pos');
    expect(items.find((item) => item.key === 'inventory')?.href).toBe(
      '/biz-42/inventory'
    );
    expect(items.find((item) => item.key === 'staff')?.href).toBe('/biz-42/staff');
    expect(items.find((item) => item.key === 'analytics')?.href).toBe(
      '/biz-42/analytics'
    );
    expect(items.find((item) => item.key === 'reports')?.href).toBe(
      '/biz-42/reports'
    );
    expect(items.find((item) => item.key === 'settings')?.href).toBe(
      '/biz-42/settings'
    );
  });
});
