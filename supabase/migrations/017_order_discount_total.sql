-- Order-level discount: the RPC previously recorded p_discount_amount but never
-- subtracted it from the total. Now it clamps the discount to [0, subtotal] and
-- computes total = (subtotal - discount) + tax. Tax is computed client-side on
-- the discounted base (tax-after-discount), consistent with the existing model
-- where p_tax_amount is trusted.

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
  v_price NUMERIC;
  v_item_discount NUMERIC;
  v_item_subtotal NUMERIC;
  v_track_stock BOOLEAN;
  v_computed_subtotal NUMERIC;
  v_discount NUMERIC;
  v_computed_total NUMERIC;
  v_result JSONB;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_members.business_id = p_business_id
      AND business_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(SUM(
    (e->>'price')::NUMERIC * (e->>'quantity')::INTEGER - (e->>'discount_amount')::NUMERIC
  ), 0)
  INTO v_computed_subtotal
  FROM jsonb_array_elements(p_items) e;

  v_discount := LEAST(GREATEST(COALESCE(p_discount_amount, 0), 0), v_computed_subtotal);
  v_computed_total := v_computed_subtotal - v_discount + COALESCE(p_tax_amount, 0);

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
    v_computed_subtotal,
    v_discount,
    p_tax_amount,
    v_computed_total,
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
    v_price := (v_item->>'price')::NUMERIC;
    v_item_discount := (v_item->>'discount_amount')::NUMERIC;
    v_item_subtotal := v_price * v_quantity - v_item_discount;

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
      v_price,
      v_quantity,
      v_item_discount,
      v_item_subtotal
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
