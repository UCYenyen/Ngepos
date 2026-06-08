import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const XENDIT_KEY = process.env.XENDIT_SECRET_KEY || '';

function verifyXenditSignature(payload: string, signature: string): boolean {
  const hash = crypto.createHmac('sha256', XENDIT_KEY).update(payload).digest('hex');
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-xendit-webhook-token') || '';

    if (!verifyXenditSignature(payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(payload);
    const { reference_id, status } = body;

    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const statusMap: Record<string, string> = {
      COMPLETED: 'active',
      PENDING: 'pending',
      FAILED: 'cancelled',
      EXPIRED: 'cancelled',
    };

    const newStatus = statusMap[status] || 'pending';

    await supabase
      .from('subscriptions')
      .update({ status: newStatus })
      .eq('payment_reference', reference_id);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Xendit webhook error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
