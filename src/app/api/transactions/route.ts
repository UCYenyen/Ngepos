import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface TransactionItemInput {
  product_id: string;
  variant_id: string | null;
  name: string;
  price: number;
  quantity: number;
  discount_amount: number;
  subtotal: number;
}

interface CreateTransactionRequest {
  businessId: string;
  items: TransactionItemInput[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_method: string;
  notes: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      businessId,
      items,
      subtotal,
      discount_amount,
      tax_amount,
      total,
      payment_method,
      notes,
    }: CreateTransactionRequest = await request.json();

    if (
      !businessId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      total === undefined ||
      total === null
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: membership } = await supabase
      .from('business_members')
      .select('user_id')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: transaction, error } = await supabase.rpc('create_pos_transaction', {
      p_business_id: businessId,
      p_items: items,
      p_subtotal: subtotal,
      p_discount_amount: discount_amount,
      p_tax_amount: tax_amount,
      p_total: total,
      p_payment_method: payment_method,
      p_notes: notes ?? null,
    });

    if (error) {
      console.error('Error creating transaction:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const businessId = request.nextUrl.searchParams.get('businessId');
    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, transaction_items(*)')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    return NextResponse.json(transactions || []);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
