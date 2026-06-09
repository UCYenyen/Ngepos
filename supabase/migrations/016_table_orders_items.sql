-- Running-tab support for F&B tables: store an open order's draft line items
-- on the table_orders row, and allow cancelling a tab.

ALTER TABLE table_orders
  ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE table_orders
  DROP CONSTRAINT IF EXISTS table_orders_status_check;

ALTER TABLE table_orders
  ADD CONSTRAINT table_orders_status_check
  CHECK (status IN ('pending', 'in_progress', 'served', 'paid', 'cancelled'));

-- One fast lookup path for "the open tab on this table".
CREATE INDEX IF NOT EXISTS idx_table_orders_open
  ON table_orders (table_id)
  WHERE status = 'in_progress';
