import { createServerClient, createAdminClient } from '@/lib/supabase';
import { canViewAnalytics } from '@/lib/permissions';
import { StockMovement } from '@/types/operations';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface ProductData {
  name: string;
}

interface VariantData {
  name: string;
}

interface StockMovementData {
  id: string;
  product_id: string;
  variant_id: string | null;
  type: 'sale' | 'restock' | 'adjustment' | 'damage';
  quantity_change: number;
  note: string | null;
  created_by: string;
  created_at: string;
  products: ProductData | null;
  product_variants: VariantData | null;
}

interface StockMovementResponse {
  id: string;
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_name: string | null;
  type: 'sale' | 'restock' | 'adjustment' | 'damage';
  quantity_change: number;
  note: string | null;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

interface MovementsResponse {
  movements: StockMovementResponse[];
  total: number;
  limit: number;
  offset: number;
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
    const productId = request.nextUrl.searchParams.get('productId');
    const createdBy = request.nextUrl.searchParams.get('createdBy');
    const limitParam = request.nextUrl.searchParams.get('limit');
    const offsetParam = request.nextUrl.searchParams.get('offset');

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
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

    // Parse pagination parameters
    const limit = Math.min(parseInt(limitParam || '50'), 500);
    const offset = parseInt(offsetParam || '0');

    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return NextResponse.json({ error: 'Invalid limit or offset' }, { status: 400 });
    }

    // Check if user can view all analytics or restricted to own movements
    const canViewAll = canViewAnalytics(member.role);
    const viewingOwnOnly = !canViewAll && member.role === 'cashier';

    // If cashier is trying to view someone else's movements, deny access
    if (viewingOwnOnly && createdBy && createdBy !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Determine which user's movements to filter by
    const createdByFilter = viewingOwnOnly ? user.id : createdBy;

    // Build query with filters
    let query = supabase
      .from('stock_movements')
      .select(
        `
        id,
        product_id,
        variant_id,
        type,
        quantity_change,
        note,
        created_by,
        created_at,
        products(name),
        product_variants(name)
      `,
        { count: 'exact' }
      )
      .eq('business_id', businessId);

    // Apply filters
    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (createdByFilter) {
      query = query.eq('created_by', createdByFilter);
    }

    // Fetch with pagination
    const { data: movements, count, error: movementsError } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (movementsError) throw movementsError;

    const typedMovements = movements as unknown as StockMovementData[] | null;
    const movementRows = typedMovements || [];

    const admin = createAdminClient();
    const creatorIds = [...new Set(movementRows.map((movement) => movement.created_by))];
    const creatorNames = new Map<string, string>();

    for (const creatorId of creatorIds) {
      const { data: authData } = await admin.auth.admin.getUserById(creatorId);
      const authUser = authData?.user;
      creatorNames.set(creatorId, authUser?.user_metadata?.name ?? authUser?.email ?? 'Unknown User');
    }

    const transformedMovements: StockMovementResponse[] = movementRows.map((movement) => ({
      id: movement.id,
      product_id: movement.product_id,
      product_name: movement.products?.name || 'Unknown Product',
      variant_id: movement.variant_id,
      variant_name: movement.product_variants?.name || null,
      type: movement.type,
      quantity_change: movement.quantity_change,
      note: movement.note,
      created_by: movement.created_by,
      created_by_name: creatorNames.get(movement.created_by) ?? 'Unknown User',
      created_at: movement.created_at,
    }));

    const response: MovementsResponse = {
      movements: transformedMovements,
      total: count || 0,
      limit,
      offset,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
