// src/lib/auth.ts
import { createServerClient } from './supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentSubscription() {
  const user = await getCurrentUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return subscription || null;
}

export async function getUserBusinesses() {
  const user = await getCurrentUser();
  if (!user) return [];

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: members } = await supabase
    .from('business_members')
    .select('business_id, businesses(*)')
    .eq('user_id', user.id);

  return members?.map((m) => m.businesses) || [];
}

export async function getBusinessWithMember(businessId: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: member } = await supabase
    .from('business_members')
    .select('*')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .single();

  if (!member) return null;

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  return { business, member };
}

export async function requireAuth(redirectTo: string = '/login') {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}

export async function requireBusinessAccess(businessId: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const access = await getBusinessWithMember(businessId);
  if (!access) {
    redirect('/');
  }

  return access;
}
