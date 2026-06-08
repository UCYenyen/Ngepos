// src/types/business.ts
export type BusinessType = 'retail' | 'fnb';
export type UserRole = 'owner' | 'manager' | 'cashier';
export type ReportChannel = 'email' | 'whatsapp';

export interface ReportSettings {
  report_enabled: boolean;
  report_channel: ReportChannel;
  report_recipient: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  type: BusinessType;
  logo_url?: string;
  address?: string;
  timezone: string;
  currency: string;
  created_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Invitation {
  id: string;
  business_id: string;
  email: string;
  role: UserRole;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}
