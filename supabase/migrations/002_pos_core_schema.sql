-- supabase/migrations/002_pos_core_schema.sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#000000',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY categories_select ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = categories.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY categories_insert ON categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = categories.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY categories_update ON categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = categories.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = categories.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY categories_delete ON categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = categories.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  has_variants BOOLEAN DEFAULT FALSE,
  track_stock BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_select ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = products.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY products_insert ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = products.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY products_update ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = products.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = products.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY products_delete ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = products.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  sku TEXT,
  stock_qty INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_variants_select ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products
      INNER JOIN business_members ON business_members.business_id = products.business_id
      WHERE product_variants.product_id = products.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY product_variants_insert ON product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      INNER JOIN business_members ON business_members.business_id = products.business_id
      WHERE product_variants.product_id = products.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY product_variants_update ON product_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM products
      INNER JOIN business_members ON business_members.business_id = products.business_id
      WHERE product_variants.product_id = products.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      INNER JOIN business_members ON business_members.business_id = products.business_id
      WHERE product_variants.product_id = products.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY product_variants_delete ON product_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM products
      INNER JOIN business_members ON business_members.business_id = products.business_id
      WHERE product_variants.product_id = products.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  cashier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  table_id UUID,
  subtotal DECIMAL(12, 2) NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'qris', 'gateway')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  gateway_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_select ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = transactions.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY transactions_insert ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = transactions.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager', 'cashier')
    )
  );

CREATE POLICY transactions_update ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = transactions.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = transactions.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY transaction_items_select ON transaction_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM transactions
      INNER JOIN business_members ON business_members.business_id = transactions.business_id
      WHERE transaction_items.transaction_id = transactions.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY transaction_items_insert ON transaction_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions
      INNER JOIN business_members ON business_members.business_id = transactions.business_id
      WHERE transaction_items.transaction_id = transactions.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY transaction_items_delete ON transaction_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM transactions
      INNER JOIN business_members ON business_members.business_id = transactions.business_id
      WHERE transaction_items.transaction_id = transactions.id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY tables_select ON tables
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = tables.business_id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY tables_insert ON tables
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = tables.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager')
    )
  );

CREATE POLICY tables_update ON tables
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = tables.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager', 'cashier')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_members
      WHERE business_members.business_id = tables.business_id
        AND business_members.user_id = auth.uid()
        AND business_members.role IN ('owner', 'manager', 'cashier')
    )
  );

CREATE TABLE table_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'served', 'paid')),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE table_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY table_orders_select ON table_orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tables
      INNER JOIN business_members ON business_members.business_id = tables.business_id
      WHERE table_orders.table_id = tables.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY table_orders_insert ON table_orders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tables
      INNER JOIN business_members ON business_members.business_id = tables.business_id
      WHERE table_orders.table_id = tables.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE POLICY table_orders_update ON table_orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM tables
      INNER JOIN business_members ON business_members.business_id = tables.business_id
      WHERE table_orders.table_id = tables.id
        AND business_members.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM tables
      INNER JOIN business_members ON business_members.business_id = tables.business_id
      WHERE table_orders.table_id = tables.id
        AND business_members.user_id = auth.uid()
    )
  );

CREATE INDEX idx_categories_business_id ON categories(business_id);
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_transactions_business_id ON transactions(business_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_tables_business_id ON tables(business_id);
CREATE INDEX idx_table_orders_table_id ON table_orders(table_id);
