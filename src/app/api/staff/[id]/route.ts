import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { canManageStaff } from '@/lib/permissions';
import type { UserRole } from '@/types/business';

function validateRole(role: string): role is Exclude<UserRole, 'owner'> {
  return role === 'manager' || role === 'cashier';
}

export async function PATCH(
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
    const staffId = id;

    if (!staffId) {
      return NextResponse.json({ error: 'Missing staff ID' }, { status: 400 });
    }

    const body = await request.json();
    const { businessId, role } = body;

    if (!businessId || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!validateRole(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be manager or cashier' },
        { status: 400 }
      );
    }

    const { data: currentMember } = await supabase
      .from('business_members')
      .select('role')
      .eq('business_id', businessId)
      .eq('user_id', user.id)
      .single();

    if (!currentMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!canManageStaff(currentMember.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (staffId === user.id) {
      return NextResponse.json({ error: 'Cannot update your own role' }, { status: 400 });
    }

    const { data: targetMember } = await supabase
      .from('business_members')
      .select('*')
      .eq('user_id', staffId)
      .eq('business_id', businessId)
      .single();

    if (!targetMember) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('business_members')
      .update({ role })
      .eq('user_id', staffId)
      .eq('business_id', businessId);

    if (updateError) {
      console.error('Error updating staff member:', updateError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in PATCH /api/staff/[id]:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
