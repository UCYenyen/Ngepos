import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

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

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.address !== undefined) updates.address = body.address || null;
    if (body.timezone !== undefined) updates.timezone = body.timezone;
    if (body.currency !== undefined) updates.currency = body.currency;
    if (body.logo_url !== undefined) updates.logo_url = body.logo_url || null;
    if (body.qris_image_url !== undefined) {
      updates.qris_image_url = body.qris_image_url || null;
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { error } = await supabase.from('businesses').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
