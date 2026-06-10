import { createServerClient, createAdminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getBusinessPlanFeatures } from '@/lib/auth';
import { validateSubdomain } from '@/validations/storefront';

async function isTaken(
  subdomain: string,
  businessId: string
): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('businesses')
    .select('id')
    .eq('subdomain', subdomain)
    .neq('id', businessId)
    .maybeSingle<{ id: string }>();
  return Boolean(data);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const value = request.nextUrl.searchParams.get('check') ?? '';

  const validation = validateSubdomain(value);
  if (!validation.success) {
    return NextResponse.json({
      available: false,
      reason: validation.errors[0] ?? 'Invalid subdomain',
    });
  }

  const taken = await isTaken(validation.data, id);
  return NextResponse.json({
    available: !taken,
    reason: taken ? 'This subdomain is already taken' : null,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    if (body.subdomain === null) {
      const { error } = await supabase
        .from('businesses')
        .update({ subdomain: null })
        .eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ subdomain: null });
    }

    const features = await getBusinessPlanFeatures(id);
    if (!features.onlineStore) {
      return NextResponse.json(
        { error: 'Storefront is available on the Pro and Enterprise plans.' },
        { status: 403 }
      );
    }

    const validation = validateSubdomain(body.subdomain);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.errors[0] ?? 'Invalid subdomain' },
        { status: 400 }
      );
    }

    if (await isTaken(validation.data, id)) {
      return NextResponse.json(
        { error: 'This subdomain is already taken' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('businesses')
      .update({ subdomain: validation.data })
      .eq('id', id)
      .select('subdomain')
      .single();

    if (error) {
      const conflict = error.code === '23505';
      return NextResponse.json(
        { error: conflict ? 'This subdomain is already taken' : error.message },
        { status: conflict ? 409 : 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating storefront subdomain:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
