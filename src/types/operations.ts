export interface StockMovement {
  id: string;
  business_id: string;
  product_id: string;
  variant_id: string | null;
  type: 'sale' | 'restock' | 'adjustment' | 'damage';
  quantity_change: number;
  note?: string;
  created_by: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  business_id: string;
  name: string;
  contact_phone?: string;
  contact_email?: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export interface CreateStockMovementInput {
  product_id: string;
  variant_id?: string;
  type: StockMovement['type'];
  quantity_change: number;
  note?: string;
}

/**
 * IMPORTANT: variant_id validation rules
 *
 * When creating or updating stock_movements, the application MUST enforce:
 *
 * 1. If the product has variants (product.has_variants = true):
 *    - variant_id MUST NOT be null
 *    - variant_id MUST reference a valid product_variant for this product
 *
 * 2. If the product does NOT have variants (product.has_variants = false):
 *    - variant_id MUST be null
 *
 * This validation cannot be enforced at the database level (no cross-table
 * business logic constraints), so it's the API's responsibility. Failing to
 * validate will result in incomplete audit trails and incorrect stock
 * tracking.
 */
export type StockMovementValidation = {
  hasVariants: boolean;
  variantId?: string;
};
