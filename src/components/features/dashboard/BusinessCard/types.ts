import type { BusinessType, UserRole } from '@/types/business';

export interface BusinessCardProps {
  id: string;
  name: string;
  type: BusinessType;
  role: UserRole;
  logoUrl?: string | null;
  memberCount?: number;
}
