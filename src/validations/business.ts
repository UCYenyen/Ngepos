import { z } from 'zod';
import { nameSchema, descriptionSchema } from './common';

export const businessTypeSchema = z.enum(['retail', 'fnb'], {
  error: 'Business type must be either retail or F&B',
});

export const createBusinessSchema = z.object({
  businessName: nameSchema,
  businessType: businessTypeSchema,
  description: descriptionSchema,
  city: z.string().max(50, 'City must not exceed 50 characters').optional(),
});

export const businessSettingsSchema = z.object({
  businessName: nameSchema,
  description: descriptionSchema,
  city: z.string().max(50, 'City must not exceed 50 characters').optional(),
  contactPerson: nameSchema.optional(),
  contactPhone: z
    .string()
    .regex(/^[0-9\s\-\+\(\)]+$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
});

export const businessMemberInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'staff'], {
    error: 'Invalid role',
  }),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type BusinessSettingsInput = z.infer<typeof businessSettingsSchema>;
export type BusinessMemberInviteInput = z.infer<typeof businessMemberInviteSchema>;
export type BusinessType = z.infer<typeof businessTypeSchema>;

export async function validateCreateBusiness(data: unknown) {
  try {
    const validated = createBusinessSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateBusinessSettings(data: unknown) {
  try {
    const validated = businessSettingsSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateBusinessMemberInvite(data: unknown) {
  try {
    const validated = businessMemberInviteSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}
