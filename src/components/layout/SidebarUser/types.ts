import type { UserRole } from '@/types/business';

export interface SidebarUserProps {
  name: string;
  email: string;
  role: UserRole;
}
