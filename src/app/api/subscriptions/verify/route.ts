import { createServerClient, createAdminClient } from '@/lib/supabase';
import { getXenditInvoiceStatus, isXenditConfigured } from '@/lib/xendit';
import { nextPeriodEnd } from '@/lib/billing-cycle';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { BillingCycle } from '@/types/auth';

const PAID_STATUSES = new Set(['PAID', 'SETTLED']);

interface SubscriptionRow {
  plan: string;
  status: string;
  payment_reference: string | null;
  renewal_reference: string | null;
  billing_cycle: BillingCycle;
  period_end: string | null;
}

// Confirms a pending/renewing Xendit subscription by polling the invoice status,
// then activates it (or rolls the period forward for a renewal). This is the
// fallback when the inbound webhook can't reach the app (e.g. localhost), and a
// safety net in prod for missed webhooks.
export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data } = await supabase
      .from('subscriptions')
      .select(
        'plan, status, payment_reference, renewal_reference, billing_cycle, period_end'
      )
      .eq('user_id', user.id)
      .maybeSingle();
    const subscription = data as SubscriptionRow | null;

    if (!subscription) return NextResponse.json({ status: 'none' });

    const admin = createAdminClient();

    // A renewal invoice is outstanding (sub still active): confirm + roll forward.
    if (subscription.renewal_reference && isXenditConfigured()) {
      const status = await getXenditInvoiceStatus(subscription.renewal_reference);
      if (status && PAID_STATUSES.has(status)) {
        await admin
          .from('subscriptions')
          .update({
            status: 'active',
            period_end: nextPeriodEnd(
              subscription.period_end,
              subscription.billing_cycle
            ),
            renewal_reference: null,
            renewal_invoice_url: null,
          })
          .eq('user_id', user.id);
        await admin
          .from('invoices')
          .update({ status: 'paid' })
          .eq('user_id', user.id)
          .eq('status', 'pending');
        return NextResponse.json({
          status: 'active',
          plan: subscription.plan,
          renewed: true,
        });
      }
    }

    if (subscription.status === 'active') {
      return NextResponse.json({ status: 'active', plan: subscription.plan });
    }
    if (
      subscription.status !== 'pending' ||
      !subscription.payment_reference ||
      !isXenditConfigured()
    ) {
      return NextResponse.json({ status: subscription.status });
    }

    const invoiceStatus = await getXenditInvoiceStatus(
      subscription.payment_reference
    );

    if (invoiceStatus && PAID_STATUSES.has(invoiceStatus)) {
      await admin
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('user_id', user.id);
      await admin
        .from('invoices')
        .update({ status: 'paid' })
        .eq('user_id', user.id)
        .eq('status', 'pending');
      return NextResponse.json({ status: 'active', plan: subscription.plan });
    }

    return NextResponse.json({ status: 'pending' });
  } catch (error) {
    console.error('Verify subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
