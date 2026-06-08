// src/types/product.ts
export interface Category {
  id: string;
  business_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_modifier: number;
  sku?: string;
  stock_qty: number;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id?: string;
  name: string;
  sku?: string;
  price: number;
  image_url?: string;
  has_variants: boolean;
  track_stock: boolean;
  created_at: string;
}

export interface ProductWithVariants extends Product {
  variants?: ProductVariant[];
}
