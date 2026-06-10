import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function isPlatformAdmin(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle<{ user_id: string }>();
  return Boolean(data);
}

export async function requirePlatformAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/admin');
  }
  if (!(await isPlatformAdmin(user.id))) {
    redirect('/');
  }
  return user;
}
