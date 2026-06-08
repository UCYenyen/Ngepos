-- supabase/migrations/010_atomic_stock_adjustment.sql

CREATE OR REPLACE FUNCTION apply_stock_adjustment(
  p_business_id UUID,
  p_product_id UUID,
  p_variant_id UUID,
  p_type stock_movement_type,
  p_quantity_change INTEGER,
  p_note TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_track_stock BOOLEAN;
  v_movement_id UUID;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM business_members
    WHERE business_members.business_id = p_business_id
      AND business_members.user_id = auth.uid()
      AND business_members.role IN ('owner', 'manager')
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT track_stock INTO v_track_stock
  FROM products
  WHERE id = p_product_id
    AND business_id = p_business_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % not in business', p_product_id;
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
    p_business_id,
    p_product_id,
    p_variant_id,
    p_type,
    p_quantity_change,
    p_note,
    auth.uid()
  )
  RETURNING id INTO v_movement_id;

  IF v_track_stock THEN
    IF p_variant_id IS NOT NULL THEN
      UPDATE product_variants
      SET stock_qty = stock_qty + p_quantity_change
      WHERE id = p_variant_id
        AND product_id = p_product_id;
    ELSE
      UPDATE products
      SET stock_qty = stock_qty + p_quantity_change
      WHERE id = p_product_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('movement_id', v_movement_id);
END;
$$;

GRANT EXECUTE ON FUNCTION apply_stock_adjustment(UUID, UUID, UUID, stock_movement_type, INTEGER, TEXT) TO authenticated;
