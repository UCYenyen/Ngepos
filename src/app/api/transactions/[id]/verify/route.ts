import { createServerClient, createAdminClient } from '@/lib/supabase';
import { getXenditInvoiceStatus, isXenditConfigured } from '@/lib/xendit';
import { getBusinessXenditKey } from '@/lib/payments';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const PAID_STATUSES = new Set(['PAID', 'SETTLED']);

interface TransactionRow {
  business_id: string;
  payment_status: string;
  gateway_reference: string | null;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const { data: transaction } = await supabase
      .from('transactions')
      .select('business_id, payment_status, gateway_reference')
      .eq('id', id)
      .maybeSingle<TransactionRow>();

    if (!transaction) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: membership } = await supabase
      .from('business_members')
      .select('user_id')
      .eq('business_id', transaction.business_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (transaction.payment_status === 'paid') {
      return NextResponse.json({ status: 'paid' });
    }

    const businessXenditKey = await getBusinessXenditKey(
      transaction.business_id
    );

    if (
      !transaction.gateway_reference ||
      !(businessXenditKey || isXenditConfigured())
    ) {
      return NextResponse.json({ status: transaction.payment_status });
    }

    const invoiceStatus = await getXenditInvoiceStatus(
      transaction.gateway_reference,
      businessXenditKey ?? undefined
    );

    if (invoiceStatus && PAID_STATUSES.has(invoiceStatus)) {
      const admin = createAdminClient();
      await admin
        .from('transactions')
        .update({ payment_status: 'paid' })
        .eq('id', id);
      return NextResponse.json({ status: 'paid' });
    }

    return NextResponse.json({ status: 'pending' });
  } catch (error) {
    console.error('Error verifying transaction payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
