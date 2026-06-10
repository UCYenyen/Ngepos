import { createServerClient, createAdminClient } from '@/lib/supabase';
import { encryptSecret, isEncryptionConfigured } from '@/lib/encryption';
import { validateXenditKey } from '@/lib/xendit';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface CredentialStatusRow {
  status: string;
  key_last4: string | null;
}

async function requireOwner(
  supabase: ReturnType<typeof createServerClient>,
  businessId: string,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('business_members')
    .select('role')
    .eq('business_id', businessId)
    .eq('user_id', userId)
    .maybeSingle<{ role: string }>();
  return data?.role === 'owner';
}

export async function GET(
  _request: NextRequest,
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
    if (!(await requireOwner(supabase, id, user.id))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const admin = createAdminClient();
    const { data } = await admin
      .from('business_payment_credentials')
      .select('status, key_last4')
      .eq('business_id', id)
      .eq('provider', 'xendit')
      .maybeSingle<CredentialStatusRow>();

    return NextResponse.json({
      connected: data?.status === 'connected',
      status: data?.status ?? null,
      keyLast4: data?.key_last4 ?? null,
    });
  } catch (error) {
    console.error('Error reading payment credentials:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
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
    if (!(await requireOwner(supabase, id, user.id))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (!isEncryptionConfigured()) {
      return NextResponse.json(
        { error: 'PAYMENT_ENCRYPTION_KEY belum dikonfigurasi di server' },
        { status: 500 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      secretKey?: string;
    };
    const secretKey = body.secretKey?.trim();
    if (!secretKey) {
      return NextResponse.json({ error: 'Secret key wajib diisi' }, { status: 400 });
    }

    const valid = await validateXenditKey(secretKey);
    if (!valid) {
      return NextResponse.json(
        { error: 'Secret key Xendit tidak valid' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('business_payment_credentials')
      .upsert(
        {
          business_id: id,
          provider: 'xendit',
          secret_ciphertext: encryptSecret(secretKey),
          key_last4: secretKey.slice(-4),
          status: 'connected',
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'business_id' }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ connected: true, keyLast4: secretKey.slice(-4) });
  } catch (error) {
    console.error('Error saving payment credentials:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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
    if (!(await requireOwner(supabase, id, user.id))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from('business_payment_credentials')
      .delete()
      .eq('business_id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ connected: false });
  } catch (error) {
    console.error('Error deleting payment credentials:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
