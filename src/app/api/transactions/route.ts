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
    }: {
      businessId: string;
      items: TransactionItemInput[];
      subtotal: number;
      discount_amount: number;
      tax_amount: number;
      total: number;
      payment_method: string;
      notes: string | null;
    } = await request.json();

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

    const transactionItems = items.map((item: TransactionItemInput) => ({
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

    for (const item of items) {
      try {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, has_variants, track_stock, stock_qty')
          .eq('id', item.product_id)
          .eq('business_id', businessId)
          .single();

        if (productError || !product) continue;

        const { error: movementError } = await supabase.from('stock_movements').insert({
          business_id: businessId,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          type: 'sale',
          quantity_change: -item.quantity,
          note: null,
          created_by: user.id,
        });

        if (movementError) throw movementError;

        if (product.track_stock) {
          if (item.variant_id) {
            const { data: variant, error: variantFetchError } = await supabase
              .from('product_variants')
              .select('stock_qty')
              .eq('id', item.variant_id)
              .eq('product_id', item.product_id)
              .single();

            if (variantFetchError) throw variantFetchError;

            const newStock = (variant?.stock_qty || 0) - item.quantity;
            const { error: variantUpdateError } = await supabase
              .from('product_variants')
              .update({ stock_qty: newStock })
              .eq('id', item.variant_id)
              .eq('product_id', item.product_id);

            if (variantUpdateError) throw variantUpdateError;
          } else {
            const newStock = (product.stock_qty || 0) - item.quantity;
            const { error: productUpdateError } = await supabase
              .from('products')
              .update({ stock_qty: newStock })
              .eq('id', item.product_id);

            if (productUpdateError) throw productUpdateError;
          }
        }
      } catch (stockError) {
        console.error('Error updating stock for item:', item.product_id, stockError);
      }
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
