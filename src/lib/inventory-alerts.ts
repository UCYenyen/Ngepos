import type { InventoryProduct } from '@/types/inventory';

export function isLowStock(currentStock: number, threshold: number | null): boolean {
  return threshold !== null && currentStock <= threshold;
}

export function getLowStockItems(products: InventoryProduct[]): InventoryProduct[] {
  return products.filter(
    (product) => product.track_stock && isLowStock(product.current_stock, product.low_stock_threshold)
  );
}
