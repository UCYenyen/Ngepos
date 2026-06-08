import { z } from 'zod';
import { emailSchema, nameSchema, phoneSchema } from './common';

export const staffRoleSchema = z.enum(['admin', 'manager', 'cashier', 'staff'], {
  errorMap: () => ({ message: 'Invalid staff role' }),
});

export const staffMemberSchema = z.object({
  email: emailSchema,
  fullName: nameSchema,
  role: staffRoleSchema,
  phoneNumber: phoneSchema.optional(),
});

export const staffPermissionsSchema = z.object({
  canManageProducts: z.boolean().default(false),
  canManageInventory: z.boolean().default(false),
  canManageStaff: z.boolean().default(false),
  canViewReports: z.boolean().default(false),
  canManageSettings: z.boolean().default(false),
  canManageTables: z.boolean().default(false),
});

export const staffInviteSchema = z.object({
  email: emailSchema,
  fullName: nameSchema,
  role: staffRoleSchema,
  permissions: staffPermissionsSchema.optional(),
});

export const staffUpdateSchema = z.object({
  fullName: nameSchema.optional(),
  role: staffRoleSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  permissions: staffPermissionsSchema.optional(),
  isActive: z.boolean().optional(),
});

export type StaffRole = z.infer<typeof staffRoleSchema>;
export type StaffMemberInput = z.infer<typeof staffMemberSchema>;
export type StaffPermissionsInput = z.infer<typeof staffPermissionsSchema>;
export type StaffInviteInput = z.infer<typeof staffInviteSchema>;
export type StaffUpdateInput = z.infer<typeof staffUpdateSchema>;

export async function validateStaffMember(data: unknown) {
  try {
    const validated = staffMemberSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateStaffPermissions(data: unknown) {
  try {
    const validated = staffPermissionsSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateStaffInvite(data: unknown) {
  try {
    const validated = staffInviteSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateStaffUpdate(data: unknown) {
  try {
    const validated = staffUpdateSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export function getRolePermissions(role: StaffRole): StaffPermissionsInput {
  const basePermissions: StaffPermissionsInput = {
    canManageProducts: false,
    canManageInventory: false,
    canManageStaff: false,
    canViewReports: false,
    canManageSettings: false,
    canManageTables: false,
  };

  switch (role) {
    case 'admin':
      return {
        ...basePermissions,
        canManageProducts: true,
        canManageInventory: true,
        canManageStaff: true,
        canViewReports: true,
        canManageSettings: true,
        canManageTables: true,
      };
    case 'manager':
      return {
        ...basePermissions,
        canManageProducts: true,
        canManageInventory: true,
        canViewReports: true,
        canManageTables: true,
      };
    case 'cashier':
      return {
        ...basePermissions,
        canViewReports: true,
      };
    case 'staff':
    default:
      return basePermissions;
  }
}
