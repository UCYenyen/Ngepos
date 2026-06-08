import type { PlanConfig } from '@/lib/plans';
import type { BusinessType, UserRole } from '@/types/business';
import {
  canManageInventory,
  canManageStaff,
  canProcessTransactions,
} from '@/lib/permissions';

export type PlanFeatures = PlanConfig['features'];

export interface NavItem {
  label: string;
  href: string;
  key: string;
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
  features,
}: GetNavItemsParams): NavItem[] {
  const items: NavItem[] = [];

  if (canProcessTransactions(role)) {
    items.push({ label: 'POS', href: `/${businessId}/pos`, key: 'pos' });
  }

  if (features.inventory && canManageInventory(role)) {
    items.push({
      label: 'Inventory',
      href: `/${businessId}/inventory`,
      key: 'inventory',
    });
  }

  if (canManageStaff(role)) {
    items.push({ label: 'Staff', href: `/${businessId}/staff`, key: 'staff' });
  }

  return items;
}
