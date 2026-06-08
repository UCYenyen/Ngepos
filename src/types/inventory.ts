export interface InventoryProduct {
  id: string;
  name: string;
  sku: string | null;
  category_id: string | null;
  category_name: string | null;
  price: number;
  current_stock: number;
  low_stock_threshold: number | null;
  track_stock: boolean;
  has_variants: boolean;
  variants: Array<{
    id: string;
    name: string;
    stock_qty: number;
  }>;
}
