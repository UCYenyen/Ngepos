-- Storefront subdomains + anonymous customer ordering.
--
-- A business may publish a public storefront at ngepos-<subdomain>.thedevo.cloud.
-- `businesses.subdomain` stores ONLY the slug (no prefix, no domain); the full
-- host is derived in the app. A single nullable UNIQUE column gives "max 1
-- subdomain per business" structurally, and global uniqueness across tenants.

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS subdomain TEXT;

ALTER TABLE businesses
  ADD CONSTRAINT businesses_subdomain_unique UNIQUE (subdomain);

ALTER TABLE businesses
  ADD CONSTRAINT businesses_subdomain_format
  CHECK (subdomain IS NULL OR subdomain ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$');

-- Anonymous (logged-out customer) read access, scoped to businesses that have
-- published a storefront. Reads go through the anon key; no service role.

CREATE POLICY businesses_public_select ON businesses
  FOR SELECT TO anon
  USING (subdomain IS NOT NULL);

CREATE POLICY categories_public_select ON categories
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = categories.business_id
        AND b.subdomain IS NOT NULL
    )
  );

CREATE POLICY products_public_select ON products
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = products.business_id
        AND b.subdomain IS NOT NULL
    )
  );

CREATE POLICY product_variants_public_select ON product_variants
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM products p
      INNER JOIN businesses b ON b.id = p.business_id
      WHERE p.id = product_variants.product_id
        AND b.subdomain IS NOT NULL
    )
  );

-- Incoming orders placed by anonymous customers from the storefront.
-- Pricing is computed server-side; inserts happen with the service-role client
-- (bypasses RLS), so there is intentionally NO anon insert policy.

CREATE TABLE online_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE online_orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_online_orders_business_status
  ON online_orders (business_id, status, created_at DESC);

CREATE POLICY online_orders_member_select ON online_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = online_orders.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY online_orders_member_update ON online_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = online_orders.business_id
        AND business_members.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = online_orders.business_id
        AND business_members.user_id = auth.uid()
    )
  );
