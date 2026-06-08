'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

type AdjustmentType = 'restock' | 'damage' | 'adjustment';

const SUCCESS_MESSAGE_DELAY_MS = 1000;

interface StockAdjustmentProps {
  businessId: string;
  productId: string;
  productName: string;
  currentStock: number;
  hasVariants: boolean;
  variants?: Array<{ id: string; name: string; stock_qty: number }>;
  onAdjustmentComplete?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function StockAdjustment({
  businessId,
  productId,
  productName,
  currentStock,
  hasVariants,
  variants = [],
  onAdjustmentComplete,
  open = false,
  onOpenChange,
}: StockAdjustmentProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('restock');
  const [selectedVariant, setSelectedVariant] = useState<string>(variants[0]?.id || '');
  const [quantity, setQuantity] = useState<string>('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const quantityNum = quantity ? parseInt(quantity) : 0;
  const selectedVariantStock = hasVariants && selectedVariant ? variants.find((v) => v.id === selectedVariant)?.stock_qty || 0 : currentStock;
  const willResultInNegative = adjustmentType === 'damage' && selectedVariantStock + quantityNum < 0;

  const canSubmit = () => {
    if (!quantity || quantityNum === 0) return false;
    if (adjustmentType === 'damage' && quantityNum > 0) return false;
    if (adjustmentType === 'restock' && quantityNum < 0) return false;
    if ((adjustmentType === 'damage' || adjustmentType === 'adjustment') && !note.trim()) return false;
    if (willResultInNegative && adjustmentType === 'damage') return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        businessId,
        productId,
        variantId: hasVariants ? selectedVariant : undefined,
        type: adjustmentType,
        quantity_change: quantityNum,
        note: note.trim() || null,
      };

      const response = await fetch('/api/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to adjust inventory: ${response.statusText}`);
      }

      setSuccess(true);
      setQuantity('');
      setNote('');
      setAdjustmentType('restock');

      setTimeout(() => {
        if (onOpenChange) {
          onOpenChange(false);
        }
        if (onAdjustmentComplete) {
          onAdjustmentComplete();
        }
      }, SUCCESS_MESSAGE_DELAY_MS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
      if (!newOpen) {
        setQuantity('');
        setNote('');
        setError(null);
        setSuccess(false);
        setAdjustmentType('restock');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adjust Stock: {productName}</DialogTitle>
          <DialogDescription>
            Current stock: {selectedVariantStock} unit{selectedVariantStock !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">Stock adjusted successfully!</AlertDescription>
            </Alert>
          )}

          {hasVariants && variants.length > 0 && (
            <div>
              <Label htmlFor="variant-select">Variant</Label>
              <Select value={selectedVariant} onValueChange={(value) => value && setSelectedVariant(value)} disabled={loading}>
                <SelectTrigger id="variant-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name} (Stock: {variant.stock_qty})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-base font-semibold mb-3 block">Adjustment Type</Label>
            <RadioGroup value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as AdjustmentType)} disabled={loading}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="restock" id="restock" />
                  <div className="flex-1">
                    <Label htmlFor="restock" className="font-semibold cursor-pointer">
                      Restock
                    </Label>
                    <p className="text-sm text-slate-600">Add stock to inventory</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="damage" id="damage" />
                  <div className="flex-1">
                    <Label htmlFor="damage" className="font-semibold cursor-pointer">
                      Damage
                    </Label>
                    <p className="text-sm text-slate-600">Remove damaged items from stock</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <RadioGroupItem value="adjustment" id="adjustment" />
                  <div className="flex-1">
                    <Label htmlFor="adjustment" className="font-semibold cursor-pointer">
                      Adjustment
                    </Label>
                    <p className="text-sm text-slate-600">Correct miscount or other discrepancies</p>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <p className="text-xs text-slate-600 mb-2">
              {adjustmentType === 'restock' && 'Enter positive number to add stock'}
              {adjustmentType === 'damage' && 'Enter negative number to remove damaged items'}
              {adjustmentType === 'adjustment' && 'Enter positive or negative number'}
            </p>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
              className={willResultInNegative ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {willResultInNegative && (
              <p className="text-sm text-red-600 mt-2">
                Warning: This adjustment would result in negative stock ({selectedVariantStock} + ({quantityNum}) = {selectedVariantStock + quantityNum})
              </p>
            )}
          </div>

          {(adjustmentType === 'damage' || adjustmentType === 'adjustment') && (
            <div>
              <Label htmlFor="note">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Input
                id="note"
                placeholder={
                  adjustmentType === 'damage'
                    ? 'e.g., Items expired, physical damage, theft...'
                    : 'e.g., Audit correction, system error, previous miscounting...'
                }
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-slate-600 mt-1">Required for audit trail</p>
            </div>
          )}

          {adjustmentType === 'restock' && (
            <div>
              <Label htmlFor="note">Reason (optional)</Label>
              <Input
                id="note"
                placeholder="e.g., Supplier delivery, customer return..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit() || loading}
              className="flex-1"
            >
              {loading ? 'Adjusting...' : 'Confirm Adjustment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
