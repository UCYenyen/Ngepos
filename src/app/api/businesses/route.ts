import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getPlanConfig } from '@/lib/plans';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, type } = await request.json();
    if (!name || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 400 });
    }

    const { count } = await supabase
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id);

    const planConfig = getPlanConfig(subscription.plan);
    if (count && count >= planConfig.maxBusinesses) {
      return NextResponse.json(
        {
          error: 'Business limit reached for your plan',
          limit: planConfig.maxBusinesses,
          current: count,
        },
        { status: 400 }
      );
    }

    const { data: business } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        name,
        type,
      })
      .select()
      .single();

    if (!business) throw new Error('Failed to create business');

    await supabase.from('business_members').insert({
      business_id: business.id,
      user_id: user.id,
      role: 'owner',
    });

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
