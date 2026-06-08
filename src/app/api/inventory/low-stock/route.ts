import { createServerClient } from '@/lib/supabase';
import { canManageInventory } from '@/lib/permissions';
import { getLowStockItems } from '@/lib/inventory-alerts';
import { ProductRow, ProductVariantRow, CategoryRow } from '@/types/operations';
import type { InventoryProduct } from '@/types/inventory';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface ProductWithRelations extends ProductRow {
  categories: CategoryRow | null;
  product_variants: ProductVariantRow[];
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

    const { data: member } = await supabase
      .from('business_members')
      .select('role')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!canManageInventory(member.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        sku,
        price,
        category_id,
        track_stock,
        has_variants,
        stock_qty,
        low_stock_threshold,
        created_at,
        categories(name),
        product_variants(id, name, stock_qty)
      `
      )
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const typedProducts = products as unknown as ProductWithRelations[] | null;

    const inventory: InventoryProduct[] = (typedProducts || []).map((product) => {
      let currentStock = 0;

      if (product.has_variants && product.product_variants && product.product_variants.length > 0) {
        currentStock = product.product_variants.reduce(
          (sum: number, v: ProductVariantRow) => sum + (v.stock_qty || 0),
          0
        );
      } else {
        currentStock = product.stock_qty || 0;
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku || null,
        category_id: product.category_id || null,
        category_name: product.categories?.name || null,
        price: product.price,
        current_stock: currentStock,
        low_stock_threshold: product.low_stock_threshold,
        track_stock: product.track_stock,
        has_variants: product.has_variants,
        variants: product.product_variants || [],
      };
    });

    return NextResponse.json(getLowStockItems(inventory));
  } catch (error) {
    console.error('Error fetching low-stock inventory:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
