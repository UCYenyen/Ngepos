import type { SubscriptionPlan } from '@/types/auth';
import type { BusinessType } from '@/types/business';

export type OnboardingStep = 'plan' | 'business';

export interface OnboardingFormState {
  step: OnboardingStep;
  selectedPlan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  businessName: string;
  businessType: BusinessType;
  loading: boolean;
  error: string;
}
