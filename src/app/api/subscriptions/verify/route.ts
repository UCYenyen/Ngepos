import { createServerClient, createAdminClient } from '@/lib/supabase';
import { getXenditInvoiceStatus, isXenditConfigured } from '@/lib/xendit';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const PAID_STATUSES = new Set(['PAID', 'SETTLED']);

// Confirms a pending Xendit subscription by polling the invoice status, then
// activates it. This is the fallback when the inbound webhook can't reach the
// app (e.g. localhost), and a safety net in prod for missed webhooks.
export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan, status, payment_reference')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!subscription) return NextResponse.json({ status: 'none' });
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
      const admin = createAdminClient();
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
