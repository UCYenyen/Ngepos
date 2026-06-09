// src/types/pos.ts
export type PaymentMethod = 'cash' | 'qris' | 'gateway';
export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface CartItem {
  product_id: string;
  variant_id?: string;
  name: string;
  price: number;
  quantity: number;
  discount_amount: number;
}

export interface CartState {
  items: CartItem[];
  discount_amount: number;
  tax_rate: number;
  subtotal: number;
  tax_amount: number;
  total: number;
}

export interface Transaction {
  id: string;
  business_id: string;
  cashier_id: string;
  table_id?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  gateway_reference?: string;
  notes?: string;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  variant_id?: string;
  name: string;
  price: number;
  quantity: number;
  discount_amount: number;
  subtotal: number;
  created_at: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved';

export interface Table {
  id: string;
  business_id: string;
  name: string;
  capacity?: number | null;
  status: TableStatus;
  created_at: string;
}

export type TableOrderStatus =
  | 'pending'
  | 'in_progress'
  | 'served'
  | 'paid'
  | 'cancelled';

export interface TableOrder {
  id: string;
  table_id: string;
  transaction_id?: string;
  status: TableOrderStatus;
  items?: CartItem[];
  opened_at: string;
  closed_at?: string;
  created_at: string;
}

export interface OpenTableOrder {
  id: string;
  table_id: string;
  items: CartItem[];
  opened_at: string;
}

export interface ParkedOrder {
  id: string;
  business_id: string;
  label: string | null;
  items: CartItem[];
  created_at: string;
}
