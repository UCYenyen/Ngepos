// src/lib/auth.ts
import { cache } from 'react';
import { createServerClient, createAdminClient } from './supabase';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPlanConfig, type PlanConfig, type PlanName } from '@/lib/plans';
import { isSubscriptionActive } from '@/lib/subscription';
import type { Subscription } from '@/types/auth';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentSubscription(): Promise<Subscription | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (subscription as Subscription) || null;
}

export const getBusinessPlanFeatures = cache(
  async (businessId: string): Promise<PlanConfig['features']> => {
    const restrictive = getPlanConfig('starter').features;
    try {
      const admin = createAdminClient();

      const { data: business } = await admin
        .from('businesses')
        .select('owner_id')
        .eq('id', businessId)
        .maybeSingle<{ owner_id: string }>();
      if (!business) return restrictive;

      const { data: subscription } = await admin
        .from('subscriptions')
        .select('plan, status, period_end')
        .eq('user_id', business.owner_id)
        .maybeSingle<{ plan: PlanName; status: string; period_end: string | null }>();

      if (
        !subscription ||
        !isSubscriptionActive(subscription.status, subscription.period_end)
      ) {
        return restrictive;
      }
      return getPlanConfig(subscription.plan).features;
    } catch (error) {
      console.error('Error resolving business plan features:', error);
      return restrictive;
    }
  }
);

export const getBusinessPlan = cache(
  async (businessId: string): Promise<PlanName> => {
    try {
      const admin = createAdminClient();

      const { data: business } = await admin
        .from('businesses')
        .select('owner_id')
        .eq('id', businessId)
        .maybeSingle<{ owner_id: string }>();
      if (!business) return 'starter';

      const { data: subscription } = await admin
        .from('subscriptions')
        .select('plan, status, period_end')
        .eq('user_id', business.owner_id)
        .maybeSingle<{ plan: PlanName; status: string; period_end: string | null }>();

      if (
        !subscription ||
        !isSubscriptionActive(subscription.status, subscription.period_end)
      ) {
        return 'starter';
      }
      return subscription.plan;
    } catch (error) {
      console.error('Error resolving business plan:', error);
      return 'starter';
    }
  }
);

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
    redirect('/dashboard');
  }

  return access;
}
