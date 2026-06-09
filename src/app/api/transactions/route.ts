import { createServerClient } from '@/lib/supabase';
import { getLowStockItems } from '@/lib/inventory-alerts';
import { sendLowStockAlert } from '@/lib/notifications/email';
import { resolveBusinessOwnerEmail } from '@/lib/notifications/recipient';
import type { InventoryProduct } from '@/types/inventory';
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

interface SoldProductSnapshot {
  id: string;
  name: string;
  sku: string | null;
  category_id: string | null;
  price: number;
  track_stock: boolean;
  has_variants: boolean;
  stock_qty: number | null;
  low_stock_threshold: number | null;
  product_variants: { stock_qty: number }[];
}

async function dispatchLowStockAlertForSoldItems(
  supabase: ReturnType<typeof createServerClient>,
  businessId: string,
  items: TransactionItemInput[]
): Promise<void> {
  try {
    const productIds = [...new Set(items.map((item) => item.product_id))];
    if (productIds.length === 0) {
      return;
    }

    const { data: products } = await supabase
      .from('products')
      .select(
        'id, name, sku, category_id, price, track_stock, has_variants, stock_qty, low_stock_threshold, product_variants(stock_qty)'
      )
      .eq('business_id', businessId)
      .in('id', productIds)
      .returns<SoldProductSnapshot[]>();

    if (!products || products.length === 0) {
      return;
    }

    const inventory: InventoryProduct[] = products.map((product) => {
      const currentStock = product.has_variants
        ? (product.product_variants || []).reduce((sum, v) => sum + (v.stock_qty || 0), 0)
        : product.stock_qty || 0;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category_id: product.category_id,
        category_name: null,
        price: product.price,
        current_stock: currentStock,
        low_stock_threshold: product.low_stock_threshold,
        track_stock: product.track_stock,
        has_variants: product.has_variants,
        variants: [],
      };
    });

    const lowStockItems = getLowStockItems(inventory);
    if (lowStockItems.length === 0) {
      return;
    }

    const recipient = await resolveBusinessOwnerEmail(supabase, businessId);
    if (!recipient) {
      return;
    }

    await sendLowStockAlert({
      to: recipient.email,
      businessName: recipient.businessName,
      products: lowStockItems,
    });
  } catch (error) {
    console.error('Low-stock alert dispatch failed:', error);
  }
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
  tableId?: string | null;
  tableOrderId?: string | null;
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
      tableId,
      tableOrderId,
    }: CreateTransactionRequest = await request.json();

    if (
      !businessId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      total === undefined ||
      total === null ||
      subtotal === undefined ||
      subtotal === null ||
      tax_amount === undefined ||
      tax_amount === null ||
      discount_amount === undefined ||
      discount_amount === null
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

    const createdId = (transaction as { id?: string } | null)?.id;
    if (createdId && tableOrderId) {
      const { error: settleError } = await supabase
        .from('table_orders')
        .update({
          transaction_id: createdId,
          status: 'paid',
          closed_at: new Date().toISOString(),
        })
        .eq('id', tableOrderId);
      if (settleError) {
        console.error('Failed to settle table order:', settleError);
      }
    } else if (createdId && tableId) {
      const { error: tableOrderError } = await supabase
        .from('table_orders')
        .insert({
          table_id: tableId,
          transaction_id: createdId,
          status: 'paid',
          closed_at: new Date().toISOString(),
        });
      if (tableOrderError) {
        console.error('Failed to link table order:', tableOrderError);
      }
    }

    await dispatchLowStockAlertForSoldItems(supabase, businessId, items);

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
