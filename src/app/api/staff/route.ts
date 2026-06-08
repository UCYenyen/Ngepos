import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { canManageStaff } from '@/lib/permissions';
import { validateEmail, validateRole } from '@/lib/staff-validation';
import type { StaffListResponse, StaffInvitationResponse } from '@/types/api';
import { randomBytes } from 'crypto';

function generateInvitationToken(): string {
  return randomBytes(32).toString('hex');
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
      return NextResponse.json({ error: 'Missing businessId parameter' }, { status: 400 });
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

    const { data: members, error } = await supabase
      .from('business_members')
      .select('user_id, role, created_at')
      .eq('business_id', businessId);

    if (error) {
      console.error('Error fetching staff members:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const userIds = members.map((m) => m.user_id);
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const userMap = new Map(authData.users.map((u) => [u.id, u]));

    const staff = members
      .map((member) => {
        const authUser = userMap.get(member.user_id);
        return {
          id: member.user_id,
          user_id: member.user_id,
          email: authUser?.email || 'Unknown',
          name: authUser?.user_metadata?.name || authUser?.email?.split('@')[0] || 'Unknown',
          role: member.role,
          created_at: member.created_at,
        };
      })
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const response: StaffListResponse = {
      success: true,
      data: { staff },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/staff:', error);
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

    const body = await request.json();
    const { businessId, email, role } = body;

    if (!businessId || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
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

    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('id')
      .eq('business_id', businessId)
      .eq('email', email)
      .is('accepted_at', null)
      .maybeSingle();

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 });
    }

    const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers();
    if (searchError) {
      console.error('Error searching for user:', searchError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const invitedAuthUser = users.find((u) => u.email === email);
    if (invitedAuthUser) {
      const { data: existingMember } = await supabase
        .from('business_members')
        .select('id')
        .eq('business_id', businessId)
        .eq('user_id', invitedAuthUser.id)
        .maybeSingle();

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a staff member of this business' },
          { status: 400 }
        );
      }
    }

    const token = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        business_id: businessId,
        email,
        role,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // TODO: Send invitation email with token to ${email}
    // This requires setting up Resend or similar email service
    // For now, return the token to API caller (they can test with it)
    // In production, would do:
    // await sendInvitationEmail(email, token, businessId);

    const response: StaffInvitationResponse = {
      success: true,
      data: {
        invitation_id: invitation.id,
        invitation_token: token,
      },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in POST /api/staff:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
