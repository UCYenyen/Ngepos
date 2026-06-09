import { z } from 'zod';
import { currencySchema, positiveIntSchema } from './common';

export const paymentMethodSchema = z.enum(['cash', 'card', 'qris', 'transfer'], {
  error: 'Invalid payment method',
});

export const transactionItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: positiveIntSchema,
  price: currencySchema,
});

export const transactionSchema = z.object({
  items: z.array(transactionItemSchema).min(1, 'Transaction must have at least one item'),
  paymentMethod: paymentMethodSchema,
  amountPaid: currencySchema,
  notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  discountAmount: currencySchema.optional(),
  taxAmount: currencySchema.optional(),
});

export const refundSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID'),
  items: z.array(
    z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: positiveIntSchema,
      price: currencySchema,
    })
  ).min(1, 'At least one item must be refunded'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
});

export const transactionFilterSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  paymentMethod: paymentMethodSchema.optional(),
  minAmount: currencySchema.optional(),
  maxAmount: currencySchema.optional(),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type TransactionItemInput = z.infer<typeof transactionItemSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;

export async function validateTransactionItem(data: unknown) {
  try {
    const validated = transactionItemSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateTransaction(data: unknown) {
  try {
    const validated = transactionSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateRefund(data: unknown) {
  try {
    const validated = refundSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}

export async function validateTransactionFilter(data: unknown) {
  try {
    const validated = transactionFilterSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors;
      return { success: false, errors };
    }
    throw error;
  }
}
