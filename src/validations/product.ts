import { z } from 'zod';
import { nameSchema, descriptionSchema, currencySchema, positiveIntSchema, slugSchema } from './common';

export const categorySchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const productSchema = z.object({
  name: nameSchema,
  categoryId: z.string().uuid('Invalid category'),
  price: currencySchema,
  cost: currencySchema,
  sku: slugSchema.optional(),
  description: descriptionSchema,
  stockQuantity: positiveIntSchema,
  barcode: z.string().optional(),
  image: z.string().url('Invalid image URL').optional(),
});

export const bulkProductSchema = z.object({
  products: z.array(productSchema).min(1, 'At least one product is required'),
});

export const productFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  minPrice: currencySchema.optional(),
  maxPrice: currencySchema.optional(),
  inStock: z.boolean().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type BulkProductInput = z.infer<typeof bulkProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;

export async function validateCategory(data: unknown) {
  try {
    const validated = categorySchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateProduct(data: unknown) {
  try {
    const validated = productSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateBulkProduct(data: unknown) {
  try {
    const validated = bulkProductSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateProductFilter(data: unknown) {
  try {
    const validated = productFilterSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}
