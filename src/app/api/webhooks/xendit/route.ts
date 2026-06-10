import { createAdminClient } from '@/lib/supabase';
import { nextPeriodEnd } from '@/lib/billing-cycle';
import { initialInvoiceTargetStatus } from '@/lib/subscription';
import { NextRequest, NextResponse } from 'next/server';
import type { BillingCycle } from '@/types/auth';

const CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || '';
const PAID_STATUSES = new Set(['PAID', 'SETTLED']);

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('x-callback-token') || '';
    if (!CALLBACK_TOKEN || token !== CALLBACK_TOKEN) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = (await request.json()) as {
      external_id?: string;
      status?: string;
    };

    const externalId = body.external_id;
    const status = body.status ?? '';
    if (!externalId) {
      return NextResponse.json({ error: 'Missing external_id' }, { status: 400 });
    }

    const isPaid = PAID_STATUSES.has(status);
    const isExpired = status === 'EXPIRED';
    const admin = createAdminClient();

    // Renewal payment: roll period_end forward instead of (re)activating.
    const { data: renewal } = await admin
      .from('subscriptions')
      .select('user_id, billing_cycle, period_end')
      .eq('renewal_reference', externalId)
      .maybeSingle<{
        user_id: string;
        billing_cycle: BillingCycle;
        period_end: string;
      }>();

    if (renewal) {
      if (isPaid) {
        await admin
          .from('subscriptions')
          .update({
            status: 'active',
            period_end: nextPeriodEnd(renewal.period_end, renewal.billing_cycle),
            renewal_reference: null,
            renewal_invoice_url: null,
          })
          .eq('user_id', renewal.user_id);
        await admin
          .from('invoices')
          .update({ status: 'paid' })
          .eq('user_id', renewal.user_id)
          .eq('status', 'pending');
      } else if (isExpired) {
        // Renewal invoice lapsed: drop the outstanding renewal but keep the sub
        // active until period_end. A later cron run reissues the renewal.
        await admin
          .from('subscriptions')
          .update({ renewal_reference: null, renewal_invoice_url: null })
          .eq('user_id', renewal.user_id);
      }
      return NextResponse.json({ status: 'ok' });
    }

    // Initial checkout invoice. Only a still-'pending' checkout may transition,
    // so a stale EXPIRED (or PENDING) callback can never downgrade a sub that is
    // already active/paid. PENDING/unknown events map to null and are ignored.
    const target = initialInvoiceTargetStatus(status);
    if (!target) {
      return NextResponse.json({ status: 'ok' });
    }

    const { data: subscription } = await admin
      .from('subscriptions')
      .update({ status: target })
      .eq('payment_reference', externalId)
      .eq('status', 'pending')
      .select('user_id')
      .maybeSingle();

    if (subscription) {
      await admin
        .from('invoices')
        .update({ status: target === 'active' ? 'paid' : 'failed' })
        .eq('user_id', subscription.user_id)
        .eq('status', 'pending');
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Xendit webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
