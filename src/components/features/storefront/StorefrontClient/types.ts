import type { StorefrontBusiness } from '@/types/storefront';
import type { Category, Product, ProductVariant } from '@/types/product';

export interface StorefrontClientProps {
  subdomain: string;
  business: StorefrontBusiness;
  categories: Category[];
  products: Product[];
  variants: ProductVariant[];
}

export interface CartLine {
  key: string;
  product: Product;
  variant: ProductVariant | null;
  qty: number;
  unitPrice: number;
}
