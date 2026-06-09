import type { BusinessType, UserRole } from '@/types/business';

export interface BusinessCardProps {
  id: string;
  name: string;
  type: BusinessType;
  role: UserRole;
  memberCount?: number;
}
