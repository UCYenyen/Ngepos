-- supabase/migrations/009_enum_types.sql

CREATE TYPE business_type AS ENUM ('retail', 'fnb');
CREATE TYPE business_role AS ENUM ('owner', 'manager', 'cashier');
CREATE TYPE subscription_plan AS ENUM ('starter', 'pro', 'enterprise');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled');
CREATE TYPE payment_provider AS ENUM ('midtrans', 'xendit', 'manual');
CREATE TYPE payment_method AS ENUM ('cash', 'qris', 'gateway');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'cancelled');
CREATE TYPE table_status AS ENUM ('available', 'occupied', 'reserved');
CREATE TYPE table_order_status AS ENUM ('pending', 'in_progress', 'served', 'paid');
CREATE TYPE stock_movement_type AS ENUM ('sale', 'restock', 'adjustment', 'damage');
CREATE TYPE report_channel AS ENUM ('email', 'whatsapp');

ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_type_check;
ALTER TABLE businesses ALTER COLUMN type TYPE business_type USING type::business_type;

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ALTER COLUMN plan TYPE subscription_plan USING plan::subscription_plan;

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_billing_cycle_check;
ALTER TABLE subscriptions ALTER COLUMN billing_cycle TYPE billing_cycle USING billing_cycle::billing_cycle;

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ALTER COLUMN status TYPE subscription_status USING status::subscription_status;

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_payment_provider_check;
ALTER TABLE subscriptions ALTER COLUMN payment_provider TYPE payment_provider USING payment_provider::payment_provider;

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_payment_method_check;
ALTER TABLE transactions ALTER COLUMN payment_method TYPE payment_method USING payment_method::payment_method;

ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_payment_status_check;
ALTER TABLE transactions ALTER COLUMN payment_status TYPE payment_status USING payment_status::payment_status;

ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_status_check;
ALTER TABLE tables ALTER COLUMN status DROP DEFAULT;
ALTER TABLE tables ALTER COLUMN status TYPE table_status USING status::table_status;
ALTER TABLE tables ALTER COLUMN status SET DEFAULT 'available'::table_status;

ALTER TABLE table_orders DROP CONSTRAINT IF EXISTS table_orders_status_check;
ALTER TABLE table_orders ALTER COLUMN status DROP DEFAULT;
ALTER TABLE table_orders ALTER COLUMN status TYPE table_order_status USING status::table_order_status;
ALTER TABLE table_orders ALTER COLUMN status SET DEFAULT 'pending'::table_order_status;

ALTER TABLE stock_movements DROP CONSTRAINT IF EXISTS stock_movements_type_check;
ALTER TABLE stock_movements ALTER COLUMN type TYPE stock_movement_type USING type::stock_movement_type;

ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_report_channel_check;
ALTER TABLE businesses ALTER COLUMN report_channel DROP DEFAULT;
ALTER TABLE businesses ALTER COLUMN report_channel TYPE report_channel USING report_channel::report_channel;
ALTER TABLE businesses ALTER COLUMN report_channel SET DEFAULT 'email'::report_channel;

CREATE OR REPLACE FUNCTION create_pos_transaction(
  p_business_id UUID,
  p_items JSONB,
  p_subtotal NUMERIC,
  p_discount_amount NUMERIC,
  p_tax_amount NUMERIC,
  p_total NUMERIC,
  p_payment_method TEXT,
  p_notes TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
  v_item JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_quantity INTEGER;
  v_track_stock BOOLEAN;
  v_result JSONB;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_members.business_id = p_business_id
      AND business_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  INSERT INTO transactions (
    business_id,
    cashier_id,
    subtotal,
    discount_amount,
    tax_amount,
    total,
    payment_method,
    payment_status,
    notes
  ) VALUES (
    p_business_id,
    auth.uid(),
    p_subtotal,
    p_discount_amount,
    p_tax_amount,
    p_total,
    p_payment_method::payment_method,
    (CASE WHEN p_payment_method = 'cash' THEN 'paid' ELSE 'pending' END)::payment_status,
    p_notes
  )
  RETURNING id INTO v_transaction_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::UUID;
    v_variant_id := (v_item->>'variant_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;

    SELECT track_stock INTO v_track_stock
    FROM products
    WHERE id = v_product_id
      AND business_id = p_business_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % not in business', v_product_id;
    END IF;

    INSERT INTO transaction_items (
      transaction_id,
      product_id,
      variant_id,
      name,
      price,
      quantity,
      discount_amount,
      subtotal
    ) VALUES (
      v_transaction_id,
      v_product_id,
      v_variant_id,
      (v_item->>'name')::TEXT,
      (v_item->>'price')::NUMERIC,
      v_quantity,
      (v_item->>'discount_amount')::NUMERIC,
      (v_item->>'subtotal')::NUMERIC
    );

    INSERT INTO stock_movements (
      business_id,
      product_id,
      variant_id,
      type,
      quantity_change,
      note,
      created_by
    ) VALUES (
      p_business_id,
      v_product_id,
      v_variant_id,
      'sale'::stock_movement_type,
      -v_quantity,
      NULL,
      auth.uid()
    );

    IF v_track_stock THEN
      IF v_variant_id IS NOT NULL THEN
        UPDATE product_variants
        SET stock_qty = stock_qty - v_quantity
        WHERE id = v_variant_id
          AND product_id = v_product_id;
      ELSE
        UPDATE products
        SET stock_qty = stock_qty - v_quantity
        WHERE id = v_product_id;
      END IF;
    END IF;
  END LOOP;

  SELECT to_jsonb(t.*) INTO v_result
  FROM transactions t
  WHERE t.id = v_transaction_id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION create_pos_transaction(UUID, JSONB, NUMERIC, NUMERIC, NUMERIC, NUMERIC, TEXT, TEXT) TO authenticated;
