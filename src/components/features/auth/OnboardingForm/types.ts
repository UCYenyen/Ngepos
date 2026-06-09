import type { BusinessType } from '@/types/business';

export interface OnboardingFormState {
  businessName: string;
  businessType: BusinessType;
  timezone: string;
  currency: string;
  loading: boolean;
  error: string;
}
