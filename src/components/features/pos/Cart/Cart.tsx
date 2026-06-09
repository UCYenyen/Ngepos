'use client';

import { Minus, Plus, ShoppingCart, Trash2, Wallet } from 'lucide-react';
import { TableSelect } from '../TableSelect/TableSelect';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { BusinessType } from '@/types/business';
import type { CartItem, CartState, Table } from '@/types/pos';

interface CartProps {
  cart: CartState;
  businessType: BusinessType;
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (tableId: string | null) => void;
  onUpdateQuantity: (
    productId: string,
    variantId: string | undefined,
    quantity: number
  ) => void;
  onRemoveItem: (productId: string, variantId: string | undefined) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export function Cart({
  cart,
  businessType,
  tables,
  selectedTableId,
  onSelectTable,
  onUpdateQuantity,
  onRemoveItem,
  onClear,
  onCheckout,
}: CartProps) {
  const empty = cart.items.length === 0;
  const itemDiscount = cart.items.reduce(
    (sum, item) => sum + item.discount_amount,
    0
  );
  const gross = cart.subtotal + itemDiscount;

  return (
    <aside className="flex h-full w-95 shrink-0 flex-col border-l border-hairline bg-surface-1">
      <div className="flex items-center justify-between border-b border-hairline-soft px-4.5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-semibold text-ink">Pesanan</span>
          {!empty && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-xs font-semibold text-surface-1">
              {cart.items.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={empty}
          aria-label="Kosongkan keranjang"
          className="btn-icon size-8 text-ink-subtle hover:text-error disabled:opacity-40"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {businessType === 'fnb' && (
        <div className="border-b border-hairline-soft px-4.5 py-3">
          <TableSelect
            tables={tables}
            selectedTableId={selectedTableId}
            onSelect={onSelectTable}
          />
        </div>
      )}

      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-ink-tertiary">
          <ShoppingCart className="size-10" strokeWidth={1.4} />
          <span className="text-sm font-medium text-ink-subtle">
            Keranjang kosong
          </span>
          <span className="max-w-50 text-[12.5px]">
            Pilih produk di sebelah kiri untuk memulai transaksi.
          </span>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4.5 py-4">
          {cart.items.map((item) => (
            <CartLine
              key={`${item.product_id}-${item.variant_id ?? ''}`}
              item={item}
              onDecrease={() =>
                onUpdateQuantity(
                  item.product_id,
                  item.variant_id,
                  item.quantity - 1
                )
              }
              onIncrease={() =>
                onUpdateQuantity(
                  item.product_id,
                  item.variant_id,
                  item.quantity + 1
                )
              }
              onRemove={() => onRemoveItem(item.product_id, item.variant_id)}
            />
          ))}
        </div>
      )}

      <div className="border-t border-hairline-soft p-4.5">
        <div className="mb-3.5 flex flex-col gap-2">
          <TotalRow label="Subtotal" value={formatCurrency(gross)} />
          <TotalRow
            label="Diskon"
            value={itemDiscount ? `−${formatCurrency(itemDiscount)}` : formatCurrency(0)}
            valueClassName={itemDiscount ? 'text-success' : undefined}
          />
          <TotalRow
            label={`Pajak (${Math.round(cart.tax_rate * 100)}%)`}
            value={formatCurrency(cart.tax_amount)}
          />
          <div className="my-1 border-t border-hairline-soft" />
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-ink">Total</span>
            <span className="font-mono text-[21px] font-bold tabular-nums text-ink">
              {formatCurrency(cart.total)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCheckout}
          disabled={empty}
          className="btn-accent h-12 w-full gap-2 text-base disabled:opacity-50"
        >
          <Wallet className="size-5" />
          Bayar{!empty && ` · ${formatCurrency(cart.total)}`}
        </button>
      </div>
    </aside>
  );
}

interface TotalRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function TotalRow({ label, value, valueClassName }: TotalRowProps) {
  return (
    <div className="flex items-center justify-between text-[13.5px]">
      <span className="text-ink-muted">{label}</span>
      <span
        className={cn('font-mono tabular-nums text-ink-muted', valueClassName)}
      >
        {value}
      </span>
    </div>
  );
}

interface CartLineProps {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
}

function CartLine({ item, onDecrease, onIncrease, onRemove }: CartLineProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="size-10 shrink-0 rounded-md bg-surface-2" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13px] font-semibold text-ink">{item.name}</span>
          <span className="font-mono text-[13px] font-semibold tabular-nums text-ink">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDecrease}
              aria-label="Kurangi"
              className="flex size-6 items-center justify-center rounded-md border border-hairline text-ink-muted transition-colors hover:bg-surface-2"
            >
              <Minus className="size-3" />
            </button>
            <span className="min-w-4 text-center font-mono text-[13px] font-semibold tabular-nums text-ink">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={onIncrease}
              aria-label="Tambah"
              className="flex size-6 items-center justify-center rounded-md border border-hairline text-ink-muted transition-colors hover:bg-surface-2"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-[11.5px] text-ink-subtle transition-colors hover:text-error"
          >
            <Trash2 className="size-3" />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
