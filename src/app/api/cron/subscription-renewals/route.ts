import { createAdminClient } from '@/lib/supabase';
import { createXenditInvoice, isXenditConfigured } from '@/lib/xendit';
import { invoiceAmount, nextPeriodEnd } from '@/lib/billing-cycle';
import { NextRequest, NextResponse } from 'next/server';
import type { BillingCycle } from '@/types/auth';

const CRON_SECRET = process.env.CRON_SECRET || '';
const RENEWAL_WINDOW_DAYS = 3;

interface DueSubscription {
  user_id: string;
  plan: string;
  billing_cycle: string;
  period_end: string;
}

// Hit on a schedule (pg_cron / external cron). For paid subscriptions nearing
// period_end with no outstanding renewal, create a Xendit renewal invoice and
// park its reference. Payment (webhook or verify-on-return) rolls period_end
// forward. Protected by a bearer CRON_SECRET.
export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization') || '';
    if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isXenditConfigured()) {
      return NextResponse.json({ error: 'Xendit not configured' }, { status: 400 });
    }

    const admin = createAdminClient();
    const cutoff = new Date(
      Date.now() + RENEWAL_WINDOW_DAYS * 86_400_000
    ).toISOString();

    const { data: due } = await admin
      .from('subscriptions')
      .select('user_id, plan, billing_cycle, period_end')
      .eq('status', 'active')
      .is('renewal_reference', null)
      .neq('plan', 'starter')
      .lte('period_end', cutoff)
      .returns<DueSubscription[]>();

    const subs = (due ?? []).filter(
      (sub) => invoiceAmount(sub.plan, sub.billing_cycle) > 0
    );

    const origin = request.nextUrl.origin;
    let created = 0;

    for (const sub of subs) {
      const amount = invoiceAmount(sub.plan, sub.billing_cycle);
      const externalId = `renew-${sub.user_id}-${Date.now()}`;

      let payerEmail = 'billing@ngepos.app';
      try {
        const { data } = await admin.auth.admin.getUserById(sub.user_id);
        payerEmail = data.user?.email ?? payerEmail;
      } catch {
        // keep fallback email
      }

      try {
        const invoice = await createXenditInvoice({
          externalId,
          amount,
          payerEmail,
          description: `Perpanjangan langganan Ngepos ${sub.plan} (${sub.billing_cycle})`,
          successRedirectUrl: `${origin}/billing?payment=success`,
          failureRedirectUrl: `${origin}/billing?payment=failed`,
        });

        await admin
          .from('subscriptions')
          .update({
            renewal_reference: externalId,
            renewal_invoice_url: invoice.invoiceUrl,
          })
          .eq('user_id', sub.user_id);

        await admin.from('invoices').insert({
          user_id: sub.user_id,
          plan: sub.plan,
          amount,
          status: 'pending',
          billing_cycle: sub.billing_cycle,
          period_start: sub.period_end,
          period_end: nextPeriodEnd(
            sub.period_end,
            sub.billing_cycle as BillingCycle
          ),
        });

        created += 1;
      } catch (renewalError) {
        console.error('Renewal invoice failed for', sub.user_id, renewalError);
      }
    }

    return NextResponse.json({ due: subs.length, created });
  } catch (error) {
    console.error('Renewal cron error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
