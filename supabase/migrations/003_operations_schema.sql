-- supabase/migrations/003_operations_schema.sql

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('sale', 'restock', 'adjustment', 'damage')),
  quantity_change INTEGER NOT NULL,
  note TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY stock_movements_select ON stock_movements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = stock_movements.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY stock_movements_insert ON stock_movements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = stock_movements.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY stock_movements_update ON stock_movements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = stock_movements.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = stock_movements.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY stock_movements_delete ON stock_movements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = stock_movements.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY suppliers_select ON suppliers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = suppliers.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY suppliers_insert ON suppliers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = suppliers.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY suppliers_update ON suppliers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = suppliers.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = suppliers.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY suppliers_delete ON suppliers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = suppliers.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE INDEX idx_stock_movements_business_id_created_at ON stock_movements(business_id, created_at);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_suppliers_business_id ON suppliers(business_id);
