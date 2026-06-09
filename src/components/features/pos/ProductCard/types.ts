import type { Product } from '@/types/product';

export interface ProductCardProps {
  product: Product;
  categoryColor?: string;
  onSelect: (product: Product) => void;
}
