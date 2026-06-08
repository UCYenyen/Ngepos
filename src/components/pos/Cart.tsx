'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import type { CartState } from '@/types/pos';

interface CartProps {
  cart: CartState;
  onUpdateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  onUpdateDiscount: (productId: string, variantId: string | undefined, discountAmount: number) => void;
  onRemoveItem: (productId: string, variantId: string | undefined) => void;
  onSetDiscount: (discountAmount: number) => void;
  onSetTaxRate: (taxRate: number) => void;
}

export function Cart({
  cart,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemoveItem,
  onSetDiscount,
  onSetTaxRate,
}: CartProps) {
  if (cart.items.length === 0) {
    return (
      <Card className="p-6 text-center text-slate-500">
        <p>Cart is empty</p>
        <p className="text-sm">Select products to add them to cart</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-4">
          {cart.items.map((item) => (
            <Card key={`${item.product_id}-${item.variant_id}`} className="p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  {item.variant_id && (
                    <p className="text-xs text-slate-500">Variant: {item.variant_id}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.product_id, item.variant_id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="text-xs text-slate-600">Qty</label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateQuantity(item.product_id, item.variant_id, parseInt(e.target.value) || 0)
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Price</label>
                  <div className="h-8 flex items-center text-sm font-semibold">
                    IDR {item.price.toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-600">Subtotal</label>
                  <div className="h-8 flex items-center text-sm font-bold text-blue-600">
                    IDR {(item.price * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600">Item Discount</label>
                <Input
                  type="number"
                  min="0"
                  value={item.discount_amount}
                  onChange={(e) =>
                    onUpdateDiscount(item.product_id, item.variant_id, parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="h-8 text-sm"
                />
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-600">Cart Discount</label>
          <Input
            type="number"
            min="0"
            value={cart.discount_amount}
            onChange={(e) => onSetDiscount(parseFloat(e.target.value) || 0)}
            placeholder="0"
            className="h-8"
          />
        </div>

        <div>
          <label className="text-xs text-slate-600">Tax Rate (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={cart.tax_rate * 100}
            onChange={(e) => onSetTaxRate(parseFloat(e.target.value) / 100 || 0)}
            className="h-8"
          />
        </div>

        <div className="space-y-2 bg-slate-100 p-3 rounded">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>IDR {cart.subtotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Item Discount:</span>
            <span className="text-red-600">
              -IDR {cart.items.reduce((sum, i) => sum + i.discount_amount, 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Cart Discount:</span>
            <span className="text-red-600">-IDR {cart.discount_amount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({(cart.tax_rate * 100).toFixed(1)}%):</span>
            <span>IDR {cart.tax_amount.toLocaleString('id-ID')}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span className="text-blue-600">IDR {cart.total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
