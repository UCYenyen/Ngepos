import type { UserRole } from '@/types/business';

export function validateRole(role: string): role is Exclude<UserRole, 'owner'> {
  return role === 'manager' || role === 'cashier';
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}
