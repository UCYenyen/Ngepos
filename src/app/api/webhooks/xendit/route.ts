import { createAdminClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || '';

// Xendit invoice statuses -> our subscription_status.
const SUBSCRIPTION_STATUS: Record<string, string> = {
  PAID: 'active',
  SETTLED: 'active',
  EXPIRED: 'cancelled',
  PENDING: 'pending',
};

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

    const newStatus = SUBSCRIPTION_STATUS[status] ?? 'pending';
    const admin = createAdminClient();

    const { data: subscription } = await admin
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('payment_reference', externalId)
      .select('user_id')
      .maybeSingle();

    if (subscription) {
      const invoiceStatus =
        newStatus === 'active'
          ? 'paid'
          : newStatus === 'cancelled'
            ? 'failed'
            : 'pending';
      await admin
        .from('invoices')
        .update({ status: invoiceStatus })
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
