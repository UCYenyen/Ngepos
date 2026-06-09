import { createServerClient } from '@/lib/supabase';
import { getBusinessPlan } from '@/lib/auth';
import { getPlanConfig } from '@/lib/plans';
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

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    return NextResponse.json(products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
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
      categoryId,
      name,
      sku,
      price,
      image_url,
      has_variants,
      track_stock,
      stock_qty,
      low_stock_threshold,
    } = await request.json();

    if (!businessId || !name || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const plan = await getBusinessPlan(businessId);
    const limit = getPlanConfig(plan).maxProductsPerBusiness;
    if (Number.isFinite(limit)) {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId);
      if (count !== null && count >= limit) {
        return NextResponse.json(
          { error: 'Batas jumlah produk untuk paketmu sudah tercapai', limit, current: count },
          { status: 400 }
        );
      }
    }

    const { data: product } = await supabase
      .from('products')
      .insert({
        business_id: businessId,
        category_id: categoryId || null,
        name,
        sku: sku || null,
        price,
        image_url: image_url || null,
        has_variants: has_variants || false,
        track_stock: track_stock || false,
        stock_qty: stock_qty ?? 0,
        low_stock_threshold: low_stock_threshold ?? null,
      })
      .select()
      .single();

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
