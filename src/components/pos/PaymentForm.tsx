'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { PaymentMethod } from '@/types/pos';

interface PaymentFormProps {
  total: number;
  qrisImage?: string;
  onSubmit: (paymentMethod: PaymentMethod, amountReceived?: number, notes?: string) => void;
  loading?: boolean;
}

export function PaymentForm({ total, qrisImage, onSubmit, loading = false }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceived, setAmountReceived] = useState(0);
  const [notes, setNotes] = useState('');

  const change = amountReceived - total;

  function handleSubmit() {
    if (paymentMethod === 'cash' && amountReceived < total) {
      alert('Amount received is less than total');
      return;
    }

    onSubmit(paymentMethod, amountReceived, notes);
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="font-semibold text-lg mb-4">Payment Method</h3>
        <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="cursor-pointer">
                Cash
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="qris" id="qris" />
              <Label htmlFor="qris" className="cursor-pointer">
                QRIS
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gateway" id="gateway" />
              <Label htmlFor="gateway" className="cursor-pointer">
                Payment Gateway
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === 'cash' && (
        <div className="space-y-4 border-t pt-6">
          <div>
            <Label className="text-sm">Total Amount</Label>
            <div className="text-2xl font-bold text-blue-600">IDR {total.toLocaleString('id-ID')}</div>
          </div>

          <div>
            <Label htmlFor="amount" className="text-sm">
              Amount Received
            </Label>
            <Input
              id="amount"
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="text-lg"
            />
          </div>

          <div>
            <Label className="text-sm">Change</Label>
            <div className={`text-xl font-bold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              IDR {change.toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      )}

      {paymentMethod === 'qris' && (
        <div className="space-y-4 border-t pt-6">
          <div>
            <Label className="text-sm">Total Amount</Label>
            <div className="text-2xl font-bold text-blue-600">IDR {total.toLocaleString('id-ID')}</div>
          </div>

          {qrisImage ? (
            <div className="flex justify-center">
              <img src={qrisImage} alt="QRIS Code" className="w-48 h-48 border rounded" />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-sm text-yellow-800">
              No QRIS image configured. Please upload QRIS image in business settings.
            </div>
          )}

          <p className="text-sm text-slate-600 text-center">
            Customer scans QRIS code to pay. Click confirm when payment is received.
          </p>
        </div>
      )}

      {paymentMethod === 'gateway' && (
        <div className="space-y-4 border-t pt-6">
          <div>
            <Label className="text-sm">Total Amount</Label>
            <div className="text-2xl font-bold text-blue-600">IDR {total.toLocaleString('id-ID')}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-800">
            Payment will be processed through gateway. Customer will be directed to payment page after confirmation.
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="notes" className="text-sm">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add transaction notes..."
          rows={3}
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading} className="w-full text-lg py-6">
        {loading ? 'Processing...' : 'Confirm Payment'}
      </Button>
    </Card>
  );
}
