import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { CartItem, OpenTableOrder } from '@/types/pos';

const MISSING_COLUMN = '42703';

interface OpenOrderRow {
  id: string;
  table_id: string;
  items: CartItem[] | null;
  opened_at: string;
}

function notMigrated(): NextResponse {
  return NextResponse.json(
    { error: 'Running tabs not enabled', code: 'NOT_MIGRATED' },
    { status: 501 }
  );
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

    const { data, error } = await supabase
      .from('table_orders')
      .select('id, table_id, items, opened_at, tables!inner(business_id)')
      .eq('tables.business_id', businessId)
      .eq('status', 'in_progress')
      .order('opened_at', { ascending: true })
      .returns<OpenOrderRow[]>();

    if (error) {
      if (error.code === MISSING_COLUMN) return notMigrated();
      throw error;
    }

    const orders: OpenTableOrder[] = (data ?? []).map((row) => ({
      id: row.id,
      table_id: row.table_id,
      items: row.items ?? [],
      opened_at: row.opened_at,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching table orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

interface SaveTabRequest {
  tableId: string;
  items: CartItem[];
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tableId, items }: SaveTabRequest = await request.json();
    if (!tableId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: table } = await supabase
      .from('tables')
      .select('id')
      .eq('id', tableId)
      .maybeSingle();
    if (!table) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: existing } = await supabase
      .from('table_orders')
      .select('id')
      .eq('table_id', tableId)
      .eq('status', 'in_progress')
      .maybeSingle();

    const result = existing
      ? await supabase
          .from('table_orders')
          .update({ items })
          .eq('id', existing.id)
          .select('id, table_id, items, opened_at')
          .single()
      : await supabase
          .from('table_orders')
          .insert({ table_id: tableId, items, status: 'in_progress' })
          .select('id, table_id, items, opened_at')
          .single();

    if (result.error) {
      if (result.error.code === MISSING_COLUMN) return notMigrated();
      throw result.error;
    }

    const row = result.data as OpenOrderRow;
    const order: OpenTableOrder = {
      id: row.id,
      table_id: row.table_id,
      items: row.items ?? [],
      opened_at: row.opened_at,
    };

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error saving table order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
