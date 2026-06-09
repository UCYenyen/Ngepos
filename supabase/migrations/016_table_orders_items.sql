-- Running-tab support for F&B tables: store an open order's draft line items
-- on the table_orders row, and allow cancelling a tab.
--
-- NOTE: table_orders.status is the enum `table_order_status` (see migration 009),
-- so a new state is added with ALTER TYPE, not a CHECK constraint.

ALTER TABLE table_orders
  ADD COLUMN IF NOT EXISTS items jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TYPE table_order_status ADD VALUE IF NOT EXISTS 'cancelled';

-- At most one open tab per table (and a fast lookup path for it).
CREATE UNIQUE INDEX IF NOT EXISTS idx_table_orders_open
  ON table_orders (table_id)
  WHERE status = 'in_progress';
