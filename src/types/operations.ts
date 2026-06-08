import type { UserRole } from './business';

export type StockMovementType = 'sale' | 'restock' | 'adjustment' | 'damage';

export interface StockMovement {
  id: string;
  business_id: string;
  product_id: string;
  variant_id: string | null;
  type: StockMovementType;
  quantity_change: number;
  note: string | null;
  created_by: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

export interface CreateStockMovementInput {
  product_id: string;
  variant_id: string | null;
  type: StockMovementType;
  quantity_change: number;
  note: string | null;
}

export interface CreateSupplierInput {
  name: string;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  notes: string | null;
}

export interface StaffPermissions {
  canViewAnalytics: boolean;
  canManageProducts: boolean;
  canManageInventory: boolean;
  canProcessTransactions: boolean;
  canApplyDiscounts: boolean;
  canManageStaff: boolean;
  canViewReports: boolean;
  canAccessBusinessSettings: boolean;
}

export const RolePermissions: Record<UserRole, StaffPermissions> = {
  owner: {
    canViewAnalytics: true,
    canManageProducts: true,
    canManageInventory: true,
    canProcessTransactions: true,
    canApplyDiscounts: true,
    canManageStaff: true,
    canViewReports: true,
    canAccessBusinessSettings: true,
  },
  manager: {
    canViewAnalytics: true,
    canManageProducts: true,
    canManageInventory: true,
    canProcessTransactions: true,
    canApplyDiscounts: true,
    canManageStaff: false,
    canViewReports: true,
    canAccessBusinessSettings: false,
  },
  cashier: {
    canViewAnalytics: false,
    canManageProducts: false,
    canManageInventory: false,
    canProcessTransactions: true,
    canApplyDiscounts: false,
    canManageStaff: false,
    canViewReports: false,
    canAccessBusinessSettings: false,
  },
};
