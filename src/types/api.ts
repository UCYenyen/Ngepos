import type { UserRole } from '@/types/business';

export interface StaffMemberResponse {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface StaffListResponse {
  success: true;
  data: {
    staff: StaffMemberResponse[];
  };
}

export interface StaffInvitationResponse {
  success: true;
  data: {
    invitation_id: string;
    invitation_token: string;
  };
}

export interface StaffUpdateResponse {
  success: true;
  data: {
    updated_at: string;
  };
}
