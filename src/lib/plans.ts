// src/lib/plans.ts
export type PlanName = 'starter' | 'pro' | 'enterprise';

export interface PlanConfig {
  maxBusinesses: number;
  maxProductsPerBusiness: number;
  maxStaffPerBusiness: number;
  features: {
    inventory: boolean;
    tableManagement: boolean;
    analytics: boolean;
    automatedReports: boolean;
    paymentGateway: boolean;
  };
}

export const PLANS: Record<PlanName, PlanConfig> = {
  starter: {
    maxBusinesses: 1,
    maxProductsPerBusiness: 100,
    maxStaffPerBusiness: 2,
    features: {
      inventory: false,
      tableManagement: false,
      analytics: false,
      automatedReports: false,
      paymentGateway: false,
    },
  },
  pro: {
    maxBusinesses: 5,
    maxProductsPerBusiness: 1000,
    maxStaffPerBusiness: 10,
    features: {
      inventory: true,
      tableManagement: true,
      analytics: true,
      automatedReports: true,
      paymentGateway: true,
    },
  },
  enterprise: {
    maxBusinesses: Infinity,
    maxProductsPerBusiness: Infinity,
    maxStaffPerBusiness: Infinity,
    features: {
      inventory: true,
      tableManagement: true,
      analytics: true,
      automatedReports: true,
      paymentGateway: true,
    },
  },
};

export function getPlanConfig(plan: PlanName): PlanConfig {
  return PLANS[plan];
}
