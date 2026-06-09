import { createServerClient, createAdminClient } from '@/lib/supabase';
import { createXenditInvoice, isXenditConfigured } from '@/lib/xendit';
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

    const amount = invoiceAmount(plan, billingCycle);

    // Subscriptions have RLS insert/update WITH CHECK (false): writes must go
    // through the service-role client, not the caller's session.
    const admin = createAdminClient();

    // Paid plan via Xendit: create a hosted invoice, park the subscription as
    // 'pending', and let the Xendit webhook activate it on payment.
    if (paymentProvider === 'xendit' && amount > 0) {
      if (!isXenditConfigured()) {
        return NextResponse.json(
          { error: 'Xendit belum dikonfigurasi di server' },
          { status: 400 }
        );
      }

      const externalId = `sub-${user.id}-${Date.now()}`;
      const origin = request.nextUrl.origin;
      let invoice;
      try {
        invoice = await createXenditInvoice({
          externalId,
          amount,
          payerEmail: user.email ?? '',
          description: `Langganan Ngepos ${plan} (${billingCycle})`,
          successRedirectUrl: `${origin}/billing?payment=success`,
          failureRedirectUrl: `${origin}/billing?payment=failed`,
        });
      } catch (xenditError) {
        console.error('Xendit invoice error:', xenditError);
        return NextResponse.json(
          { error: 'Gagal membuat tagihan Xendit' },
          { status: 502 }
        );
      }

      const { data: subscription, error: subscriptionError } = await admin
        .from('subscriptions')
        .upsert(
          {
            user_id: user.id,
            plan: plan as SubscriptionPlan,
            billing_cycle: billingCycle as BillingCycle,
            status: 'pending',
            period_start: now.toISOString(),
            period_end: periodEnd.toISOString(),
            payment_provider: 'xendit',
            payment_reference: externalId,
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (subscriptionError || !subscription) {
        console.error('Failed to upsert subscription:', subscriptionError);
        return NextResponse.json(
          { error: subscriptionError?.message ?? 'Failed to create subscription' },
          { status: 500 }
        );
      }

      await admin.from('invoices').insert({
        user_id: user.id,
        plan,
        amount,
        status: 'pending',
        billing_cycle: billingCycle,
        period_start: now.toISOString(),
        period_end: periodEnd.toISOString(),
      });

      return NextResponse.json({
        subscription,
        checkoutUrl: invoice.invoiceUrl,
      });
    }

    // Free plan or manual transfer: activate immediately.
    const { data: subscription, error: subscriptionError } = await admin
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          plan: plan as SubscriptionPlan,
          billing_cycle: billingCycle as BillingCycle,
          status: 'active',
          period_start: now.toISOString(),
          period_end: periodEnd.toISOString(),
          payment_provider: paymentProvider,
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (subscriptionError || !subscription) {
      console.error('Failed to upsert subscription:', subscriptionError);
      return NextResponse.json(
        { error: subscriptionError?.message ?? 'Failed to create subscription' },
        { status: 500 }
      );
    }

    if (amount > 0) {
      const { error: invoiceError } = await admin.from('invoices').insert({
        user_id: user.id,
        plan,
        amount,
        status: 'paid',
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
