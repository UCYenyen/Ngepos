'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/inventory';
import { StockAdjustment } from './StockAdjustment';

interface StockListProps {
  businessId: string;
}

type SortBy = 'name' | 'stock' | 'category';
type FilterBy = 'all' | 'low-stock';

interface ExpandedProduct {
  [key: string]: boolean;
}

export function StockList({ businessId }: StockListProps) {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [expandedProducts, setExpandedProducts] = useState<ExpandedProduct>({});
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/inventory?businessId=${businessId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch inventory: ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [businessId]);

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/inventory?businessId=${businessId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.statusText}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current: number, threshold: number | null) => {
    if (threshold === null) return 'neutral';
    if (current <= threshold) return 'critical';
    if (current <= threshold * 1.5) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-amber-600 bg-amber-50';
      case 'good':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  let filtered = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const status = getStockStatus(product.current_stock, product.low_stock_threshold);
    const matchesFilter = filterBy === 'all' || (filterBy === 'low-stock' && status !== 'good');

    return matchesSearch && matchesFilter;
  });

  filtered = filtered.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'stock') {
      return b.current_stock - a.current_stock;
    } else {
      return (a.category_name || '').localeCompare(b.category_name || '');
    }
  });

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const handleAdjustStock = (product: InventoryProduct) => {
    setSelectedProduct(product);
    setAdjustmentOpen(true);
  };

  const handleAdjustmentComplete = async () => {
    setAdjustmentOpen(false);
    setSelectedProduct(null);
    await handleRetry();
  };

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading inventory...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRetry} variant="outline" className="w-full">
          Retry
        </Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-600">No products found for this business.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input
          placeholder="Search by name or SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="stock">Sort by Stock</SelectItem>
            <SelectItem value="category">Sort by Category</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterBy)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="low-stock">Low Stock Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="rounded-lg border">
        <div className="space-y-2 p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No products match your search.</p>
            </div>
          ) : (
            filtered.map((product) => {
              const status = getStockStatus(product.current_stock, product.low_stock_threshold);
              const isExpanded = expandedProducts[product.id];
              const statusColor = getStatusColor(status);
              const statusIcon = getStatusIcon(status);

              return (
                <Card key={product.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          {product.sku && <span className="text-xs text-slate-500">({product.sku})</span>}
                        </div>
                        {product.category_name && (
                          <p className="text-sm text-slate-600 mb-2">{product.category_name}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 mb-3">
                          <div>
                            <span className="text-xs text-slate-600">Price</span>
                            <p className="font-semibold text-sm">IDR {product.price.toLocaleString('id-ID')}</p>
                          </div>
                          <div>
                            <span className="text-xs text-slate-600">Current Stock</span>
                            <p className="font-semibold text-sm">{product.current_stock}</p>
                          </div>
                          {product.low_stock_threshold !== null && (
                            <div>
                              <span className="text-xs text-slate-600">Threshold</span>
                              <p className="font-semibold text-sm">{product.low_stock_threshold}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-xs text-slate-600">Status</span>
                            <div className={cn('flex items-center gap-1 mt-0.5 w-fit px-2 py-1 rounded text-xs font-medium', statusColor)}>
                              {statusIcon}
                              <span className="capitalize">{status}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAdjustStock(product)}
                        >
                          Adjust Stock
                        </Button>
                        {product.has_variants && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleExpand(product.id)}
                            className="w-full"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </div>

                    {product.has_variants && isExpanded && product.variants.length > 0 && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <p className="text-xs font-semibold text-slate-600 uppercase">Variants</p>
                        {product.variants.map((variant) => (
                          <div key={variant.id} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
                            <span>{variant.name}</span>
                            <span className="font-semibold">{variant.stock_qty} units</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {selectedProduct && (
        <StockAdjustment
          businessId={businessId}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          currentStock={selectedProduct.current_stock}
          hasVariants={selectedProduct.has_variants}
          variants={selectedProduct.variants}
          onAdjustmentComplete={handleAdjustmentComplete}
          open={adjustmentOpen}
          onOpenChange={setAdjustmentOpen}
        />
      )}
    </div>
  );
}
