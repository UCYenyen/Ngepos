import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z
  .string()
  .regex(/^[0-9\s\-\+\(\)]+$/, 'Invalid phone number format')
  .refine((val) => val.replace(/\D/g, '').length >= 10, 'Phone number must be at least 10 digits');

export const urlSchema = z.string().url('Invalid URL');

export const currencySchema = z
  .number()
  .positive('Amount must be greater than 0')
  .or(z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid currency format').transform(Number));

export const positiveIntSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be greater than 0')
  .or(z.string().regex(/^\d+$/, 'Must be a positive integer').transform(Number));

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters');

export const descriptionSchema = z
  .string()
  .max(500, 'Description must not exceed 500 characters')
  .optional();

export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');

export type EmailType = z.infer<typeof emailSchema>;
export type PasswordType = z.infer<typeof passwordSchema>;
export type PhoneType = z.infer<typeof phoneSchema>;
export type UrlType = z.infer<typeof urlSchema>;
export type CurrencyType = z.infer<typeof currencySchema>;
export type PositiveIntType = z.infer<typeof positiveIntSchema>;
