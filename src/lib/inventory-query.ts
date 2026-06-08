import type { ProductRow, ProductVariantRow, CategoryRow } from '@/types/operations';
import type { InventoryProduct } from '@/types/inventory';

export const INVENTORY_PRODUCT_SELECT = `
  id,
  name,
  sku,
  price,
  category_id,
  track_stock,
  has_variants,
  stock_qty,
  low_stock_threshold,
  created_at,
  categories(name),
  product_variants(id, name, stock_qty)
`;

export interface ProductWithRelations extends ProductRow {
  categories: CategoryRow | null;
  product_variants: ProductVariantRow[];
}

export function mapToInventoryProduct(product: ProductWithRelations): InventoryProduct {
  const currentStock =
    product.has_variants && product.product_variants && product.product_variants.length > 0
      ? product.product_variants.reduce(
          (sum: number, variant: ProductVariantRow) => sum + (variant.stock_qty || 0),
          0
        )
      : product.stock_qty || 0;

  return {
    id: product.id,
    name: product.name,
    sku: product.sku || null,
    category_id: product.category_id || null,
    category_name: product.categories?.name || null,
    price: product.price,
    current_stock: currentStock,
    low_stock_threshold: product.low_stock_threshold,
    track_stock: product.track_stock,
    has_variants: product.has_variants,
    variants: product.product_variants || [],
  };
}
