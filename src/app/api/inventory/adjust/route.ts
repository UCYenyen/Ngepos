import { createServerClient } from '@/lib/supabase';
import { canManageInventory } from '@/lib/permissions';
import { isLowStock } from '@/lib/inventory-alerts';
import { sendLowStockAlert } from '@/lib/notifications/email';
import { resolveBusinessOwnerEmail } from '@/lib/notifications/recipient';
import type { InventoryProduct } from '@/types/inventory';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface AdjustedProductSnapshot {
  id: string;
  name: string;
  sku: string | null;
  category_id: string | null;
  price: number;
  track_stock: boolean;
  has_variants: boolean;
  stock_qty: number | null;
  low_stock_threshold: number | null;
}

async function dispatchLowStockAlertIfNeeded(
  supabase: ReturnType<typeof createServerClient>,
  businessId: string,
  productId: string
): Promise<void> {
  try {
    const { data: product } = await supabase
      .from('products')
      .select(
        'id, name, sku, category_id, price, track_stock, has_variants, stock_qty, low_stock_threshold, product_variants(stock_qty)'
      )
      .eq('id', productId)
      .eq('business_id', businessId)
      .single<AdjustedProductSnapshot & { product_variants: { stock_qty: number }[] }>();

    if (!product || !product.track_stock) {
      return;
    }

    const currentStock = product.has_variants
      ? (product.product_variants || []).reduce((sum, v) => sum + (v.stock_qty || 0), 0)
      : product.stock_qty || 0;

    if (!isLowStock(currentStock, product.low_stock_threshold)) {
      return;
    }

    const recipient = await resolveBusinessOwnerEmail(supabase, businessId);
    if (!recipient) {
      return;
    }

    const lowStockProduct: InventoryProduct = {
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

    await sendLowStockAlert({
      to: recipient.email,
      businessName: recipient.businessName,
      products: [lowStockProduct],
    });
  } catch (error) {
    console.error('Low-stock alert dispatch failed:', error);
  }
}

interface StockAdjustmentRequest {
  businessId: string;
  productId: string;
  variantId?: string;
  type: 'restock' | 'adjustment' | 'damage';
  quantity_change: number;
  note?: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body: StockAdjustmentRequest = await request.json();
    const { businessId, productId, variantId, type, quantity_change, note } = body;

    // Validate required fields
    if (!businessId || !productId || !type || quantity_change === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate type
    if (!['restock', 'adjustment', 'damage'].includes(type)) {
      return NextResponse.json({ error: 'Invalid adjustment type' }, { status: 400 });
    }

    // Verify user can access business
    const { data: member } = await supabase
      .from('business_members')
      .select('role')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check permission to manage inventory
    if (!canManageInventory(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Verify product exists and belongs to business
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, has_variants, track_stock, stock_qty')
      .eq('id', productId)
      .eq('business_id', businessId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Create stock movement record
    const { data: movement, error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        business_id: businessId,
        product_id: productId,
        variant_id: variantId || null,
        type,
        quantity_change,
        note: note || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (movementError) throw movementError;

    // Update product stock if track_stock is enabled
    if (product.track_stock) {
      if (variantId) {
        const { data: variant, error: variantFetchError } = await supabase
          .from('product_variants')
          .select('stock_qty')
          .eq('id', variantId)
          .eq('product_id', productId)
          .single();

        if (variantFetchError) throw variantFetchError;

        const newStock = (variant?.stock_qty || 0) + quantity_change;
        const { error: variantUpdateError } = await supabase
          .from('product_variants')
          .update({ stock_qty: newStock })
          .eq('id', variantId)
          .eq('product_id', productId);

        if (variantUpdateError) throw variantUpdateError;
      } else {
        const newStock = (product.stock_qty || 0) + quantity_change;
        const { error: productUpdateError } = await supabase
          .from('products')
          .update({ stock_qty: newStock })
          .eq('id', productId);

        if (productUpdateError) throw productUpdateError;
      }
    }

    await dispatchLowStockAlertIfNeeded(supabase, businessId, productId);

    return NextResponse.json({
      success: true,
      movement_id: movement.id,
    });
  } catch (error) {
    console.error('Error adjusting inventory:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
