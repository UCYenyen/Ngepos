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
  it('returns all role-permitted items unlocked for an owner on pro features', () => {
    const items = getNavItems({
      businessId: 'biz-1',
      role: 'owner',
      businessType: 'retail',
      features: proFeatures,
    });

    expect(new Set(items.map((item) => item.key))).toEqual(
      new Set([
        'pos',
        'products',
        'inventory',
        'staff',
        'history',
        'analytics',
        'reports',
        'settings',
      ])
    );
    expect(items.every((item) => !item.locked)).toBe(true);
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

  it('shows plan-gated items as locked for an owner on starter features', () => {
    const items = getNavItems({
      businessId: 'biz-1',
      role: 'owner',
      businessType: 'retail',
      features: starterFeatures,
    });

    const byKey = new Map(items.map((item) => [item.key, item]));

    expect(new Set(byKey.keys())).toEqual(
      new Set([
        'pos',
        'products',
        'inventory',
        'staff',
        'history',
        'analytics',
        'reports',
        'settings',
      ])
    );
    expect(byKey.get('inventory')?.locked).toBe(true);
    expect(byKey.get('analytics')?.locked).toBe(true);
    expect(byKey.get('reports')?.locked).toBe(true);
    expect(byKey.get('pos')?.locked).toBe(false);
    expect(byKey.get('products')?.locked).toBe(false);
    expect(byKey.get('staff')?.locked).toBe(false);
    expect(byKey.get('settings')?.locked).toBe(false);
  });

  it('builds hrefs that include the businessId', () => {
    const items = getNavItems({
      businessId: 'biz-42',
      role: 'owner',
      businessType: 'retail',
      features: proFeatures,
    });

    expect(items.find((item) => item.key === 'pos')?.href).toBe('/dashboard/biz-42/pos');
    expect(items.find((item) => item.key === 'inventory')?.href).toBe(
      '/dashboard/biz-42/inventory'
    );
    expect(items.find((item) => item.key === 'staff')?.href).toBe('/dashboard/biz-42/staff');
    expect(items.find((item) => item.key === 'analytics')?.href).toBe(
      '/dashboard/biz-42/analytics'
    );
    expect(items.find((item) => item.key === 'reports')?.href).toBe(
      '/dashboard/biz-42/reports'
    );
    expect(items.find((item) => item.key === 'settings')?.href).toBe(
      '/dashboard/biz-42/settings'
    );
  });
});
