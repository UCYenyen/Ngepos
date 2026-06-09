-- Held / parked orders: a cart set aside (unpaid) so the cashier can serve the
-- next customer and recall it later. Retail equivalent of an F&B running tab,
-- but not tied to a table — identified by an optional free label.

CREATE TABLE IF NOT EXISTS parked_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  label TEXT,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE parked_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS parked_orders_member ON parked_orders;
CREATE POLICY parked_orders_member ON parked_orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = parked_orders.business_id
        AND business_members.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = parked_orders.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_parked_orders_business_id
  ON parked_orders (business_id);
