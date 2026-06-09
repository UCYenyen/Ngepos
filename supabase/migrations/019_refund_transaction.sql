-- Refund / void a transaction. Marks it cancelled (no longer counts as revenue)
-- and, when p_restore_stock is true, returns the sold quantities to stock for
-- tracked products and logs an 'adjustment' stock movement. Owner/manager only.

CREATE OR REPLACE FUNCTION refund_transaction(
  p_transaction_id UUID,
  p_restore_stock BOOLEAN
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_business_id UUID;
  v_status payment_status;
  v_item RECORD;
  v_track_stock BOOLEAN;
  v_result JSONB;
BEGIN
  SELECT business_id, payment_status
  INTO v_business_id, v_status
  FROM transactions
  WHERE id = p_transaction_id;

  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_members.business_id = v_business_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('owner', 'manager')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF v_status = 'cancelled' THEN
    RAISE EXCEPTION 'Transaction already refunded';
  END IF;

  UPDATE transactions
  SET payment_status = 'cancelled'
  WHERE id = p_transaction_id;

  IF p_restore_stock THEN
    FOR v_item IN
      SELECT product_id, variant_id, quantity
      FROM transaction_items
      WHERE transaction_id = p_transaction_id
    LOOP
      SELECT track_stock INTO v_track_stock
      FROM products
      WHERE id = v_item.product_id
        AND business_id = v_business_id;

      IF v_track_stock THEN
        IF v_item.variant_id IS NOT NULL THEN
          UPDATE product_variants
          SET stock_qty = stock_qty + v_item.quantity
          WHERE id = v_item.variant_id;
        ELSE
          UPDATE products
          SET stock_qty = stock_qty + v_item.quantity
          WHERE id = v_item.product_id;
        END IF;

        INSERT INTO stock_movements (
          business_id,
          product_id,
          variant_id,
          type,
          quantity_change,
          note,
          created_by
        ) VALUES (
          v_business_id,
          v_item.product_id,
          v_item.variant_id,
          'adjustment'::stock_movement_type,
          v_item.quantity,
          'Refund transaksi',
          auth.uid()
        );
      END IF;
    END LOOP;
  END IF;

  SELECT to_jsonb(t.*) INTO v_result
  FROM transactions t
  WHERE t.id = p_transaction_id;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION refund_transaction(UUID, BOOLEAN) TO authenticated;
