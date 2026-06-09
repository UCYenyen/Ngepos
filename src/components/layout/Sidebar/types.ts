import type { NavItem } from '@/lib/navigation';
import type { UserRole } from '@/types/business';
import type { SwitcherBusiness } from '@/components/layout/BusinessSwitcher/types';

export interface SidebarUserInfo {
  name: string;
  email: string;
  role: UserRole;
}

export interface SidebarProps {
  current: SwitcherBusiness;
  businesses: SwitcherBusiness[];
  items: NavItem[];
  user: SidebarUserInfo;
}
