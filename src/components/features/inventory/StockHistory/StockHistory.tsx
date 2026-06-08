'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_name: string | null;
  type: 'sale' | 'restock' | 'adjustment' | 'damage';
  quantity_change: number;
  note: string | null;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

interface StockHistoryProps {
  businessId: string;
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockHistory({
  businessId,
  productId,
  productName,
  open,
  onOpenChange,
}: StockHistoryProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/inventory/movements?businessId=${businessId}&productId=${productId}&limit=50`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch history: ${response.statusText}`);
        }
        const data = await response.json();
        setMovements(data.movements || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [open, businessId, productId]);

  const getMovementTypeLabel = (type: string): string => {
    switch (type) {
      case 'sale':
        return 'Sale';
      case 'restock':
        return 'Restock';
      case 'adjustment':
        return 'Adjustment';
      case 'damage':
        return 'Damage';
      default:
        return type;
    }
  };

  const getMovementTypeColor = (type: string): string => {
    switch (type) {
      case 'sale':
        return 'text-red-600 bg-red-50';
      case 'restock':
        return 'text-green-600 bg-green-50';
      case 'adjustment':
        return 'text-blue-600 bg-blue-50';
      case 'damage':
        return 'text-amber-600 bg-amber-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Stock History: {productName}</DialogTitle>
          <DialogDescription>
            Last 50 stock movements for this product
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {error && (
            <Alert className="border-red-200 bg-red-50 mb-4">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-600">Loading history...</p>
              </div>
            </div>
          ) : movements.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-600">No stock movements found for this product.</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              <div className="space-y-3 pb-4">
                {movements.map((movement) => (
                  <div
                    key={movement.id}
                    className="p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap',
                            getMovementTypeColor(movement.type)
                          )}
                        >
                          {getMovementTypeLabel(movement.type)}
                        </div>
                        <span className="text-sm font-semibold">
                          {movement.quantity_change > 0 ? '+' : ''}{movement.quantity_change}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatDate(movement.created_at)}
                      </span>
                    </div>

                    <div className="text-sm text-slate-700 mb-2">
                      <span className="font-medium">By: </span>
                      {movement.created_by_name}
                      {movement.variant_name && (
                        <>
                          {' '}
                          <span className="text-slate-600">
                            ({movement.variant_name})
                          </span>
                        </>
                      )}
                    </div>

                    {movement.note && (
                      <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                        <span className="font-medium">Note: </span>
                        {movement.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
