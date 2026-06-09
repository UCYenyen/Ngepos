import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { SubscriptionPlan, BillingCycle } from '@/types/auth';

const MONTHLY_PRICE: Record<string, number> = {
  starter: 0,
  pro: 149000,
  enterprise: 0,
};

function invoiceAmount(plan: string, billingCycle: string): number {
  const monthly = MONTHLY_PRICE[plan] ?? 0;
  if (monthly === 0) return 0;
  return billingCycle === 'yearly' ? Math.round(monthly * 0.8) * 12 : monthly;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json(subscription || null);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan, billingCycle, paymentProvider } = await request.json();

    if (!plan || !billingCycle || !paymentProvider) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan: plan as SubscriptionPlan,
        billing_cycle: billingCycle as BillingCycle,
        status: paymentProvider === 'manual' ? 'active' : 'pending',
        period_start: now.toISOString(),
        period_end: periodEnd.toISOString(),
        payment_provider: paymentProvider,
      })
      .select()
      .single();

    const amount = invoiceAmount(plan, billingCycle);
    if (subscription && amount > 0) {
      const { error: invoiceError } = await supabase.from('invoices').insert({
        user_id: user.id,
        plan,
        amount,
        status: paymentProvider === 'manual' ? 'paid' : 'pending',
        billing_cycle: billingCycle,
        period_start: now.toISOString(),
        period_end: periodEnd.toISOString(),
      });
      if (invoiceError) {
        console.error('Failed to create invoice:', invoiceError);
      }
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
