import type { Transaction } from '@/types/pos';
import type { Business } from '@/types/business';

export interface ReceiptLineItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  discount_amount: number;
  subtotal: number;
}

export interface ReceiptProps {
  transaction: Transaction;
  items: ReceiptLineItem[];
  business: Business;
  amountReceived?: number;
  onClose: () => void;
}
