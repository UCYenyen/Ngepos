-- Per-business Xendit credentials (BYO keys). Each business connects its own
-- Xendit account so POS gateway payments settle directly to the merchant —
-- the platform never custodies funds. The secret key is stored encrypted
-- (AES-256-GCM, see src/lib/encryption.ts) and is NEVER exposed to the client:
-- RLS is enabled with no policies, so only the service-role key (server-side)
-- can read or write this table.

CREATE TABLE IF NOT EXISTS business_payment_credentials (
  business_id UUID PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'xendit',
  secret_ciphertext TEXT NOT NULL,
  key_last4 TEXT,
  status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'invalid')),
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE business_payment_credentials ENABLE ROW LEVEL SECURITY;
