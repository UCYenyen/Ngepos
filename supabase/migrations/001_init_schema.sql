-- supabase/migrations/001_init_schema.sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('retail', 'fnb')),
  logo_url TEXT,
  address TEXT,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  currency TEXT DEFAULT 'IDR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY businesses_owner_select ON businesses
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY businesses_owner_insert ON businesses
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY businesses_owner_update ON businesses
  FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY businesses_owner_delete ON businesses
  FOR DELETE USING (owner_id = auth.uid());

CREATE TABLE business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_members_select ON business_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY business_members_insert ON business_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

CREATE POLICY business_members_update ON business_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

CREATE POLICY business_members_delete ON business_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = business_members.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('midtrans', 'xendit', 'manual')),
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY subscriptions_insert ON subscriptions
  FOR INSERT WITH CHECK (false);

CREATE POLICY subscriptions_update ON subscriptions
  FOR UPDATE USING (false) WITH CHECK (false);

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'cashier')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY invitations_select ON invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = invitations.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

CREATE POLICY invitations_insert ON invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = invitations.business_id
        AND bm.user_id = auth.uid()
        AND bm.role = 'owner'
    )
  );

CREATE POLICY invitations_accept ON invitations
  FOR UPDATE USING (expires_at > NOW())
  WITH CHECK (expires_at > NOW());

CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_business_members_business_id ON business_members(business_id);
CREATE INDEX idx_business_members_user_id ON business_members(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(period_end);
CREATE INDEX idx_invitations_business_id ON invitations(business_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);
