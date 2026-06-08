import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { createServerClient } from '@/lib/supabase';

interface BusinessOwnerRow {
  owner_id: string;
  name: string;
}

interface OwnerRecipient {
  email: string;
  businessName: string;
}

export async function resolveBusinessOwnerEmail(
  supabase: ReturnType<typeof createServerClient>,
  businessId: string
): Promise<OwnerRecipient | null> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    return null;
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('owner_id, name')
    .eq('id', businessId)
    .single<BusinessOwnerRow>();

  if (!business) {
    return null;
  }

  const admin: SupabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.getUserById(business.owner_id);

  if (error || !data.user?.email) {
    return null;
  }

  return { email: data.user.email, businessName: business.name };
}
