import type { Category, Product } from '@/types/product';

export interface ProductFormValues {
  name: string;
  sku: string;
  price: number;
  categoryId: string | null;
  track_stock: boolean;
  has_variants: boolean;
  stock_qty: number;
  low_stock_threshold: number | null;
}

export interface ProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  saving: boolean;
  onSubmit: (values: ProductFormValues) => void;
}
