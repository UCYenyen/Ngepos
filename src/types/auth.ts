// src/types/auth.ts
export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled';
export type PaymentProvider = 'midtrans' | 'xendit' | 'manual';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  period_start: string;
  period_end: string;
  payment_provider: PaymentProvider;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}
