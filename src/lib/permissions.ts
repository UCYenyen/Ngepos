import { RolePermissions, StaffPermissions } from '@/types/operations';
import type { UserRole } from '@/types/business';

export function getPermissionsByRole(role: UserRole): StaffPermissions {
  return RolePermissions[role];
}

export function canManageInventory(role: UserRole): boolean {
  return RolePermissions[role].canManageInventory;
}

export function canManageStaff(role: UserRole): boolean {
  return RolePermissions[role].canManageStaff;
}

export function canApplyDiscount(role: UserRole): boolean {
  return RolePermissions[role].canApplyDiscounts;
}

export function canViewAnalytics(role: UserRole): boolean {
  return RolePermissions[role].canViewAnalytics;
}

export function canManageProducts(role: UserRole): boolean {
  return RolePermissions[role].canManageProducts;
}

export function canProcessTransactions(role: UserRole): boolean {
  return RolePermissions[role].canProcessTransactions;
}

export function canViewReports(role: UserRole): boolean {
  return RolePermissions[role].canViewReports;
}

export function canAccessBusinessSettings(role: UserRole): boolean {
  return RolePermissions[role].canAccessBusinessSettings;
}

export function hasPermission(
  role: UserRole,
  permission: keyof StaffPermissions
): boolean {
  return RolePermissions[role][permission];
}
