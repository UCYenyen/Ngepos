import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { businessId, items, subtotal, discount_amount, tax_amount, total, payment_method, notes } =
      await request.json();

    if (!businessId || !items || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: transaction } = await supabase
      .from('transactions')
      .insert({
        business_id: businessId,
        cashier_id: user.id,
        subtotal,
        discount_amount,
        tax_amount,
        total,
        payment_method,
        payment_status: payment_method === 'cash' ? 'paid' : 'pending',
        notes,
      })
      .select()
      .single();

    if (!transaction) throw new Error('Failed to create transaction');

    const transactionItems = items.map((item: any) => ({
      transaction_id: transaction.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      discount_amount: item.discount_amount,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('transaction_items')
      .insert(transactionItems);

    if (itemsError) throw itemsError;

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
