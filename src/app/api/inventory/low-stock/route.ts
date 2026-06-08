import { createServerClient } from '@/lib/supabase';
import { canManageInventory } from '@/lib/permissions';
import { getLowStockItems } from '@/lib/inventory-alerts';
import {
  INVENTORY_PRODUCT_SELECT,
  mapToInventoryProduct,
  type ProductWithRelations,
} from '@/lib/inventory-query';
import type { InventoryProduct } from '@/types/inventory';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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
      .select(INVENTORY_PRODUCT_SELECT)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const typedProducts = products as unknown as ProductWithRelations[] | null;

    const inventory: InventoryProduct[] = (typedProducts || []).map(mapToInventoryProduct);

    return NextResponse.json(getLowStockItems(inventory));
  } catch (error) {
    console.error('Error fetching low-stock inventory:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
