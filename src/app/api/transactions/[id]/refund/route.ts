import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const MISSING_FUNCTION = '42883';

export async function POST(
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
    const body = (await request.json().catch(() => ({}))) as {
      restoreStock?: boolean;
    };

    const { data, error } = await supabase.rpc('refund_transaction', {
      p_transaction_id: id,
      p_restore_stock: Boolean(body.restoreStock),
    });

    if (error) {
      if (error.code === MISSING_FUNCTION || error.code === 'PGRST202') {
        return NextResponse.json(
          { error: 'Refund not enabled', code: 'NOT_MIGRATED' },
          { status: 501 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error refunding transaction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
