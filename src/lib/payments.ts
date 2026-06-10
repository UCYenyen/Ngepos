import { createAdminClient } from '@/lib/supabase';
import { decryptSecret, isEncryptionConfigured } from '@/lib/encryption';

interface CredentialRow {
  secret_ciphertext: string;
  status: string;
}

// Returns the decrypted Xendit secret key a business has connected, or null if
// none is connected (callers may then fall back to the platform key). Reads via
// the service-role client because the credentials table is locked by RLS.
export async function getBusinessXenditKey(
  businessId: string
): Promise<string | null> {
  if (!isEncryptionConfigured()) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from('business_payment_credentials')
    .select('secret_ciphertext, status')
    .eq('business_id', businessId)
    .eq('provider', 'xendit')
    .maybeSingle<CredentialRow>();

  if (!data || data.status !== 'connected') return null;

  try {
    return decryptSecret(data.secret_ciphertext);
  } catch {
    return null;
  }
}
