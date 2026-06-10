import type { BusinessType } from '@/types/business';

export interface SwitcherBusiness {
  id: string;
  name: string;
  type: BusinessType;
  logoUrl?: string | null;
}

export interface BusinessSwitcherProps {
  current: SwitcherBusiness;
  businesses: SwitcherBusiness[];
}
