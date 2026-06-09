import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { CartItem, ParkedOrder } from '@/types/pos';

const MISSING_TABLE = '42P01';

function notMigrated(): NextResponse {
  return NextResponse.json(
    { error: 'Parked orders not enabled', code: 'NOT_MIGRATED' },
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
      .from('parked_orders')
      .select('id, business_id, label, items, created_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .returns<ParkedOrder[]>();

    if (error) {
      if (error.code === MISSING_TABLE) return notMigrated();
      throw error;
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('Error fetching parked orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

interface ParkRequest {
  businessId: string;
  label?: string | null;
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

    const { businessId, label, items }: ParkRequest = await request.json();
    if (!businessId || !Array.isArray(items) || items.length === 0) {
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

    const trimmed = typeof label === 'string' ? label.trim() : '';
    const { data, error } = await supabase
      .from('parked_orders')
      .insert({
        business_id: businessId,
        label: trimmed || null,
        items,
        created_by: user.id,
      })
      .select('id, business_id, label, items, created_at')
      .single();

    if (error) {
      if (error.code === MISSING_TABLE) return notMigrated();
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error parking order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
