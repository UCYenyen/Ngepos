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
  it('returns POS, Inventory, and Staff for an owner on pro features', () => {
    const items = getNavItems({
      businessId: 'biz-1',
      role: 'owner',
      businessType: 'retail',
      features: proFeatures,
    });

    expect(items.map((item) => item.key)).toEqual(['pos', 'inventory', 'staff']);
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

  it('returns POS and Staff but not Inventory for an owner on starter features', () => {
    const items = getNavItems({
      businessId: 'biz-1',
      role: 'owner',
      businessType: 'retail',
      features: starterFeatures,
    });

    expect(items.map((item) => item.key)).toEqual(['pos', 'staff']);
  });

  it('returns POS and Inventory but not Staff for a manager on pro features', () => {
    const items = getNavItems({
      businessId: 'biz-1',
      role: 'manager',
      businessType: 'fnb',
      features: proFeatures,
    });

    expect(items.map((item) => item.key)).toEqual(['pos', 'inventory']);
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
  });
});
