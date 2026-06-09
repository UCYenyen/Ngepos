import type { PlanConfig } from '@/lib/plans';
import type { BusinessType, UserRole } from '@/types/business';
import {
  canManageInventory,
  canManageProducts,
  canManageStaff,
  canProcessTransactions,
  canViewAnalytics,
  canViewReports,
  canAccessBusinessSettings,
} from '@/lib/permissions';

export type PlanFeatures = PlanConfig['features'];

export type NavItemKey =
  | 'pos'
  | 'products'
  | 'inventory'
  | 'tables'
  | 'staff'
  | 'analytics'
  | 'reports'
  | 'settings';

export interface NavItem {
  key: NavItemKey;
  label: string;
  href: string;
  locked: boolean;
}

interface GetNavItemsParams {
  businessId: string;
  role: UserRole;
  businessType: BusinessType;
  features: PlanFeatures;
}

export function getNavItems({
  businessId,
  role,
  businessType,
  features,
}: GetNavItemsParams): NavItem[] {
  const items: NavItem[] = [];
  const to = (key: NavItemKey): string => `/dashboard/${businessId}/${key}`;

  if (canProcessTransactions(role)) {
    items.push({ key: 'pos', label: 'POS', href: to('pos'), locked: false });
  }

  if (canManageProducts(role)) {
    items.push({
      key: 'products',
      label: 'Produk',
      href: to('products'),
      locked: false,
    });
  }

  if (canManageInventory(role)) {
    items.push({
      key: 'inventory',
      label: 'Inventaris',
      href: to('inventory'),
      locked: !features.inventory,
    });
  }

  if (businessType === 'fnb' && canProcessTransactions(role)) {
    items.push({
      key: 'tables',
      label: 'Meja',
      href: to('tables'),
      locked: !features.tableManagement,
    });
  }

  if (canManageStaff(role)) {
    items.push({ key: 'staff', label: 'Staf', href: to('staff'), locked: false });
  }

  if (canViewAnalytics(role)) {
    items.push({
      key: 'analytics',
      label: 'Analitik',
      href: to('analytics'),
      locked: !features.analytics,
    });
  }

  if (canViewReports(role)) {
    items.push({
      key: 'reports',
      label: 'Laporan',
      href: to('reports'),
      locked: !features.automatedReports,
    });
  }

  if (canAccessBusinessSettings(role)) {
    items.push({
      key: 'settings',
      label: 'Pengaturan',
      href: to('settings'),
      locked: false,
    });
  }

  return items;
}
