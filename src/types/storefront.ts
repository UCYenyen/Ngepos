// src/types/storefront.ts
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface OnlineOrderItem {
  product_id: string;
  name: string;
  variant_id?: string | null;
  variant_name?: string | null;
  qty: number;
  unit_price: number;
  line_total: number;
}

export interface OnlineOrder {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: OnlineOrderItem[];
  subtotal: number;
  total: number;
  note?: string | null;
  status: OrderStatus;
  created_at: string;
}

export interface StorefrontBusiness {
  id: string;
  name: string;
  type: 'retail' | 'fnb';
  logo_url?: string | null;
  subdomain: string;
}
