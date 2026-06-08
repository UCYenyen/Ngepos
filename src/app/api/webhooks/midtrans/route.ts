import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MIDTRANS_KEY = process.env.MIDTRANS_SERVER_KEY || '';

function verifyMidtransSignature(orderId: string, statusCode: string, grossAmount: string, signature: string): boolean {
  const data = orderId + statusCode + grossAmount + MIDTRANS_KEY;
  const hash = crypto.createHash('sha512').update(data).digest('hex');
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, transaction_status, signature_key, gross_amount, status_code } = body;

    if (!verifyMidtransSignature(order_id, status_code, gross_amount, signature_key)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const statusMap: Record<string, string> = {
      capture: 'active',
      settlement: 'active',
      pending: 'pending',
      deny: 'cancelled',
      expire: 'cancelled',
      cancel: 'cancelled',
    };

    const newStatus = statusMap[transaction_status] || 'pending';

    await supabase
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('payment_reference', order_id);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
