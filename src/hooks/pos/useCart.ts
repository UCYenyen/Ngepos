import { useState, useCallback } from 'react';
import type { CartItem, CartState } from '@/types/pos';

const DEFAULT_TAX_RATE = 0.1;

export function useCart(initialTaxRate: number = DEFAULT_TAX_RATE) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    discount_amount: 0,
    tax_rate: initialTaxRate,
    subtotal: 0,
    tax_amount: 0,
    total: 0,
  });

  const calculateTotals = useCallback(
    (
      items: CartItem[],
      discountAmount: number,
      taxRate: number
    ): Omit<CartState, 'items' | 'discount_amount' | 'tax_rate'> => {
      const subtotal = items.reduce(
        (sum, item) => sum + (item.price * item.quantity - item.discount_amount),
        0
      );
      const tax_amount = subtotal * taxRate;
      const total = subtotal + tax_amount;

      return {
        subtotal,
        tax_amount,
        total,
      };
    },
    []
  );

  const addItem = useCallback(
    (item: CartItem) => {
      setCart((prevCart) => {
        const existingItem = prevCart.items.find(
          (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
        );

        let newItems: CartItem[];
        if (existingItem) {
          newItems = prevCart.items.map((i) =>
            i.product_id === item.product_id && i.variant_id === item.variant_id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
        } else {
          newItems = [...prevCart.items, item];
        }

        const totals = calculateTotals(newItems, prevCart.discount_amount, prevCart.tax_rate);

        return {
          ...prevCart,
          items: newItems,
          ...totals,
        };
      });
    },
    [calculateTotals]
  );

  const updateItemQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      setCart((prevCart) => {
        let newItems: CartItem[];

        if (quantity <= 0) {
          newItems = prevCart.items.filter(
            (i) => !(i.product_id === productId && i.variant_id === variantId)
          );
        } else {
          newItems = prevCart.items.map((i) =>
            i.product_id === productId && i.variant_id === variantId ? { ...i, quantity } : i
          );
        }

        const totals = calculateTotals(newItems, prevCart.discount_amount, prevCart.tax_rate);

        return {
          ...prevCart,
          items: newItems,
          ...totals,
        };
      });
    },
    [calculateTotals]
  );

  const updateItemDiscount = useCallback(
    (productId: string, variantId: string | undefined, discountAmount: number) => {
      setCart((prevCart) => {
        const newItems = prevCart.items.map((i) =>
          i.product_id === productId && i.variant_id === variantId
            ? { ...i, discount_amount: Math.max(0, discountAmount) }
            : i
        );

        const totals = calculateTotals(newItems, prevCart.discount_amount, prevCart.tax_rate);

        return {
          ...prevCart,
          items: newItems,
          ...totals,
        };
      });
    },
    [calculateTotals]
  );

  const removeItem = useCallback(
    (productId: string, variantId: string | undefined) => {
      setCart((prevCart) => {
        const newItems = prevCart.items.filter(
          (i) => !(i.product_id === productId && i.variant_id === variantId)
        );
        const totals = calculateTotals(newItems, prevCart.discount_amount, prevCart.tax_rate);

        return {
          ...prevCart,
          items: newItems,
          ...totals,
        };
      });
    },
    [calculateTotals]
  );

  const setDiscount = useCallback(
    (discountAmount: number) => {
      setCart((prevCart) => {
        const totals = calculateTotals(
          prevCart.items,
          Math.max(0, discountAmount),
          prevCart.tax_rate
        );

        return {
          ...prevCart,
          discount_amount: Math.max(0, discountAmount),
          ...totals,
        };
      });
    },
    [calculateTotals]
  );

  const setTaxRate = useCallback(
    (taxRate: number) => {
      setCart((prevCart) => {
        const totals = calculateTotals(
          prevCart.items,
          prevCart.discount_amount,
          Math.max(0, taxRate)
        );

        return {
          ...prevCart,
          tax_rate: Math.max(0, taxRate),
          ...totals,
        };
      });
    },
    [calculateTotals]
  );

  const clear = useCallback(() => {
    setCart({
      items: [],
      discount_amount: 0,
      tax_rate: DEFAULT_TAX_RATE,
      subtotal: 0,
      tax_amount: 0,
      total: 0,
    });
  }, []);

  return {
    cart,
    addItem,
    updateItemQuantity,
    updateItemDiscount,
    removeItem,
    setDiscount,
    setTaxRate,
    clear,
  };
}
