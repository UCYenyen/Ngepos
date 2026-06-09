'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/hooks/pos/useCart';
import { ProductSelector } from '../ProductSelector/ProductSelector';
import { Cart } from '../Cart/Cart';
import { PaymentForm } from '../PaymentForm/PaymentForm';
import { Receipt } from '../Receipt/Receipt';
import { VariantPicker } from '../VariantPicker/VariantPicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Business } from '@/types/business';
import type {
  OpenTableOrder,
  PaymentMethod,
  Table,
  Transaction,
} from '@/types/pos';
import type { Product, ProductVariant } from '@/types/product';
import type { ReceiptLineItem } from '../Receipt/types';

interface POSClientProps {
  businessId: string;
  business: Business;
  paymentGatewayEnabled: boolean;
}

interface ReceiptData {
  transaction: Transaction;
  items: ReceiptLineItem[];
  amountReceived?: number;
  tableName?: string;
}

export default function POSClient({
  businessId,
  business,
  paymentGatewayEnabled,
}: POSClientProps) {
  const cart = useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [openOrders, setOpenOrders] = useState<Record<string, OpenTableOrder>>(
    {}
  );
  const [openTabsEnabled, setOpenTabsEnabled] = useState(false);
  const [activeTableOrderId, setActiveTableOrderId] = useState<string | null>(
    null
  );
  const [savingTab, setSavingTab] = useState(false);

  useEffect(() => {
    if (business.type !== 'fnb') return;
    let alive = true;
    (async () => {
      try {
        const [tablesRes, ordersRes] = await Promise.all([
          fetch(`/api/tables?businessId=${businessId}`),
          fetch(`/api/table-orders?businessId=${businessId}`),
        ]);
        if (tablesRes.ok) {
          const data = (await tablesRes.json()) as Table[];
          if (alive) setTables(data);
        }
        if (ordersRes.ok) {
          const orders = (await ordersRes.json()) as OpenTableOrder[];
          if (alive) {
            setOpenTabsEnabled(true);
            setOpenOrders(
              Object.fromEntries(orders.map((order) => [order.table_id, order]))
            );
          }
        } else if (ordersRes.status === 501 && alive) {
          setOpenTabsEnabled(false);
        }
      } catch {
        if (alive) setTables([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, [business.type, businessId]);

  function selectTable(tableId: string | null) {
    setSelectedTableId(tableId);
    if (!tableId) {
      setActiveTableOrderId(null);
      return;
    }
    const order = openOrders[tableId];
    if (order) {
      cart.loadItems(order.items);
      setActiveTableOrderId(order.id);
    } else {
      setActiveTableOrderId(null);
    }
  }

  async function handleSaveTab() {
    if (!selectedTableId || cart.cart.items.length === 0) return;
    setSavingTab(true);
    try {
      const response = await fetch('/api/table-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTableId,
          items: cart.cart.items,
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal menyimpan pesanan');
      }
      const order = (await response.json()) as OpenTableOrder;
      setOpenOrders((prev) => ({ ...prev, [order.table_id]: order }));
      toast.success('Pesanan meja disimpan');
      cart.clear();
      setSelectedTableId(null);
      setActiveTableOrderId(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menyimpan pesanan'
      );
    } finally {
      setSavingTab(false);
    }
  }

  function selectProduct(product: Product) {
    if (product.has_variants) {
      setVariantProduct(product);
      return;
    }
    cart.addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      discount_amount: 0,
    });
  }

  function addVariant(product: Product, variant: ProductVariant) {
    cart.addItem({
      product_id: product.id,
      variant_id: variant.id,
      name: `${product.name} · ${variant.name}`,
      price: product.price + variant.price_modifier,
      quantity: 1,
      discount_amount: 0,
    });
    setVariantProduct(null);
  }

  async function handlePayment(
    paymentMethod: PaymentMethod,
    amountReceived?: number
  ) {
    setLoading(true);
    try {
      const items: ReceiptLineItem[] = cart.cart.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        discount_amount: item.discount_amount,
        subtotal: item.price * item.quantity - item.discount_amount,
      }));

      const payload = {
        businessId,
        items: cart.cart.items.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id ?? null,
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
        notes: null,
        tableId: selectedTableId,
        tableOrderId: activeTableOrderId,
      };

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? 'Gagal membuat transaksi');
      }

      const transaction = (await response.json()) as Transaction;

      setReceipt({
        transaction,
        items,
        amountReceived,
        tableName: tables.find((table) => table.id === selectedTableId)?.name,
      });
      setShowPayment(false);
      cart.clear();
      if (selectedTableId) {
        setOpenOrders((prev) => {
          const next = { ...prev };
          delete next[selectedTableId];
          return next;
        });
      }
      setSelectedTableId(null);
      setActiveTableOrderId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Pembayaran gagal');
    } finally {
      setLoading(false);
    }
  }

  const openTableIds = new Set(Object.keys(openOrders));

  return (
    <div className="flex h-full min-h-0">
      <ProductSelector businessId={businessId} onSelectProduct={selectProduct} />
      <Cart
        cart={cart.cart}
        businessType={business.type}
        tables={tables}
        selectedTableId={selectedTableId}
        openOrderTableIds={openTableIds}
        openTabsEnabled={openTabsEnabled}
        savingTab={savingTab}
        onSelectTable={selectTable}
        onSaveTab={handleSaveTab}
        onUpdateQuantity={cart.updateItemQuantity}
        onRemoveItem={cart.removeItem}
        onClear={cart.clear}
        onCheckout={() => setShowPayment(true)}
      />

      <VariantPicker
        product={variantProduct}
        onPick={addVariant}
        onOpenChange={(open) => {
          if (!open) setVariantProduct(null);
        }}
      />

      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-115">
          <DialogHeader>
            <DialogTitle>Pembayaran</DialogTitle>
          </DialogHeader>
          <PaymentForm
            total={cart.cart.total}
            paymentGatewayEnabled={paymentGatewayEnabled}
            qrisImage={business.qris_image_url ?? undefined}
            onSubmit={handlePayment}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={receipt !== null}
        onOpenChange={(open) => {
          if (!open) setReceipt(null);
        }}
      >
        <DialogContent className="sm:max-w-115">
          <DialogHeader>
            <DialogTitle className="sr-only">Struk pembayaran</DialogTitle>
          </DialogHeader>
          {receipt && (
            <Receipt
              transaction={receipt.transaction}
              items={receipt.items}
              business={business}
              amountReceived={receipt.amountReceived}
              tableName={receipt.tableName}
              onClose={() => setReceipt(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
