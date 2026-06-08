import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { canAccessBusinessSettings } from '@/lib/permissions';
import type { ReportChannel } from '@/types/business';

interface ReportSettingsRequest {
  report_enabled: boolean;
  report_channel: ReportChannel;
  report_recipient: string;
}

export async function GET(
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

    const { data: member } = await supabase
      .from('business_members')
      .select('role')
      .eq('business_id', id)
      .eq('user_id', user.id)
      .single();

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!canAccessBusinessSettings(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .select('report_enabled, report_channel, report_recipient')
      .eq('id', id)
      .single();

    if (error || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json({
      report_enabled: business.report_enabled ?? false,
      report_channel: business.report_channel ?? 'email',
      report_recipient: business.report_recipient ?? '',
    });
  } catch (error) {
    console.error('Error in GET /api/businesses/[id]/report-settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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

    const { data: member } = await supabase
      .from('business_members')
      .select('role')
      .eq('business_id', id)
      .eq('user_id', user.id)
      .single();

    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!canAccessBusinessSettings(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as ReportSettingsRequest;
    const { report_enabled, report_channel, report_recipient } = body;

    if (typeof report_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'report_enabled must be a boolean' },
        { status: 400 }
      );
    }

    if (report_channel !== 'email' && report_channel !== 'whatsapp') {
      return NextResponse.json(
        { error: 'report_channel must be email or whatsapp' },
        { status: 400 }
      );
    }

    if (typeof report_recipient !== 'string') {
      return NextResponse.json(
        { error: 'report_recipient must be a string' },
        { status: 400 }
      );
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .update({ report_enabled, report_channel, report_recipient })
      .eq('id', id)
      .select('report_enabled, report_channel, report_recipient')
      .single();

    if (error || !business) {
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({
      report_enabled: business.report_enabled,
      report_channel: business.report_channel,
      report_recipient: business.report_recipient,
    });
  } catch (error) {
    console.error('Error in PATCH /api/businesses/[id]/report-settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
