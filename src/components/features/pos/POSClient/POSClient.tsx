'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/pos/useCart';
import { ProductSelector } from '../ProductSelector/ProductSelector';
import { Cart } from '../Cart/Cart';
import { PaymentForm } from '../PaymentForm/PaymentForm';
import { Receipt } from '../Receipt/Receipt';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Business } from '@/types/business';
import type { CartItem, PaymentMethod, Transaction, TransactionItem } from '@/types/pos';

interface POSClientProps {
  businessId: string;
  business: Business;
}

export default function POSClient({ businessId, business }: POSClientProps) {
  const cart = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState<(Transaction & { transaction_items: TransactionItem[] }) | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePayment(paymentMethod: PaymentMethod, amountReceived?: number, notes?: string) {
    setLoading(true);

    try {
      const payload = {
        businessId,
        items: cart.cart.items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          discount_amount: item.discount_amount,
          subtotal: item.price * item.quantity - item.discount_amount,
        })),
        subtotal: cart.cart.subtotal,
        discount_amount: cart.cart.discount_amount,
        tax_amount: cart.cart.tax_amount,
        total: cart.cart.total,
        payment_method: paymentMethod,
        notes,
      };

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const transaction = await response.json();

      const transactionWithItems = {
        ...transaction,
        transaction_items: payload.items,
      };

      setReceipt(transactionWithItems);
      setShowPayment(false);
      setShowReceipt(true);
      cart.clear();
    } catch (error) {
      console.error('Payment error:', error);
      alert(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <p className="text-slate-600 capitalize">{business.type}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Items in Cart</div>
          <div className="text-2xl font-bold">{cart.cart.items.length}</div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col">
          <ProductSelector businessId={businessId} onSelectProduct={cart.addItem} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 overflow-auto">
            <Cart
              cart={cart.cart}
              onUpdateQuantity={cart.updateItemQuantity}
              onUpdateDiscount={cart.updateItemDiscount}
              onRemoveItem={cart.removeItem}
              onSetDiscount={cart.setDiscount}
              onSetTaxRate={cart.setTaxRate}
            />
          </div>

          {cart.cart.items.length > 0 && (
            <button
              onClick={() => setShowPayment(true)}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition"
            >
              Proceed to Payment
            </button>
          )}
        </div>
      </div>

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm total={cart.cart.total} onSubmit={handlePayment} loading={loading} />
        </DialogContent>
      </Dialog>

      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {receipt && <Receipt transaction={receipt} business={business} onClose={() => setShowReceipt(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
