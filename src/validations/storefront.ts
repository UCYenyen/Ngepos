import { z } from 'zod';
import { emailSchema, phoneSchema } from './common';

const RESERVED_SUBDOMAINS = [
  'app',
  'www',
  'api',
  'admin',
  'dashboard',
  'studio',
  'supabase',
  'mail',
  'ngepos',
];

export const subdomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Subdomain must be at least 3 characters')
  .max(30, 'Subdomain must not exceed 30 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Use lowercase letters, numbers, and single hyphens (no leading, trailing, or double hyphens)'
  )
  .refine((val) => !RESERVED_SUBDOMAINS.includes(val), 'This subdomain is reserved');

export const checkoutItemSchema = z.object({
  product_id: z.string().uuid('Invalid product'),
  variant_id: z.string().uuid('Invalid variant').nullish(),
  qty: z.number().int().positive('Quantity must be at least 1'),
});

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  customerPhone: phoneSchema,
  customerEmail: emailSchema,
  note: z.string().max(500, 'Note must not exceed 500 characters').optional(),
  items: z.array(checkoutItemSchema).min(1, 'Add at least one item to your order'),
});

export type SubdomainInput = z.infer<typeof subdomainSchema>;
export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export function validateSubdomain(value: unknown) {
  const result = subdomainSchema.safeParse(value);
  if (result.success) {
    return { success: true as const, data: result.data };
  }
  return { success: false as const, errors: result.error.flatten().formErrors };
}

export function validateCheckout(data: unknown) {
  const result = checkoutSchema.safeParse(data);
  if (result.success) {
    return { success: true as const, data: result.data };
  }
  return { success: false as const, errors: result.error.flatten().fieldErrors };
}

export { RESERVED_SUBDOMAINS };
